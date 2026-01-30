/**
 * Analyzer Module - Main Orchestrator
 * Coordinates all analysis types using Copilot CLI
 */

import chalk from 'chalk';
import ora from 'ora';
import { CopilotCLI } from './copilot.js';
import { QualityAnalyzer } from './analyzers/quality.js';
import { SecurityAnalyzer } from './analyzers/security.js';
import { ArchitectureAnalyzer } from './analyzers/architecture.js';
import { TestingAnalyzer } from './analyzers/testing.js';
import { DocumentationAnalyzer } from './analyzers/documentation.js';

export class Analyzer {
    constructor(options = {}) {
        this.options = options;
        this.copilot = new CopilotCLI({
            verbose: options.verbose,
            rateLimit: 1500
        });
        this.findings = [];
    }

    async analyze(projectContext, progressCallback) {
        // Verify Copilot CLI is available
        await this.copilot.verify();

        const focus = this.options.focus || 'all';
        const depth = this.options.depth || 'standard';

        const analysisCategories = this.getCategories(focus);

        console.log(chalk.dim(`   Running ${analysisCategories.length} analysis categories...\n`));

        for (const category of analysisCategories) {
            const spinner = ora({
                text: `${category.icon} ${category.name}...`,
                prefixText: '  '
            }).start();

            try {
                const analyzer = this.getAnalyzer(category.id);
                const categoryFindings = await analyzer.analyze(
                    projectContext,
                    this.copilot,
                    depth,
                    (progress) => {
                        spinner.text = `${category.icon} ${category.name}: ${progress}`;
                        if (progressCallback) {
                            progressCallback({
                                category: category.id,
                                percentage: 50,
                                status: progress
                            });
                        }
                    }
                );

                this.findings.push(...categoryFindings);

                const count = categoryFindings.length;
                spinner.succeed(chalk.green(`${category.icon} ${category.name}: ${count} finding${count !== 1 ? 's' : ''}`));

            } catch (error) {
                spinner.fail(chalk.red(`${category.icon} ${category.name}: Error - ${error.message}`));
            }
        }

        // Add root cause analysis for high-severity findings if fix mode
        if (this.options.fix) {
            await this.addRootCauseAnalysis(projectContext);
        }

        return this.findings;
    }

    getCategories(focus) {
        const allCategories = [
            { id: 'quality', name: 'Code Quality', icon: '📝' },
            { id: 'security', name: 'Security', icon: '🔒' },
            { id: 'architecture', name: 'Architecture', icon: '🏗️' },
            { id: 'testing', name: 'Testing', icon: '🧪' },
            { id: 'documentation', name: 'Documentation', icon: '📚' }
        ];

        if (focus === 'all') return allCategories;

        return allCategories.filter(c => c.id === focus);
    }

    getAnalyzer(categoryId) {
        const analyzers = {
            quality: new QualityAnalyzer(),
            security: new SecurityAnalyzer(),
            architecture: new ArchitectureAnalyzer(),
            testing: new TestingAnalyzer(),
            documentation: new DocumentationAnalyzer()
        };

        return analyzers[categoryId];
    }

    async addRootCauseAnalysis(projectContext) {
        const highSeverity = this.findings.filter(
            f => f.severity === 'critical' || f.severity === 'high'
        );

        if (highSeverity.length === 0) return;

        console.log(chalk.dim(`\n   Adding root cause analysis for ${highSeverity.length} findings...\n`));

        for (const finding of highSeverity.slice(0, 5)) {
            try {
                const { buildRootCausePrompt } = await import('./prompts/templates.js');
                const file = projectContext.keyFiles.find(f =>
                    finding.location?.includes(f.relativePath) || finding.file === f.relativePath
                );

                const prompt = buildRootCausePrompt(finding, file?.content || '');
                const response = await this.copilot.query(prompt);

                if (typeof response === 'string' && response.length > 20) {
                    finding.rootCause = response.trim();
                }
            } catch (e) {
                // Skip root cause for this finding
            }
        }
    }

    getCopilotCallCount() {
        return this.copilot.getCallCount();
    }
}
