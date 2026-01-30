/**
 * Aggregator Module
 * Processes, deduplicates, and scores findings
 */

export class Aggregator {
    process(findings) {
        // Remove duplicates
        let processed = this.deduplicate(findings);

        // Normalize severity scores
        processed = this.normalizeSeverity(processed);

        // Sort by severity and category
        processed = this.sortFindings(processed);

        // Add unique IDs if missing
        processed = this.ensureIds(processed);

        return processed;
    }

    deduplicate(findings) {
        const seen = new Map();

        for (const finding of findings) {
            // Create a key based on location and description
            const key = `${finding.location || finding.file}::${finding.title || finding.description}`;

            if (!seen.has(key)) {
                seen.set(key, finding);
            } else {
                // Keep the higher severity one
                const existing = seen.get(key);
                if (this.severityScore(finding.severity) > this.severityScore(existing.severity)) {
                    seen.set(key, finding);
                }
            }
        }

        return Array.from(seen.values());
    }

    normalizeSeverity(findings) {
        const validSeverities = ['critical', 'high', 'medium', 'low'];

        return findings.map(f => ({
            ...f,
            severity: validSeverities.includes(f.severity?.toLowerCase())
                ? f.severity.toLowerCase()
                : 'medium'
        }));
    }

    sortFindings(findings) {
        return findings.sort((a, b) => {
            // First by severity
            const severityDiff = this.severityScore(b.severity) - this.severityScore(a.severity);
            if (severityDiff !== 0) return severityDiff;

            // Then by category priority
            const categoryOrder = ['security', 'quality', 'architecture', 'testing', 'documentation'];
            const aCatIndex = categoryOrder.indexOf(a.category);
            const bCatIndex = categoryOrder.indexOf(b.category);

            return aCatIndex - bCatIndex;
        });
    }

    ensureIds(findings) {
        const counters = {};

        return findings.map(f => {
            if (!f.id || f.id.includes('undefined')) {
                const prefix = this.getCategoryPrefix(f.category);
                counters[prefix] = (counters[prefix] || 0) + 1;
                f.id = `${prefix}-${String(counters[prefix]).padStart(3, '0')}`;
            }
            return f;
        });
    }

    getCategoryPrefix(category) {
        const prefixes = {
            quality: 'QUAL',
            security: 'SEC',
            architecture: 'ARCH',
            testing: 'TEST',
            documentation: 'DOC'
        };
        return prefixes[category] || 'MISC';
    }

    severityScore(severity) {
        const scores = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1
        };
        return scores[severity?.toLowerCase()] || 0;
    }
}
