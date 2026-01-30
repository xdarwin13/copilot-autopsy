/**
 * Reporter Module
 * Generates AUTOPSY.md reports from findings
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

export class Reporter {
    constructor(options = {}) {
        this.options = options;
        this.registerHelpers();
    }

    registerHelpers() {
        Handlebars.registerHelper('severityIcon', (severity) => {
            const icons = {
                critical: '🔴',
                high: '🟠',
                medium: '🟡',
                low: '🟢'
            };
            return icons[severity] || '⚪';
        });

        Handlebars.registerHelper('severityBadge', (severity) => {
            return `**${severity.toUpperCase()}**`;
        });

        Handlebars.registerHelper('categoryIcon', (category) => {
            const icons = {
                quality: '📝',
                security: '🔒',
                architecture: '🏗️',
                testing: '🧪',
                documentation: '📚'
            };
            return icons[category] || '📋';
        });
    }

    async generate(projectContext, findings) {
        const outputPath = join(projectContext.path, this.options.output || 'AUTOPSY.md');

        const report = this.buildReport(projectContext, findings);

        writeFileSync(outputPath, report, 'utf-8');

        return outputPath;
    }

    buildReport(projectContext, findings) {
        const { healthScore, counts } = this.calculateMetrics(findings);
        const groupedFindings = this.groupByCategory(findings);
        const actionItems = this.generateActionItems(findings);

        const template = this.getTemplate();
        const compiled = Handlebars.compile(template);

        return compiled({
            date: new Date().toISOString().split('T')[0],
            repoName: projectContext.path.split('/').pop(),
            repoPath: projectContext.path,
            primaryLanguage: projectContext.languages?.[0]?.name || 'Unknown',
            framework: projectContext.framework || 'None detected',
            filesAnalyzed: projectContext.keyFiles?.length || 0,
            totalFiles: projectContext.fileCount,
            healthScore,
            healthBar: this.generateHealthBar(healthScore),
            counts,
            categories: groupedFindings,
            actionItems,
            hasFindings: findings.length > 0
        });
    }

    calculateMetrics(findings) {
        const counts = {
            critical: findings.filter(f => f.severity === 'critical').length,
            high: findings.filter(f => f.severity === 'high').length,
            medium: findings.filter(f => f.severity === 'medium').length,
            low: findings.filter(f => f.severity === 'low').length,
            total: findings.length
        };

        // Health score: 100 minus weighted deductions
        const healthScore = Math.max(0, Math.min(100,
            100 - (counts.critical * 20) - (counts.high * 10) - (counts.medium * 3) - (counts.low * 1)
        ));

        return { healthScore, counts };
    }

    generateHealthBar(score) {
        const filled = Math.round(score / 5);
        const empty = 20 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    groupByCategory(findings) {
        const groups = {};
        const categoryInfo = {
            security: { name: 'Security Vulnerabilities', icon: '🔒', priority: 1 },
            quality: { name: 'Code Quality Issues', icon: '📝', priority: 2 },
            architecture: { name: 'Architectural Concerns', icon: '🏗️', priority: 3 },
            testing: { name: 'Testing Gaps', icon: '🧪', priority: 4 },
            documentation: { name: 'Documentation Issues', icon: '📚', priority: 5 }
        };

        for (const finding of findings) {
            const cat = finding.category || 'other';
            if (!groups[cat]) {
                groups[cat] = {
                    ...categoryInfo[cat] || { name: cat, icon: '📋', priority: 10 },
                    findings: []
                };
            }
            groups[cat].findings.push(finding);
        }

        // Convert to array and sort by priority
        return Object.values(groups).sort((a, b) => a.priority - b.priority);
    }

    generateActionItems(findings) {
        const items = [];

        // Group critical/high findings by category
        const criticalFindings = findings.filter(f => f.severity === 'critical' || f.severity === 'high');

        if (criticalFindings.some(f => f.category === 'security')) {
            items.push({
                priority: 1,
                title: 'Address Security Vulnerabilities',
                description: 'Review and fix all security findings immediately. These pose the highest risk.',
                effort: 'High',
                relatedFindings: criticalFindings.filter(f => f.category === 'security').map(f => f.id).join(', ')
            });
        }

        if (criticalFindings.some(f => f.category === 'quality')) {
            items.push({
                priority: 2,
                title: 'Improve Code Quality',
                description: 'Refactor complex code and fix code smells to improve maintainability.',
                effort: 'Medium',
                relatedFindings: criticalFindings.filter(f => f.category === 'quality').map(f => f.id).join(', ')
            });
        }

        const testFindings = findings.filter(f => f.category === 'testing');
        if (testFindings.length > 0) {
            items.push({
                priority: 3,
                title: 'Increase Test Coverage',
                description: 'Add tests for critical paths and untested modules.',
                effort: 'Medium',
                relatedFindings: testFindings.slice(0, 5).map(f => f.id).join(', ')
            });
        }

        return items;
    }

    getTemplate() {
        return `# 🔬 Repository Autopsy Report

> Generated by **Copilot Autopsy** v1.0.0
> Powered by GitHub Copilot CLI
> Date: {{date}}

---

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| **Repository** | \`{{repoName}}\` |
| **Path** | \`{{repoPath}}\` |
| **Primary Language** | {{primaryLanguage}} |
| **Framework** | {{framework}} |
| **Files Analyzed** | {{filesAnalyzed}} / {{totalFiles}} |

### Health Score: {{healthScore}}/100

\`\`\`
{{healthBar}}  {{healthScore}}%
\`\`\`

### Findings Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | {{counts.critical}} |
| 🟠 High | {{counts.high}} |
| 🟡 Medium | {{counts.medium}} |
| 🟢 Low | {{counts.low}} |
| **Total** | **{{counts.total}}** |

---

{{#if hasFindings}}
## 🔍 Detailed Findings

{{#each categories}}
### {{icon}} {{name}}

{{#each findings}}
#### {{../icon}} {{id}}: {{title}}

| Property | Value |
|----------|-------|
| **Severity** | {{severityIcon severity}} {{severityBadge severity}} |
| **Location** | \`{{location}}\` |

**Description:**
{{description}}

{{#if why}}
**Why This Matters:**
{{why}}
{{/if}}

{{#if suggestion}}
**Suggested Fix:**
{{suggestion}}
{{/if}}

{{#if rootCause}}
**Root Cause Analysis:**
> {{rootCause}}
{{/if}}

---

{{/each}}
{{/each}}

{{#if actionItems}}
## 🎯 Recommended Action Plan

{{#each actionItems}}
### Priority {{priority}}: {{title}}

{{description}}

- **Related Findings:** {{relatedFindings}}
- **Estimated Effort:** {{effort}}

{{/each}}
{{/if}}

{{else}}
## ✅ No Issues Found

Congratulations! The autopsy found no significant issues in this repository.

{{/if}}

---

## 📈 Appendix

### Methodology

This report was generated using automated analysis powered by **GitHub Copilot CLI**.
Each finding includes a "Why This Matters" analysis explaining the root cause and impact.

### Limitations

- Analysis is based on static code review
- Some dynamic behaviors may not be detected
- Findings should be validated by human reviewers

---

*Generated with ❤️ by [Copilot Autopsy](https://github.com/your-repo/copilot-autopsy)*
`;
    }
}
