/**
 * Tooling Detection
 * Identifies linters, formatters, CI/CD, testing frameworks
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const TOOL_INDICATORS = {
    // Linters
    'ESLint': ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js'],
    'Prettier': ['.prettierrc', '.prettierrc.js', '.prettierrc.json', 'prettier.config.js'],
    'Biome': ['biome.json'],
    'Pylint': ['.pylintrc', 'pylintrc'],
    'Flake8': ['.flake8', 'setup.cfg'],
    'Black': ['pyproject.toml'],
    'Ruff': ['ruff.toml'],

    // Testing
    'Jest': ['jest.config.js', 'jest.config.ts', 'jest.config.json'],
    'Vitest': ['vitest.config.js', 'vitest.config.ts'],
    'Mocha': ['.mocharc.js', '.mocharc.json'],
    'Cypress': ['cypress.config.js', 'cypress.config.ts', 'cypress.json'],
    'Playwright': ['playwright.config.js', 'playwright.config.ts'],
    'pytest': ['pytest.ini', 'pyproject.toml', 'conftest.py'],

    // CI/CD
    'GitHub Actions': ['.github/workflows'],
    'GitLab CI': ['.gitlab-ci.yml'],
    'Jenkins': ['Jenkinsfile'],
    'CircleCI': ['.circleci/config.yml'],
    'Travis CI': ['.travis.yml'],

    // Build Tools
    'Webpack': ['webpack.config.js', 'webpack.config.ts'],
    'Vite': ['vite.config.js', 'vite.config.ts'],
    'Rollup': ['rollup.config.js'],
    'esbuild': ['esbuild.config.js'],
    'Turbo': ['turbo.json'],

    // Type Checking
    'TypeScript': ['tsconfig.json'],
    'mypy': ['mypy.ini', '.mypy.ini'],

    // Containerization
    'Docker': ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
    'Kubernetes': ['k8s', 'kubernetes', 'helm']
};

export async function detectTooling(targetPath) {
    const detected = [];

    for (const [tool, indicators] of Object.entries(TOOL_INDICATORS)) {
        for (const indicator of indicators) {
            const checkPath = join(targetPath, indicator);
            if (existsSync(checkPath)) {
                detected.push(tool);
                break;
            }
        }
    }

    // Also check package.json for dev dependencies
    const pkgPath = join(targetPath, 'package.json');
    if (existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
            const devDeps = pkg.devDependencies || {};

            const pkgTools = {
                'Husky': 'husky',
                'lint-staged': 'lint-staged',
                'commitlint': '@commitlint/cli'
            };

            for (const [toolName, depName] of Object.entries(pkgTools)) {
                if (devDeps[depName] && !detected.includes(toolName)) {
                    detected.push(toolName);
                }
            }
        } catch (e) {
            // Invalid JSON
        }
    }

    return detected;
}
