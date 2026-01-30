/**
 * Terminal UI - Banner Display
 */

import chalk from 'chalk';
import boxen from 'boxen';

const ASCII_BANNER = `
   ____            _ _       _      _         _                        
  / ___|___  _ __ (_) | ___ | |_   / \\  _   _| |_ ___  _ __  ___ _   _ 
 | |   / _ \\| '_ \\| | |/ _ \\| __| / _ \\| | | | __/ _ \\| '_ \\/ __| | | |
 | |__| (_) | |_) | | | (_) | |_ / ___ \\ |_| | || (_) | |_) \\__ \\ |_| |
  \\____\\___/| .__/|_|_|\\___/ \\__/_/   \\_\\__,_|\\__\\___/| .__/|___/\\__, |
            |_|                                       |_|        |___/ 
`;

export async function displayBanner() {
    console.log();
    console.log(chalk.cyan(ASCII_BANNER));

    const subtitle = boxen(
        chalk.white.bold('🔬 Repository Forensics') +
        chalk.dim(' • Powered by ') +
        chalk.green.bold('GitHub Copilot CLI'),
        {
            padding: { left: 2, right: 2, top: 0, bottom: 0 },
            borderColor: 'cyan',
            borderStyle: 'round',
            dimBorder: true
        }
    );

    console.log(subtitle);
    console.log();
}
