# 🔬 Copilot Autopsy: AI-Powered Repository Forensics

*This is a submission for the [GitHub Copilot CLI Challenge](https://dev.to/challenges/github-2026-01-21)*

## What I Built

**Copilot Autopsy** is a terminal-first forensic analysis tool that performs deep "autopsies" of GitHub repositories using GitHub Copilot CLI as the AI reasoning engine.

Unlike traditional linters that just list problems, Copilot Autopsy explains **WHY** issues exist and how to fix them—powered entirely by GitHub Copilot CLI.

### Key Features:
- 🔍 **Auto-Detection** - Detects language, framework, and tooling automatically
- 📝 **Code Quality** - Finds code smells, SOLID violations, complexity issues
- 🔒 **Security Scanning** - Identifies vulnerabilities with CWE references
- 🏗️ **Architecture Review** - Detects circular dependencies and coupling
- 🧪 **Test Gap Analysis** - Finds untested code
- 📚 **Documentation Check** - Reviews README and JSDoc coverage
- 📊 **Health Score** - Generates a 0-100 health score
- 📋 **AUTOPSY.md Report** - Beautiful Markdown report with actionable fixes

```bash
# Simple usage
autopsy

# Quick 30-second analysis
autopsy --depth quick

# Security-focused analysis
autopsy --focus security
```

## Demo

### Terminal Output
```
🔬 COPILOT AUTOPSY v1.0.0

📊 PROJECT DETECTION
────────────────────
✓ Language: TypeScript (78%)
✓ Framework: Next.js + React
✓ Tooling: ESLint, Jest, GitHub Actions
✓ Files: 142 total (47 source)

🤖 COPILOT ANALYSIS (powered by GitHub Copilot CLI)

✓ 📝 Code Quality: 5 findings
✓ 🔒 Security: 2 findings
✓ 🏗️ Architecture: 3 findings
✓ 🧪 Testing: 4 findings
✓ 📚 Documentation: 2 findings

╭────────────────────────────╮
│   📋 AUTOPSY COMPLETE      │
│                            │
│   Health Score: 72/100     │
│   ██████████████░░░░░░     │
│                            │
│   🔴 Critical: 1           │
│   🟠 High: 3               │
│   🟡 Medium: 8             │
│   🟢 Low: 4                │
╰────────────────────────────╯
```

### Sample AUTOPSY.md Report

The tool generates a professional Markdown report with:
- Executive summary with health score visualization
- Detailed findings grouped by category
- "Why This Matters" explanations for each issue
- Suggested fixes with code examples
- Prioritized action plan

**GitHub Repository:** [github.com/darwinperezmunoz/copilot-autopsy](https://github.com/darwinperezmunoz/copilot-autopsy)

## My Experience with GitHub Copilot CLI

### How Copilot CLI Powers Everything

**Copilot Autopsy wouldn't exist without GitHub Copilot CLI.** Every single piece of intelligence comes from it:

1. **Quality Analysis** - I send structured prompts to `gh copilot explain` with file contents, and it returns code smell findings

2. **Security Scanning** - Copilot CLI analyzes code for vulnerabilities, injection flaws, and hardcoded secrets

3. **Architecture Review** - By feeding directory structures and import maps to Copilot CLI, it identifies coupling issues and circular dependencies

4. **Root Cause Analysis** - The unique "WHY" feature uses Copilot CLI to explain not just WHAT the problem is, but WHY it exists

### Technical Integration

```javascript
// Core integration with GitHub Copilot CLI
async query(prompt) {
  const result = execSync(
    `echo ${JSON.stringify(prompt)} | gh copilot explain -`,
    { encoding: 'utf-8', timeout: 90000 }
  );
  return this.parseResponse(result);
}
```

### The "Wow Factor"

What makes this special:
- **Not just listing problems** - Copilot CLI explains the root cause
- **Actionable fixes** - Each finding includes code examples
- **Health Score** - Visual representation of repository health
- **Beautiful Terminal UI** - Real-time progress with spinners and colors

### Development Experience

Building with Copilot CLI was surprisingly smooth:
- The `gh copilot explain` command handles complex prompts well
- Response parsing required some creativity for structured data
- Rate limiting was important to avoid overwhelming the API

**Total Copilot CLI Calls per Analysis:** 15-20 calls orchestrated into one coherent report

---

*Built with ❤️ for the GitHub Copilot CLI Challenge*
