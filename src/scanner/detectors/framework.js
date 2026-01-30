/**
 * Framework Detection
 * Identifies web frameworks, libraries, and project types
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const FRAMEWORK_INDICATORS = {
    // JavaScript/TypeScript Frameworks
    'Next.js': {
        files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
        packageDeps: ['next']
    },
    'React': {
        packageDeps: ['react', 'react-dom']
    },
    'Vue.js': {
        files: ['vue.config.js', 'vite.config.ts'],
        packageDeps: ['vue']
    },
    'Angular': {
        files: ['angular.json'],
        packageDeps: ['@angular/core']
    },
    'Svelte': {
        files: ['svelte.config.js'],
        packageDeps: ['svelte']
    },
    'Express': {
        packageDeps: ['express']
    },
    'NestJS': {
        files: ['nest-cli.json'],
        packageDeps: ['@nestjs/core']
    },
    'Fastify': {
        packageDeps: ['fastify']
    },

    // Python Frameworks
    'Django': {
        files: ['manage.py', 'settings.py'],
        requirementsDeps: ['django']
    },
    'Flask': {
        requirementsDeps: ['flask']
    },
    'FastAPI': {
        requirementsDeps: ['fastapi']
    },

    // Go Frameworks
    'Gin': {
        goModDeps: ['github.com/gin-gonic/gin']
    },
    'Echo': {
        goModDeps: ['github.com/labstack/echo']
    },

    // Ruby
    'Rails': {
        files: ['Gemfile', 'config/routes.rb'],
        gemDeps: ['rails']
    }
};

export async function detectFramework(targetPath) {
    const detected = [];

    // Check for indicator files
    for (const [framework, indicators] of Object.entries(FRAMEWORK_INDICATORS)) {
        let score = 0;

        // Check for specific files
        if (indicators.files) {
            for (const file of indicators.files) {
                if (existsSync(join(targetPath, file))) {
                    score += 2;
                }
            }
        }

        // Check package.json dependencies
        if (indicators.packageDeps) {
            const pkgPath = join(targetPath, 'package.json');
            if (existsSync(pkgPath)) {
                try {
                    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
                    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

                    for (const dep of indicators.packageDeps) {
                        if (allDeps[dep]) {
                            score += 3;
                        }
                    }
                } catch (e) {
                    // Invalid JSON
                }
            }
        }

        // Check requirements.txt for Python
        if (indicators.requirementsDeps) {
            const reqPath = join(targetPath, 'requirements.txt');
            if (existsSync(reqPath)) {
                try {
                    const content = readFileSync(reqPath, 'utf-8').toLowerCase();
                    for (const dep of indicators.requirementsDeps) {
                        if (content.includes(dep)) {
                            score += 3;
                        }
                    }
                } catch (e) {
                    // Can't read
                }
            }
        }

        // Check go.mod for Go
        if (indicators.goModDeps) {
            const goModPath = join(targetPath, 'go.mod');
            if (existsSync(goModPath)) {
                try {
                    const content = readFileSync(goModPath, 'utf-8');
                    for (const dep of indicators.goModDeps) {
                        if (content.includes(dep)) {
                            score += 3;
                        }
                    }
                } catch (e) {
                    // Can't read
                }
            }
        }

        if (score > 0) {
            detected.push({ framework, score });
        }
    }

    // Return the highest scoring framework
    detected.sort((a, b) => b.score - a.score);

    if (detected.length === 0) return null;
    if (detected.length === 1) return detected[0].framework;

    // If multiple, combine top 2
    return `${detected[0].framework} + ${detected[1].framework}`;
}
