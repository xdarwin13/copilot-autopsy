/**
 * Quality Analyzer
 * Analyzes code quality issues using Copilot CLI
 */

import { buildQualityPrompt } from '../prompts/templates.js';

export class QualityAnalyzer {
    async analyze(context, copilot, depth, onProgress) {
        const findings = [];
        const filesToAnalyze = this.selectFiles(context.keyFiles, depth);

        for (let i = 0; i < filesToAnalyze.length; i++) {
            const file = filesToAnalyze[i];
            onProgress(`Analyzing ${file.name} (${i + 1}/${filesToAnalyze.length})`);

            try {
                const prompt = buildQualityPrompt(file, context);
                const response = await copilot.query(prompt);
                const parsed = this.parseResponse(response, file);
                findings.push(...parsed);
            } catch (e) {
                // Skip file on error
            }
        }

        return findings;
    }

    selectFiles(keyFiles, depth) {
        const maxFiles = depth === 'quick' ? 3 : depth === 'deep' ? 15 : 8;
        // Exclude test files for quality analysis
        return keyFiles
            .filter(f => !f.isTest)
            .slice(0, maxFiles);
    }

    parseResponse(response, file) {
        const findings = [];

        if (typeof response === 'string') {
            if (response.includes('NO_ISSUES_FOUND')) return [];

            // Parse line-by-line format: [QUAL-NNN] SEVERITY | LINE | Description | Why | Fix
            const lines = response.split('\n').filter(l => l.startsWith('[QUAL-'));

            for (const line of lines) {
                const match = line.match(/\[(QUAL-\d+)\]\s*(\w+)\s*\|\s*(\d+)?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/i);

                if (match) {
                    findings.push({
                        id: match[1],
                        category: 'quality',
                        severity: match[2].toLowerCase(),
                        line: parseInt(match[3]) || null,
                        file: file.relativePath,
                        location: file.relativePath,
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
