/**
 * GitHub Copilot CLI Wrapper
 * Handles all interactions with the gh copilot command
 */

import { execSync, exec } from 'child_process';
import chalk from 'chalk';

export class CopilotCLI {
    constructor(options = {}) {
        this.rateLimit = options.rateLimit || 1500; // ms between calls
        this.lastCall = 0;
        this.callCount = 0;
        this.verbose = options.verbose || false;
        this.maxRetries = 3;
    }

    /**
     * Verify GitHub Copilot CLI is installed and authenticated
     */
    async verify() {
        try {
            execSync('gh copilot --version', { encoding: 'utf-8', stdio: 'pipe' });
            return true;
        } catch (error) {
            throw new Error(
                'GitHub Copilot CLI is not installed or not authenticated.\n' +
                'Please install it with: gh extension install github/gh-copilot\n' +
                'Then authenticate with: gh auth login'
            );
        }
    }

    /**
     * Execute a prompt via GitHub Copilot CLI
     * Uses: gh copilot explain "prompt"
     */
    async query(prompt, options = {}) {
        await this.waitForRateLimit();

        const sanitizedPrompt = this.sanitizePrompt(prompt);

        if (this.verbose) {
            console.log(chalk.dim('\n📤 Sending to Copilot CLI...'));
            console.log(chalk.dim(prompt.substring(0, 200) + '...\n'));
        }

        let attempts = 0;
        let lastError;

        while (attempts < this.maxRetries) {
            try {
                // Use gh copilot explain with piped input for longer prompts
                const result = execSync(
                    `echo ${JSON.stringify(sanitizedPrompt)} | gh copilot explain -`,
                    {
                        encoding: 'utf-8',
                        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
                        timeout: 90000, // 90 second timeout
                        stdio: ['pipe', 'pipe', 'pipe']
                    }
                );

                this.callCount++;

                if (this.verbose) {
                    console.log(chalk.dim('📥 Received response'));
                }

                return this.parseResponse(result);
            } catch (error) {
                lastError = error;
                attempts++;

                if (attempts < this.maxRetries) {
                    // Wait before retry
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }

        return this.handleError(lastError);
    }

    /**
     * Alternative query method using suggest for shell-like responses
     */
    async suggest(prompt, type = 'shell') {
        await this.waitForRateLimit();

        const sanitizedPrompt = this.sanitizePrompt(prompt);

        try {
            const result = execSync(
                `gh copilot suggest -t ${type} "${sanitizedPrompt}"`,
                {
                    encoding: 'utf-8',
                    timeout: 60000,
                    stdio: ['pipe', 'pipe', 'pipe']
                }
            );

            this.callCount++;
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Rate limit enforcement
     */
    async waitForRateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastCall;

        if (elapsed < this.rateLimit) {
            await new Promise(r => setTimeout(r, this.rateLimit - elapsed));
        }

        this.lastCall = Date.now();
    }

    /**
     * Sanitize prompt for shell execution
     */
    sanitizePrompt(prompt) {
        return prompt
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$')
            .replace(/\n/g, '\\n')
            .substring(0, 15000); // Limit prompt length
    }

    /**
     * Parse Copilot response and extract findings
     */
    parseResponse(response) {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                // Not valid JSON, return as text
            }
        }

        // Return raw response for text-based analysis
        return response;
    }

    /**
     * Handle errors gracefully
     */
    handleError(error) {
        if (this.verbose) {
            console.error(chalk.red('Copilot CLI error:'), error.message);
        }

        // Return empty array for analysis continuity
        return [];
    }

    /**
     * Get total Copilot CLI call count
     */
    getCallCount() {
        return this.callCount;
    }
}
