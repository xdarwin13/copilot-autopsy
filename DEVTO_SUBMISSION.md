# 🔬 Copilot Autopsy: AI-Powered Repository Forensics with GitHub Copilot CLI

*This is a submission for the [GitHub Copilot CLI Challenge](https://dev.to/challenges/github-2026-01-21)*

## What I Built

**Copilot Autopsy** is a terminal-first forensic analysis tool that performs deep "autopsies" of any GitHub repository using **GitHub Copilot CLI** as the AI reasoning engine.

> 💡 Unlike traditional linters that just list problems, Copilot Autopsy explains **WHY** issues exist—powered entirely by GitHub Copilot CLI.

### ✨ The Problem It Solves

Developers often run linters and get a list of issues like:
- ❌ "Function too long"
- ❌ "Possible SQL injection"
- ❌ "Missing tests"

But they don't explain **WHY** this happened or **HOW** to fix it properly.

**Copilot Autopsy** uses GitHub Copilot CLI to:
1. Analyze your code contextually
2. Explain the root cause of each issue
3. Provide actionable fixes with code examples
4. Generate a beautiful Markdown report

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COPILOT AUTOPSY CLI                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │ Scanner  │──▶│ Analyzer │──▶│Aggregator│──▶│ Reporter │        │
│  │  Module  │   │  Module  │   │  Module  │   │  Module  │        │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│       │              │                              │               │
│       ▼              ▼                              ▼               │
│  ┌──────────┐   ┌──────────┐                  ┌──────────┐        │
│  │  Detect  │   │  GitHub  │                  │ AUTOPSY  │        │
│  │ Language │   │  Copilot │                  │   .md    │        │
│  │Framework │   │  CLI ⭐  │                  │  Report  │        │
│  │ Tooling  │   │          │                  │          │        │
│  └──────────┘   └──────────┘                  └──────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SCAN      │     │   ANALYZE   │     │  AGGREGATE  │     │   REPORT    │
│             │     │             │     │             │     │             │
│ • Language  │────▶│ • Quality   │────▶│ • Dedupe    │────▶│ • Health    │
│ • Framework │     │ • Security  │     │ • Score     │     │   Score     │
│ • Files     │     │ • Arch      │     │ • Prioritize│     │ • Findings  │
│ • Deps      │     │ • Tests     │     │             │     │ • Actions   │
│             │     │ • Docs      │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   GITHUB    │
                    │  COPILOT    │
                    │    CLI      │
                    │     ⭐      │
                    └─────────────┘
```

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🔍 **Auto-Detection** | Detects language, framework, tooling automatically |
| 📝 **Code Quality** | Finds code smells, SOLID violations, complexity |
| 🔒 **Security** | Vulnerabilities with CWE references |
| 🏗️ **Architecture** | Circular dependencies, coupling issues |
| 🧪 **Testing** | Missing tests, coverage gaps |
| 📚 **Documentation** | README and JSDoc analysis |
| 📊 **Health Score** | 0-100 score with visualization |
| 📋 **Report** | Beautiful AUTOPSY.md with action items |

---

## 🎬 Demo

### Installation

#### 1. Install GitHub CLI

**macOS:**
```bash
brew install gh
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install gh
```

**Windows:**
```powershell
winget install GitHub.cli
```

#### 2. Setup Copilot CLI

```bash
# Login to GitHub
gh auth login

# Install Copilot CLI extension
gh extension install github/gh-copilot
```

#### 3. Install Copilot Autopsy

```bash
# Clone the repository
git clone https://github.com/xdarwin13/copilot-autopsy.git
cd copilot-autopsy

# Install dependencies
npm install

# Install globally
npm install -g .

# Run on any repo!
autopsy
```

### Terminal Output

```
   ____            _ _       _      _         _                        
  / ___|___  _ __ (_) | ___ | |_   / \  _   _| |_ ___  _ __  ___ _   _ 
 | |   / _ \| '_ \| | |/ _ \| __| / _ \| | | | __/ _ \| '_ \/ __| | | |
 | |__| (_) | |_) | | | (_) | |_ / ___ \ |_| | || (_) | |_) \__ \ |_| |
  \____\___/| .__/|_|_|\___/ \__/_/   \_\__,_|\__\___/| .__/|___/\__, |
            |_|                                       |_|        |___/ 

╭───────────────────────────────────────────────────────────╮
│  🔬 Repository Forensics • Powered by GitHub Copilot CLI  │
╰───────────────────────────────────────────────────────────╯

📊 PROJECT DETECTION
────────────────────────────────────────
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

╭────────────────────────────────╮
│                                │
│   📋 AUTOPSY COMPLETE          │
│                                │
│   Health Score: 72/100         │
│   ██████████████░░░░░░  72%    │
│                                │
│   🔴 Critical: 1   🟠 High: 3  │
│   🟡 Medium: 8     🟢 Low: 4   │
│                                │
│   Duration: 45.2s              │
│   Copilot CLI calls: 18        │
│                                │
╰────────────────────────────────╯
```

### Generated AUTOPSY.md Report

The tool generates a professional Markdown report:

```markdown
# 🔬 Repository Autopsy Report

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| **Repository** | `my-project` |
| **Primary Language** | TypeScript |
| **Framework** | Next.js |
| **Health Score** | 72/100 |

