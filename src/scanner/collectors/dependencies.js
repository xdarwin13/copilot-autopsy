/**
 * Dependencies Parser
 * Parses package.json, requirements.txt, go.mod, etc.
 */

import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function parseDependencies(targetPath) {
    const deps = {
        runtime: [],
        dev: [],
        raw: null
    };

    // Node.js - package.json
    const pkgPath = join(targetPath, 'package.json');
    if (existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
            deps.runtime = Object.keys(pkg.dependencies || {});
            deps.dev = Object.keys(pkg.devDependencies || {});
            deps.raw = pkg;
            return deps;
        } catch (e) {
            // Invalid JSON
        }
    }

    // Python - requirements.txt
    const reqPath = join(targetPath, 'requirements.txt');
    if (existsSync(reqPath)) {
        try {
            const content = readFileSync(reqPath, 'utf-8');
            deps.runtime = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(line => line.split(/[=<>!]/)[0].trim());
            return deps;
        } catch (e) {
            // Can't read
        }
    }

    // Python - pyproject.toml (simplified parsing)
    const pyprojectPath = join(targetPath, 'pyproject.toml');
    if (existsSync(pyprojectPath)) {
        try {
            const content = readFileSync(pyprojectPath, 'utf-8');
            // Very basic parsing - just extract dependency names
            const depsMatch = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
            if (depsMatch) {
                deps.runtime = depsMatch[1]
                    .split(',')
                    .map(d => d.replace(/["'\s]/g, '').split(/[=<>!]/)[0])
                    .filter(Boolean);
            }
            return deps;
        } catch (e) {
            // Can't read
        }
    }

    // Go - go.mod
    const goModPath = join(targetPath, 'go.mod');
    if (existsSync(goModPath)) {
        try {
            const content = readFileSync(goModPath, 'utf-8');
            const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);

            if (requireBlock) {
                deps.runtime = requireBlock[1]
                    .split('\n')
                    .map(line => line.trim().split(' ')[0])
                    .filter(Boolean);
            }
            return deps;
        } catch (e) {
            // Can't read
        }
    }

    return deps;
}
