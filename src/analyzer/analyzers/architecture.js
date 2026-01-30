/**
 * Architecture Analyzer
 * Analyzes project structure and architectural issues using Copilot CLI
 */

import { buildArchitecturePrompt } from '../prompts/templates.js';

export class ArchitectureAnalyzer {
    async analyze(context, copilot, depth, onProgress) {
        onProgress('Analyzing project structure...');

        const findings = [];

        try {
            const prompt = buildArchitecturePrompt(context);
            const response = await copilot.query(prompt);
            const parsed = this.parseResponse(response);
            findings.push(...parsed);
        } catch (e) {
            // Architecture analysis failed
        }

        // Additional analysis for large projects
        if (depth === 'deep' && context.keyFiles.length > 20) {
            onProgress('Deep dependency analysis...');
            const depFindings = await this.analyzeDependencies(context, copilot);
            findings.push(...depFindings);
        }

        return findings;
    }

    async analyzeDependencies(context, copilot) {
        const findings = [];

        // Build import/export map from key files
        const importMap = this.buildImportMap(context.keyFiles);

        if (Object.keys(importMap).length > 5) {
            const prompt = `Analyze these import relationships for circular dependencies and coupling issues:
${JSON.stringify(importMap, null, 2).substring(0, 3000)}

For EACH issue found, respond in this EXACT format (one per line):
[ARCH-NNN] SEVERITY | LOCATION | Description | Impact | Suggestion

If no issues, respond: NO_ISSUES_FOUND`;

            try {
                const response = await copilot.query(prompt);
                const parsed = this.parseResponse(response);
                findings.push(...parsed);
            } catch (e) {
                // Skip on error
            }
        }

        return findings;
    }

    buildImportMap(files) {
        const importMap = {};

        for (const file of files) {
            if (!file.content) continue;

            const imports = [];

            // Match ES6 imports
            const es6Matches = file.content.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
            for (const match of es6Matches) {
                imports.push(match[1]);
            }

            // Match CommonJS requires
            const cjsMatches = file.content.matchAll(/require\s*\(\s*['"](.+?)['"]\s*\)/g);
            for (const match of cjsMatches) {
                imports.push(match[1]);
            }

            if (imports.length > 0) {
                importMap[file.relativePath] = imports.filter(i => i.startsWith('.'));
            }
        }

        return importMap;
    }

    parseResponse(response) {
        const findings = [];

        if (typeof response === 'string') {
            if (response.includes('NO_ISSUES_FOUND')) return [];

            // Parse: [ARCH-NNN] SEVERITY | LOCATION | Description | Impact | Suggestion
            const lines = response.split('\n').filter(l => l.startsWith('[ARCH-'));

            for (const line of lines) {
                const match = line.match(/\[(ARCH-\d+)\]\s*(\w+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/i);

                if (match) {
                    findings.push({
                        id: match[1],
                        category: 'architecture',
                        severity: match[2].toLowerCase(),
                        location: match[3].trim(),
                        title: match[4].trim(),
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