### Health Score: 72/100
████████████████░░░░░░  72%

## 🔍 Detailed Findings

### 🔒 Security Vulnerabilities

#### SEC-001: SQL Injection Risk

| Property | Value |
|----------|-------|
| **Severity** | 🔴 CRITICAL |
| **Location** | `src/api/users.ts:45` |

**Description:**
User input is directly concatenated into SQL query.

**Why This Matters:**
Attackers can manipulate the query to access or delete data.

**Suggested Fix:**
Use parameterized queries or an ORM.

---

## 🎯 Recommended Action Plan

### Priority 1: Address Security Vulnerabilities
Review and fix all security findings immediately.
```

---

## 🔧 CLI Options

```bash
# Quick analysis (30 seconds)
autopsy --depth quick

# Deep analysis (all files)
autopsy --depth deep

# Focus on security only
autopsy --focus security

# Focus on code quality
autopsy --focus quality

# Show Copilot CLI calls in real-time
autopsy --verbose

# Custom output file
autopsy --output MY_REPORT.md
```

### All Options

| Option | Description | Default |
|--------|-------------|---------|
| `--depth` | `quick`, `standard`, `deep` | `standard` |
| `--focus` | `security`, `quality`, `architecture`, `testing`, `docs`, `all` | `all` |
| `--path` | Target repository path | `.` |
| `--output` | Output file name | `AUTOPSY.md` |
| `--verbose` | Show Copilot CLI calls | `false` |
| `--fix` | Include code fix examples | `false` |

---

## 💡 My Experience with GitHub Copilot CLI

### The Core Integration

**GitHub Copilot CLI is the brain of this project.** Without it, Copilot Autopsy would have zero intelligence.

Here's how I integrated it:

```javascript
// src/analyzer/copilot.js

class CopilotCLI {
  async query(prompt) {
    // Send prompt to GitHub Copilot CLI
    const result = execSync(
      `echo ${JSON.stringify(prompt)} | gh copilot explain -`,
      { encoding: 'utf-8', timeout: 90000 }
    );
    
    return this.parseResponse(result);
  }
}
```

### Prompt Engineering

I designed 6 specialized prompts for different analysis types:

```javascript
// Quality Analysis Prompt
const QUALITY_PROMPT = `
You are a senior code reviewer performing forensic analysis.

FILE: ${file.path}
\`\`\`${language}
${content}
\`\`\`

Analyze for:
1. Code smells (long methods, deep nesting)
2. SOLID violations
3. DRY violations
4. Complexity issues

For EACH issue, respond:
[QUAL-NNN] SEVERITY | LINE | Description | Why | Fix
`;
```

### The "Why" Analysis - Unique Feature

What makes Copilot Autopsy special is the **root cause analysis**:

```javascript
// Root Cause Prompt
const ROOT_CAUSE_PROMPT = `
Explain WHY this code issue exists, not just WHAT it is.

FINDING: ${finding.description}
CODE: ${codeContext}

Explain in 2-3 sentences:
1. The likely reason this was introduced
2. The technical debt it creates
3. The fix priority
`;
```

This gives developers **context** instead of just a list of problems.

### Orchestration Strategy

I orchestrate **15-20 Copilot CLI calls** into one coherent report:

```
Phase 1 (Parallel):     Phase 2:          Phase 3:          Phase 4:
┌─────────────┐         ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Quality     │         │Architecture │   │ Root Cause  │   │   Report    │
│ Security    │────────▶│  Analysis   │──▶│  Analysis   │──▶│ Generation  │
│ Docs        │         │             │   │ (critical)  │   │             │
└─────────────┘         └─────────────┘   └─────────────┘   └─────────────┘
```

### What I Learned

1. **Copilot CLI handles complex prompts well** - Even 2000+ character prompts work
2. **Rate limiting is important** - I added 1.5s delays between calls
3. **Response parsing requires creativity** - Structured prompts help get parseable output
4. **The "explain" command is powerful** - It understands context deeply

---

## 🏆 Why This Project?

I built Copilot Autopsy because:

1. **Linters tell you WHAT, not WHY** - Copilot CLI adds context
2. **Code reviews are time-consuming** - Automate the first pass
3. **Security scanning is often shallow** - AI can understand intent
4. **Onboarding is hard** - Health Score gives quick overview

---

## 📦 Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| CLI Framework | Commander.js |
| Terminal UI | Chalk, Ora, Boxen |
| AI Engine | **GitHub Copilot CLI** ⭐ |
| Templating | Handlebars |

---

## 🔗 Links

- **GitHub:** [github.com/xdarwin13/copilot-autopsy](https://github.com/xdarwin13/copilot-autopsy)
- **npm:** `npm install -g copilot-autopsy`

---

## 🙏 Acknowledgments

Built with ❤️ for the **GitHub Copilot CLI Challenge**

Special thanks to the GitHub Copilot team for creating such a powerful CLI tool!

---

*If you found this useful, give it a ⭐ on GitHub!*
