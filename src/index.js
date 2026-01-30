/**
 * Main Autopsy Orchestrator
 * Coordinates the scanner, analyzer, aggregator, and reporter modules
 */

import ora from 'ora';
import chalk from 'chalk';
import { Scanner } from './scanner/index.js';
import { Analyzer } from './analyzer/index.js';
import { Aggregator } from './aggregator/index.js';
import { Reporter } from './reporter/index.js';
import { displayProgress, displaySummary } from './ui/progress.js';

/**
 * Main entry point for the autopsy analysis
 * @param {Object} options - CLI options
 */
export async function runAutopsy(options) {
    const startTime = Date.now();

    console.log(chalk.dim('─'.repeat(70)));
    console.log(chalk.cyan('📁 Repository:'), chalk.white(options.path));
    console.log(chalk.cyan('🔍 Depth:'), chalk.white(options.depth));
    console.log(chalk.cyan('🎯 Focus:'), chalk.white(options.focus));
    console.log(chalk.dim('─'.repeat(70)));
    console.log();

    try {
        // Phase 1: Scan the project
        const scanSpinner = ora('Scanning project structure...').start();
        const scanner = new Scanner(options.path);
        const projectContext = await scanner.scan();
        scanSpinner.succeed(chalk.green('Project scanned successfully'));

        displayProjectInfo(projectContext);

        // Phase 2: Run analysis with Copilot CLI
        console.log();
        console.log(chalk.bold.magenta('🤖 COPILOT ANALYSIS'));
        console.log(chalk.dim('   Powered by GitHub Copilot CLI'));
        console.log();

        const analyzer = new Analyzer(options);
        const findings = await analyzer.analyze(projectContext, (progress) => {
            displayProgress(progress);
        });

        // Phase 3: Aggregate and score findings
        const aggregator = new Aggregator();
        const processedFindings = aggregator.process(findings);

        // Phase 4: Generate report
        const reportSpinner = ora('Generating AUTOPSY.md report...').start();
        const reporter = new Reporter(options);
        const reportPath = await reporter.generate(projectContext, processedFindings);
        reportSpinner.succeed(chalk.green(`Report saved to ${reportPath}`));

        // Display final summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        displaySummary(processedFindings, duration, analyzer.getCopilotCallCount());

    } catch (error) {
        console.error(chalk.red('\n❌ Autopsy failed:'), error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

/**
 * Display detected project information
 */
function displayProjectInfo(context) {
    console.log();
    console.log(chalk.bold.blue('📊 PROJECT DETECTION'));
    console.log(chalk.dim('─'.repeat(40)));
    console.log(chalk.green('✓'), 'Language:', chalk.white(formatLanguages(context.languages)));
    console.log(chalk.green('✓'), 'Framework:', chalk.white(context.framework || 'None detected'));
    console.log(chalk.green('✓'), 'Tooling:', chalk.white(context.tooling.join(', ') || 'None detected'));
    console.log(chalk.green('✓'), 'Files:', chalk.white(`${context.fileCount} total (${context.sourceFileCount} source)`));
}

function formatLanguages(languages) {
    if (!languages || languages.length === 0) return 'Unknown';
    return languages.map(l => `${l.name} (${l.percentage}%)`).join(', ');
}
