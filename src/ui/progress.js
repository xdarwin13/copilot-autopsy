/**
 * Terminal UI - Progress Display and Summary
 */

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import boxen from 'boxen';

let multiBar = null;
let bars = {};

/**
 * Initialize progress bars for each analysis category
 */
export function initProgressBars(categories) {
    multiBar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: ' {category} |' + chalk.cyan('{bar}') + '| {percentage}% | {status}',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        barsize: 25
    });

    categories.forEach(cat => {
        bars[cat.id] = multiBar.create(100, 0, {
            category: cat.name.padEnd(15),
            status: 'Waiting...'
        });
    });
}

/**
 * Update progress for a specific category
 */
export function displayProgress(progress) {
    const { category, percentage, status, finding } = progress;

    if (bars[category]) {
        bars[category].update(percentage, { status: status.substring(0, 30) });
    }

    // Show real-time finding preview
    if (finding) {
        const severityColors = {
            critical: chalk.red,
            high: chalk.yellow,
            medium: chalk.blue,
            low: chalk.dim
        };
        const color = severityColors[finding.severity] || chalk.white;
        console.log(color(`   → [${finding.id}] ${finding.title.substring(0, 50)}`));
    }
}

/**
 * Stop all progress bars
 */
export function stopProgressBars() {
    if (multiBar) {
        multiBar.stop();
    }
}

/**
 * Display final summary with health score
 */
export function displaySummary(findings, duration, copilotCalls) {
    console.log();
    console.log(chalk.dim('═'.repeat(70)));
    console.log();

    // Count by severity
    const counts = {
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length
    };

    // Calculate health score (simple formula)
    const healthScore = Math.max(0, 100 - (counts.critical * 20) - (counts.high * 10) - (counts.medium * 3) - (counts.low * 1));

    // Health bar visualization
    const healthBar = generateHealthBar(healthScore);

    const summaryContent = [
        chalk.bold.white('📋 AUTOPSY COMPLETE'),
        '',
        chalk.white(`Health Score: ${healthScore}/100`),
        healthBar,
        '',
        `${chalk.red('🔴 Critical:')} ${counts.critical}   ${chalk.yellow('🟠 High:')} ${counts.high}   ${chalk.blue('🟡 Medium:')} ${counts.medium}   ${chalk.dim('🟢 Low:')} ${counts.low}`,
        '',
        chalk.dim(`Duration: ${duration}s • Copilot CLI calls: ${copilotCalls}`),
    ].join('\n');

    const box = boxen(summaryContent, {
        padding: 1,
        borderColor: healthScore >= 70 ? 'green' : healthScore >= 40 ? 'yellow' : 'red',
        borderStyle: 'round',
        title: '🔬 Copilot Autopsy',
        titleAlignment: 'center'
    });

    console.log(box);
    console.log();
}

function generateHealthBar(score) {
    const filled = Math.round(score / 5);
    const empty = 20 - filled;

    let color;
    if (score >= 70) color = chalk.green;
    else if (score >= 40) color = chalk.yellow;
    else color = chalk.red;

    return color('█'.repeat(filled)) + chalk.dim('░'.repeat(empty)) + ` ${score}%`;
}
