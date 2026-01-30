/**
 * Security Analyzer
 * Analyzes security vulnerabilities using Copilot CLI
 */

import { buildSecurityPrompt } from '../prompts/templates.js';

export class SecurityAnalyzer {
    async analyze(context, copilot, depth, onProgress) {
        const findings = [];
        const filesToAnalyze = this.selectFiles(context.keyFiles, depth);

        for (let i = 0; i < filesToAnalyze.length; i++) {
            const file = filesToAnalyze[i];
            onProgress(`Scanning ${file.name} (${i + 1}/${filesToAnalyze.length})`);

            try {
                const prompt = buildSecurityPrompt(file, context);
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

        // Prioritize files that are more likely to have security issues
        const priorityPatterns = ['auth', 'user', 'login', 'api', 'route', 'controller', 'handler', 'middleware'];

        const sorted = [...keyFiles].sort((a, b) => {
            const aScore = priorityPatterns.filter(p => a.name.toLowerCase().includes(p)).length;
            const bScore = priorityPatterns.filter(p => b.name.toLowerCase().includes(p)).length;
            return bScore - aScore;
        });

        return sorted.filter(f => !f.isTest).slice(0, maxFiles);
    }

    parseResponse(response, file) {
        const findings = [];

        if (typeof response === 'string') {
            if (response.includes('NO_ISSUES_FOUND')) return [];

            // Parse: [SEC-NNN] SEVERITY | LINE | CWE-ID | Description | Risk | Fix
            const lines = response.split('\n').filter(l => l.startsWith('[SEC-'));

            for (const line of lines) {
                const match = line.match(/\[(SEC-\d+)\]\s*(\w+)\s*\|\s*(\d+)?\s*\|\s*(CWE-\d+)?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/i);

                if (match) {
                    findings.push({
                        id: match[1],
                        category: 'security',
                        severity: match[2].toLowerCase(),
                        line: parseInt(match[3]) || null,
                        cwe: match[4] || null,
                        file: file.relativePath,
                        location: file.relativePath,
                        title: match[5].trim(),
                        description: match[5].trim(),
                        why: match[6].trim(),
                        suggestion: match[7].trim()
                    });
                }
            }
        }

        return findings;
    }
}
