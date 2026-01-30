/**
 * Language Detection
 * Analyzes file extensions and counts to determine primary languages
 */

import { join } from 'path';
import { readdirSync, statSync } from 'fs';

const LANGUAGE_MAP = {
    '.js': 'JavaScript',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.py': 'Python',
    '.go': 'Go',
    '.java': 'Java',
    '.kt': 'Kotlin',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.rs': 'Rust',
    '.c': 'C',
    '.cpp': 'C++',
    '.cs': 'C#',
    '.swift': 'Swift',
    '.vue': 'Vue',
    '.svelte': 'Svelte'
};

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.next', 'coverage'];

export async function detectLanguages(targetPath) {
    const counts = {};

    countByExtension(targetPath, counts);

    // Calculate totals and percentages
    const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalFiles === 0) return [{ name: 'Unknown', percentage: 100 }];

    // Convert to array and sort by count
    const languages = Object.entries(counts)
        .map(([lang, count]) => ({
            name: lang,
            count,
            percentage: Math.round((count / totalFiles) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .filter(l => l.percentage >= 5); // Only show languages with >= 5%

    // Group similar languages (e.g., JavaScript + JavaScript React)
    const grouped = groupSimilarLanguages(languages);

    return grouped.slice(0, 3); // Top 3 languages
}

function countByExtension(dir, counts, depth = 0) {
    if (depth > 10) return; // Prevent deep recursion

    try {
        const items = readdirSync(dir);

        for (const item of items) {
            if (IGNORE_DIRS.includes(item) || item.startsWith('.')) continue;

            const fullPath = join(dir, item);

            try {
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    countByExtension(fullPath, counts, depth + 1);
                } else {
                    const ext = getExtension(item);
                    const language = LANGUAGE_MAP[ext];

                    if (language) {
                        counts[language] = (counts[language] || 0) + 1;
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

function getExtension(filename) {
    const last = filename.lastIndexOf('.');
    return last !== -1 ? filename.slice(last) : '';
}

function groupSimilarLanguages(languages) {
    const groups = {
        'JavaScript': ['JavaScript', 'JavaScript (React)'],
        'TypeScript': ['TypeScript', 'TypeScript (React)']
    };

    const result = [];
    const seen = new Set();

    for (const lang of languages) {
        if (seen.has(lang.name)) continue;

        // Check if this language should be grouped
        let grouped = false;
        for (const [groupName, members] of Object.entries(groups)) {
            if (members.includes(lang.name)) {
                // Sum all members
                const totalCount = languages
                    .filter(l => members.includes(l.name))
                    .reduce((sum, l) => sum + l.count, 0);

                const totalPercentage = languages
                    .filter(l => members.includes(l.name))
                    .reduce((sum, l) => sum + l.percentage, 0);

                members.forEach(m => seen.add(m));

                result.push({
                    name: groupName,
                    count: totalCount,
                    percentage: totalPercentage
                });

                grouped = true;
                break;
            }
        }

        if (!grouped) {
            seen.add(lang.name);
            result.push(lang);
        }
    }

    return result.sort((a, b) => b.percentage - a.percentage);
}
