/**
 * Documentation Analyzer
 * Analyzes documentation quality using Copilot CLI
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { buildDocumentationPrompt } from '../prompts/templates.js';

export class DocumentationAnalyzer {
    async analyze(context, copilot, depth, onProgress) {
        const findings = [];

        onProgress('Analyzing documentation...');

        // Read README if exists
        const readme = this.findReadme(context.path);

        try {
            const prompt = buildDocumentationPrompt(context, readme);
            const response = await copilot.query(prompt);
            const parsed = this.parseResponse(response);
            findings.push(...parsed);
        } catch (e) {
            // Documentation analysis failed
        }

        // Additional checks
        const additionalFindings = this.checkDocumentationBasics(context, readme);
        findings.push(...additionalFindings);

        return findings;
    }

    findReadme(targetPath) {
        const readmeNames = ['README.md', 'readme.md', 'Readme.md', 'README.MD', 'README'];

        for (const name of readmeNames) {
            const path = join(targetPath, name);
            if (existsSync(path)) {
                try {
                    return {
                        path,
                        name,
                        content: readFileSync(path, 'utf-8')
                    };
                } catch (e) {
                    return null;
                }
            }
        }

        return null;
    }

    checkDocumentationBasics(context, readme) {
        const findings = [];
        let idCounter = 1;

        // Check for README
        if (!readme) {
            findings.push({
                id: `DOC-${String(idCounter++).padStart(3, '0')}`,
                category: 'documentation',
                severity: 'high',
                location: 'project root',
                title: 'Missing README.md',
                description: 'No README file found in project root',
                why: 'README is essential for onboarding and project understanding',
                suggestion: 'Create a README.md with project description, installation, and usage instructions'
            });
        } else {
            // Check README content
            const content = readme.content.toLowerCase();

            if (!content.includes('install') && !content.includes('setup')) {
                findings.push({
                    id: `DOC-${String(idCounter++).padStart(3, '0')}`,
                    category: 'documentation',
                    severity: 'medium',
                    location: 'README.md',
                    title: 'Missing installation instructions',
                    description: 'README does not contain installation or setup instructions',
                    why: 'New developers cannot easily get started',
                    suggestion: 'Add ## Installation section with step-by-step setup guide'
                });
            }

            if (!content.includes('usage') && !content.includes('example') && !content.includes('getting started')) {
                findings.push({
                    id: `DOC-${String(idCounter++).padStart(3, '0')}`,
                    category: 'documentation',
                    severity: 'medium',
                    location: 'README.md',
                    title: 'Missing usage examples',
                    description: 'README does not contain usage examples',
                    why: 'Users need to see how to use the project',
                    suggestion: 'Add ## Usage section with code examples'
                });
            }
        }

        // Check for LICENSE
        const licenseExists = existsSync(join(context.path, 'LICENSE')) ||
            existsSync(join(context.path, 'LICENSE.md')) ||
            existsSync(join(context.path, 'license'));

        if (!licenseExists) {
            findings.push({
                id: `DOC-${String(idCounter++).padStart(3, '0')}`,
                category: 'documentation',
                severity: 'low',
                location: 'project root',
                title: 'Missing LICENSE file',
                description: 'No LICENSE file found',
                why: 'Without a license, others cannot legally use your code',
                suggestion: 'Add a LICENSE file (MIT, Apache 2.0, etc.)'
            });
        }

        // Check for CONTRIBUTING
        const contributingExists = existsSync(join(context.path, 'CONTRIBUTING.md')) ||
            existsSync(join(context.path, 'CONTRIBUTING'));

        if (!contributingExists && context.fileCount > 20) {
            findings.push({
                id: `DOC-${String(idCounter++).padStart(3, '0')}`,
                category: 'documentation',
                severity: 'low',
                location: 'project root',
                title: 'Missing CONTRIBUTING.md',
                description: 'No contributing guidelines found',
                why: 'Makes it harder for others to contribute',
                suggestion: 'Add CONTRIBUTING.md with contribution guidelines'
            });
        }

        return findings;
    }

    parseResponse(response) {
        const findings = [];

        if (typeof response === 'string') {
            if (response.includes('NO_ISSUES_FOUND')) return [];

            // Parse: [DOC-NNN] SEVERITY | LOCATION | What's missing | Impact | Suggested content
            const lines = response.split('\n').filter(l => l.startsWith('[DOC-'));

            for (const line of lines) {
                const match = line.match(/\[(DOC-\d+)\]\s*(\w+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*(.+)/i);

                if (match) {
                    findings.push({
                        id: match[1],
                        category: 'documentation',
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
