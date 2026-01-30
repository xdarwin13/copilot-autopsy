/**
 * CLI Configuration and Command Setup
 * Uses Commander.js for argument parsing
 */

import { Command } from 'commander';
import { runAutopsy } from './index.js';
import { displayBanner } from './ui/banner.js';

const program = new Command();

program
    .name('copilot-autopsy')
    .description('🔬 A forensic analysis tool for GitHub repositories, powered by GitHub Copilot CLI')
    .version('1.0.0')
    .option('-p, --path <directory>', 'Target repository path', '.')
    .option('-o, --output <file>', 'Output file name', 'AUTOPSY.md')
    .option('-d, --depth <level>', 'Analysis depth: quick, standard, deep', 'standard')
    .option('-f, --focus <area>', 'Focus area: security, quality, architecture, testing, docs, all', 'all')
    .option('--fix', 'Generate fix suggestions with code examples', false)
    .option('-i, --issues', 'Create GitHub issues from findings', false)
    .option('--interactive', 'Interactive mode with follow-up questions', false)
    .option('-v, --verbose', 'Verbose output showing Copilot CLI calls', false)
    .option('--json', 'Output raw JSON instead of Markdown', false)
    .action(async (options) => {
        await displayBanner();
        await runAutopsy(options);
    });

export function cli(args) {
    program.parse(args);
}
