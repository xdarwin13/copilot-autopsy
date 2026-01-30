# Copilot Autopsy

🔬 A terminal-first forensic analysis tool for GitHub repositories, powered by **GitHub Copilot CLI**.

[![GitHub Copilot CLI Challenge](https://img.shields.io/badge/GitHub%20Copilot-CLI%20Challenge-blue?style=flat-square)](https://github.com)

## What is Copilot Autopsy?

Copilot Autopsy performs a deep forensic analysis ("autopsy") of any GitHub repository using GitHub Copilot CLI as the AI reasoning engine. It doesn't just list problems—it explains **WHY** they exist and how to fix them.

### Features

- 🔍 **Automatic Project Detection** - Detects language, framework, and tooling
- 📝 **Code Quality Analysis** - Finds code smells, SOLID violations, complexity issues
- 🔒 **Security Scanning** - Identifies vulnerabilities with CWE references
- 🏗️ **Architecture Review** - Detects circular dependencies, coupling issues
- 🧪 **Test Gap Analysis** - Finds untested code and missing test cases
- 📚 **Documentation Check** - Reviews README, JSDoc, and contributing guidelines
- 📋 **AUTOPSY.md Report** - Professional Markdown report with health score
- 🎯 **Action Items** - Prioritized recommendations for improvement

## Prerequisites

- Node.js 18+
- GitHub CLI with Copilot extension

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login to GitHub
gh auth login

# Install Copilot CLI extension
gh extension install github/gh-copilot
```

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/copilot-autopsy.git
cd copilot-autopsy

# Install dependencies
npm install

# Install globally (makes 'autopsy' command available everywhere)
npm install -g .
```

## Usage

```bash
# Run in any repository
cd /path/to/any/repo
autopsy

# Quick analysis (30 seconds)
autopsy --depth quick

# Focus on security only
autopsy --focus security

# Show Copilot CLI calls
autopsy --verbose
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--path <dir>` | `-p` | Target repository path | `.` |
| `--output <file>` | `-o` | Output file name | `AUTOPSY.md` |
| `--depth <level>` | `-d` | Analysis depth: `quick`, `standard`, `deep` | `standard` |
| `--focus <area>` | `-f` | Focus: `security`, `quality`, `architecture`, `testing`, `docs`, `all` | `all` |
| `--fix` | | Generate fix suggestions | `false` |
| `--verbose` | `-v` | Show Copilot CLI calls | `false` |

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Scanner   │───▶│  Analyzer   │───▶│ Aggregator  │───▶│  Reporter   │
│   Module    │    │   Module    │    │   Module    │    │   Module    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                                      │
      ▼                  ▼                                      ▼
  Detect project    GitHub Copilot                         AUTOPSY.md
  type & files      CLI analysis                           report
```

1. **Scanner** detects your project type, language, framework, and key files
2. **Analyzer** sends structured prompts to GitHub Copilot CLI for each analysis category
3. **Aggregator** deduplicates findings and calculates severity scores
4. **Reporter** generates a professional AUTOPSY.md report

## Sample Output

```
🔬 COPILOT AUTOPSY v1.0.0
═══════════════════════════════════════════════════════════════════

📁 Repository: /Users/dev/my-project
🔍 Depth: standard
🎯 Focus: all

📊 PROJECT DETECTION
────────────────────
✓ Language: TypeScript (78%), JavaScript (22%)
✓ Framework: Next.js + React
✓ Tooling: ESLint, Prettier, Jest, GitHub Actions
✓ Files: 142 total (47 source)

🤖 COPILOT ANALYSIS
   Powered by GitHub Copilot CLI

✓ 📝 Code Quality: 5 findings
✓ 🔒 Security: 2 findings
✓ 🏗️ Architecture: 3 findings
✓ 🧪 Testing: 4 findings
✓ 📚 Documentation: 2 findings

┌──────────────────────────────────────┐
│     📋 AUTOPSY COMPLETE              │
│                                      │
│     Health Score: 72/100             │
│     ██████████████░░░░░░  72%        │
│                                      │
│     🔴 Critical: 1   🟠 High: 3      │
│     🟡 Medium: 8     🟢 Low: 4       │
│                                      │
│     Duration: 45.2s                  │
│     Copilot CLI calls: 18           │
└──────────────────────────────────────┘
```

## Why GitHub Copilot CLI?

Copilot Autopsy is built specifically for the **GitHub Copilot CLI Challenge**. All code analysis intelligence comes from GitHub Copilot CLI:

- Every quality issue is detected by Copilot CLI
- Every security vulnerability is identified by Copilot CLI
- Every "why this matters" explanation is generated by Copilot CLI
- The tool orchestrates multiple Copilot CLI calls into one coherent report

Without GitHub Copilot CLI, this tool would have no intelligence.

## License

MIT

## Author

Built with ❤️ for the GitHub Copilot CLI Challenge
