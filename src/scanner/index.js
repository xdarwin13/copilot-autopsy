/**
 * Scanner Module - Main Orchestrator
 * Detects project type, language, structure, and tooling
 */

import { resolve, join } from 'path';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { detectLanguages } from './detectors/language.js';
import { detectFramework } from './detectors/framework.js';
import { detectTooling } from './detectors/tooling.js';
import { collectKeyFiles } from './collectors/files.js';
import { parseDependencies } from './collectors/dependencies.js';

export class Scanner {
    constructor(targetPath) {
        this.targetPath = resolve(targetPath);
        this.context = {
            path: this.targetPath,
            languages: [],
            framework: null,
            tooling: [],
            dependencies: {},
            fileCount: 0,
            sourceFileCount: 0,
            keyFiles: [],
            directoryTree: '',
            hasGit: false,
            hasEnvFile: false
        };
    }

    async scan() {
        // Validate path exists
        if (!existsSync(this.targetPath)) {
            throw new Error(`Path does not exist: ${this.targetPath}`);
        }

        // Check if it's a git repository
        this.context.hasGit = existsSync(join(this.targetPath, '.git'));

        // Check for .env files
        this.context.hasEnvFile = existsSync(join(this.targetPath, '.env')) ||
            existsSync(join(this.targetPath, '.env.local'));

        // Count files and build tree
        const fileStats = this.countFiles(this.targetPath);
        this.context.fileCount = fileStats.total;
        this.context.sourceFileCount = fileStats.source;
        this.context.directoryTree = this.buildDirectoryTree(this.targetPath, 3);

        // Detect languages
        this.context.languages = await detectLanguages(this.targetPath);

        // Detect framework
        this.context.framework = await detectFramework(this.targetPath);

        // Detect tooling
        this.context.tooling = await detectTooling(this.targetPath);

        // Parse dependencies
        this.context.dependencies = await parseDependencies(this.targetPath);

        // Collect key files for analysis
        this.context.keyFiles = await collectKeyFiles(this.targetPath, this.context);

        return this.context;
    }

    countFiles(dir, stats = { total: 0, source: 0 }) {
        const sourceExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.rb', '.php', '.rs', '.c', '.cpp', '.cs'];
        const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.next'];

        try {
            const items = readdirSync(dir);

            for (const item of items) {
                const fullPath = join(dir, item);

                try {
                    const stat = statSync(fullPath);

                    if (stat.isDirectory()) {
                        if (!ignoreDirs.includes(item) && !item.startsWith('.')) {
                            this.countFiles(fullPath, stats);
                        }
                    } else if (stat.isFile()) {
                        stats.total++;
                        if (sourceExtensions.some(ext => item.endsWith(ext))) {
                            stats.source++;
                        }
                    }
                } catch (e) {
                    // Skip files we can't access
                }
            }
        } catch (e) {
            // Skip directories we can't read
        }

        return stats;
    }

    buildDirectoryTree(dir, maxDepth, currentDepth = 0, prefix = '') {
        if (currentDepth >= maxDepth) return '';

        const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.next'];
        let result = '';

        try {
            const items = readdirSync(dir).filter(item => !ignoreDirs.includes(item) && !item.startsWith('.'));
            items.sort();

            items.forEach((item, index) => {
                const fullPath = join(dir, item);
                const isLast = index === items.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const newPrefix = prefix + (isLast ? '    ' : '│   ');

                try {
                    const stat = statSync(fullPath);

                    if (stat.isDirectory()) {
                        result += `${prefix}${connector}${item}/\n`;
                        result += this.buildDirectoryTree(fullPath, maxDepth, currentDepth + 1, newPrefix);
                    } else {
                        result += `${prefix}${connector}${item}\n`;
                    }
                } catch (e) {
                    // Skip inaccessible items
                }
            });
        } catch (e) {
            // Skip unreadable directories
        }

        return result;
    }
}
