/**
 * Testing Analyzer
 * Analyzes test coverage gaps using Copilot CLI
 */

import { buildTestingPrompt } from '../prompts/templates.js';

export class TestingAnalyzer {
    async analyze(context, copilot, depth, onProgress) {
        const findings = [];

        // Find source files and their corresponding test files
        const sourceFiles = context.keyFiles.filter(f => !f.isTest);
        const testFiles = context.keyFiles.filter(f => f.isTest);

        // Match source files to test files
        const pairs = this.matchSourceToTest(sourceFiles, testFiles);

        const pairsToAnalyze = depth === 'quick' ? pairs.slice(0, 2) :
            depth === 'deep' ? pairs.slice(0, 8) :
                pairs.slice(0, 5);

        for (let i = 0; i < pairsToAnalyze.length; i++) {
            const { source, test } = pairsToAnalyze[i];
            onProgress(`Analyzing ${source.name} (${i + 1}/${pairsToAnalyze.length})`);

            try {
                const prompt = buildTestingPrompt(source, test, context);
                const response = await copilot.query(prompt);
                const parsed = this.parseResponse(response, source);
                findings.push(...parsed);
            } catch (e) {
                // Skip on error
            }
        }

        // Check for completely untested files
        const untestedFindings = this.findUntestedFiles(sourceFiles, testFiles);
        findings.push(...untestedFindings);

        return findings;
    }

    matchSourceToTest(sourceFiles, testFiles) {
        const pairs = [];

        for (const source of sourceFiles) {
            // Try to find matching test file
            const baseName = source.name.replace(/\.(js|ts|jsx|tsx)$/, '');

            const matchingTest = testFiles.find(t =>
                t.name.includes(baseName) &&
                (t.name.includes('.test.') || t.name.includes('.spec.'))
            );

            pairs.push({
                source,
                test: matchingTest || null
            });
        }

        // Sort by untested first (more interesting)
        pairs.sort((a, b) => {
            if (!a.test && b.test) return -1;
            if (a.test && !b.test) return 1;
            return 0;
        });

        return pairs;
    }

    findUntestedFiles(sourceFiles, testFiles) {
        const findings = [];
        const testFileNames = testFiles.map(t => t.name.toLowerCase());

        for (const source of sourceFiles) {
            const baseName = source.name.replace(/\.(js|ts|jsx|tsx)$/, '').toLowerCase();

            const hasTest = testFileNames.some(t =>
                t.includes(baseName) &&
                (t.includes('.test.') || t.includes('.spec.'))
            );

            if (!hasTest) {
                // Check if this file looks important
                const importantPatterns = ['service', 'controller', 'api', 'handler', 'utils', 'helpers'];
                const isImportant = importantPatterns.some(p => source.name.toLowerCase().includes(p));

                if (isImportant) {
                    findings.push({
                        id: `TEST-${findings.length + 1}`.padStart(8, '0').replace('TEST-', 'TEST-'),
                        category: 'testing',
                        severity: 'high',
                        file: source.relativePath,
                        location: source.relativePath,
                        title: `No tests for ${source.name}`,
                        description: `Important file ${source.name} appears to have no corresponding test file`,
                        why: 'Untested code increases risk of regressions and bugs in production',
                        suggestion: `Create ${source.name.replace(/\.(js|ts|jsx|tsx)$/, '.test$&')} with unit tests`
                    });
                }
            }
        }

        return findings.slice(0, 5); // Limit to 5 untested file warnings
    }

    parseResponse(response, sourceFile) {
        const findings = [];

        if (typeof response === 'string') {
            if (response.includes('NO_ISSUES_FOUND')) return [];

            // Parse: [TEST-NNN] SEVERITY | FUNCTION | What's missing | Why | Example
            const lines = response.split('\n').filter(l => l.startsWith('[TEST-'));

            for (const line of lines) {
                const match = line.match(/\[(TEST-\d+)\]\s*(\w+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/i);

                if (match) {
                    findings.push({
                        id: match[1],
                        category: 'testing',
                        severity: match[2].toLowerCase(),
                        function: match[3].trim(),
                        file: sourceFile.relativePath,
                        location: `${sourceFile.relativePath}::${match[3].trim()}`,
                        title: `Missing test for ${match[3].trim()}`,
                        description: match[4].trim(),
                        why: match[5].trim(),
                        suggestion: match[6].trim()
                    });
                }
            }
        }

        return findings;
    }
}
