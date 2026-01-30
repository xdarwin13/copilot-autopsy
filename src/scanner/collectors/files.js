/**
 * Key Files Collector
 * Collects the most important files for Copilot analysis
 */

import { join, relative, extname, basename } from 'path';
import { readdirSync, statSync, readFileSync } from 'fs';

const SOURCE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.rb', '.php'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.next', 'coverage'];
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];

const MAX_FILE_SIZE = 50 * 1024; // 50KB max per file
const MAX_FILES_QUICK = 10;
const MAX_FILES_STANDARD = 30;
const MAX_FILES_DEEP = 100;

/**
 * Collect key files for analysis based on depth setting
 */
export async function collectKeyFiles(targetPath, context, depth = 'standard') {
    const maxFiles = depth === 'quick' ? MAX_FILES_QUICK :
        depth === 'deep' ? MAX_FILES_DEEP :
            MAX_FILES_STANDARD;

    const allFiles = [];
    walkDirectory(targetPath, targetPath, allFiles);

    // Score and prioritize files
    const scoredFiles = allFiles.map(file => ({
        ...file,
        score: calculateFileScore(file, context)
    }));

    // Sort by score (highest first)
    scoredFiles.sort((a, b) => b.score - a.score);

    // Take top N files and read their content
    const keyFiles = scoredFiles.slice(0, maxFiles).map(file => {
        try {
            const content = readFileSync(file.absolutePath, 'utf-8');
            return {
                ...file,
                content: content.substring(0, MAX_FILE_SIZE) // Truncate large files
            };
        } catch (e) {
            return { ...file, content: '', error: e.message };
        }
    });

    return keyFiles;
}

function walkDirectory(basePath, currentPath, files, depth = 0) {
    if (depth > 10) return;

    try {
        const items = readdirSync(currentPath);

        for (const item of items) {
            if (IGNORE_DIRS.includes(item) || item.startsWith('.') || IGNORE_FILES.includes(item)) {
                continue;
            }

            const fullPath = join(currentPath, item);

            try {
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    walkDirectory(basePath, fullPath, files, depth + 1);
                } else if (stat.isFile() && stat.size <= MAX_FILE_SIZE) {
                    const ext = extname(item);

                    if (SOURCE_EXTENSIONS.includes(ext)) {
                        files.push({
                            absolutePath: fullPath,
                            relativePath: relative(basePath, fullPath),
                            name: basename(item),
                            extension: ext,
                            size: stat.size,
                            isTest: isTestFile(item, fullPath),
                            isConfig: isConfigFile(item)
                        });
                    }
                }
            } catch (e) {
                // Skip inaccessible
            }
        }
    } catch (e) {
        // Skip unreadable dirs
    }
}

function calculateFileScore(file, context) {
    let score = 0;

    // Prioritize entry points
    if (['index', 'main', 'app', 'server'].some(n => file.name.startsWith(n))) {
        score += 10;
    }

    // Prioritize src directory
    if (file.relativePath.startsWith('src/')) {
        score += 5;
    }

    // Prioritize based on path depth (prefer shallower files)
    const depth = file.relativePath.split('/').length;
    score += Math.max(0, 10 - depth * 2);

    // Deprioritize test files for quality analysis
    if (file.isTest) {
        score -= 5;
    }

    // Prioritize larger files (more logic to analyze)
    if (file.size > 5000) score += 3;
    if (file.size > 10000) score += 2;

    // Prioritize controllers, services, utils
    const importantPatterns = ['controller', 'service', 'handler', 'api', 'routes', 'utils', 'helpers'];
    if (importantPatterns.some(p => file.name.toLowerCase().includes(p))) {
        score += 8;
    }

    return score;
}

function isTestFile(name, path) {
    const testPatterns = ['.test.', '.spec.', '_test.', '_spec.'];
    const testDirs = ['test', 'tests', '__tests__', 'spec'];

    return testPatterns.some(p => name.includes(p)) ||
        testDirs.some(d => path.includes(`/${d}/`));
}

function isConfigFile(name) {
    return name.endsWith('.config.js') ||
        name.endsWith('.config.ts') ||
        name.startsWith('.');
}
