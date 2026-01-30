# 🔬 Copilot Autopsy

<div align="center">

![Copilot Autopsy Banner](https://img.shields.io/badge/🔬_Copilot_Autopsy-Repository_Forensics-blueviolet?style=for-the-badge)

**AI-Powered Repository Forensics • Powered by GitHub Copilot CLI**

[![GitHub Copilot CLI Challenge](https://img.shields.io/badge/GitHub_Copilot-CLI_Challenge_2026-blue?style=flat-square&logo=github)](https://dev.to/challenges/github-2026-01-21)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Made with Copilot](https://img.shields.io/badge/Made_with-GitHub_Copilot-black?style=flat-square&logo=github-copilot)](https://github.com/features/copilot)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [How It Works](#-how-it-works) • [Demo](#-demo)

</div>

---

## 🎯 What is Copilot Autopsy?

**Copilot Autopsy** performs a deep forensic analysis ("autopsy") of any GitHub repository using **GitHub Copilot CLI** as the AI reasoning engine.

> 💡 **Unlike traditional linters** that just list problems, Copilot Autopsy explains **WHY** issues exist and provides actionable fixes—all powered by GitHub Copilot CLI.

### The Problem

```
❌ "Function too long"         → But WHY was it written this way?
❌ "Possible SQL injection"    → But HOW do I fix it properly?
❌ "Missing tests"             → But WHICH functions need tests first?
```

### The Solution

```
✅ Explains the ROOT CAUSE of each issue
✅ Provides CONTEXT-AWARE fixes with code examples
✅ Prioritizes findings by SEVERITY and IMPACT
✅ Generates a beautiful AUTOPSY.md report
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Auto-Detection** | Automatically detects language, framework, and tooling |
| 📝 **Code Quality** | Finds code smells, SOLID violations, complexity issues |
| 🔒 **Security Scanning** | Identifies vulnerabilities with CWE references |
| 🏗️ **Architecture Review** | Detects circular dependencies, coupling issues |
| 🧪 **Test Gap Analysis** | Finds untested code and missing test cases |
| 📚 **Documentation Check** | Reviews README, JSDoc, and contributing guidelines |
| 📊 **Health Score** | Visual 0-100 score with severity breakdown |
| 📋 **AUTOPSY.md Report** | Professional Markdown report with action items |
| 🎨 **Beautiful Terminal UI** | ASCII art, progress bars, colored output |

---

## 📁 Project Structure

```
copilot-autopsy/
├── 📄 bin/
│   └── copilot-autopsy.js      # CLI entry point
├── 📁 src/
│   ├── cli.js                  # Commander.js setup
│   ├── index.js                # Main orchestrator
│   ├── 📁 ui/                  # Terminal UI components
│   │   ├── banner.js           # ASCII art banner
│   │   └── progress.js         # Progress bars & summary
│   ├── 📁 scanner/             # Project detection
│   │   ├── index.js            # Scanner orchestrator
│   │   ├── 📁 detectors/
│   │   │   ├── language.js     # Language detection
│   │   │   ├── framework.js    # Framework detection
│   │   │   └── tooling.js      # Tooling detection
│   │   └── 📁 collectors/
│   │       ├── files.js        # Smart file collector
│   │       └── dependencies.js # Dependency parser
│   ├── 📁 analyzer/            # AI analysis engine
│   │   ├── index.js            # Analyzer orchestrator
│   │   ├── copilot.js          # 🌟 GitHub Copilot CLI wrapper
│   │   ├── 📁 prompts/
│   │   │   └── templates.js    # 6 specialized prompts
│   │   └── 📁 analyzers/
│   │       ├── quality.js      # Code quality analyzer
│   │       ├── security.js     # Security analyzer
│   │       ├── architecture.js # Architecture analyzer
│   │       ├── testing.js      # Test coverage analyzer
│   │       └── documentation.js # Documentation analyzer
│   ├── 📁 aggregator/
│   │   └── index.js            # Finding deduplication & scoring
│   └── 📁 reporter/
│       └── index.js            # AUTOPSY.md generator
├── 📄 package.json
├── 📄 README.md
└── 📄 .gitignore
```

---

## 🚀 Installation

### Prerequisites

- **Node.js 18+**
- **GitHub CLI** with Copilot extension

### Step 1: Install GitHub CLI

<details>
<summary><b>macOS</b></summary>

```bash
brew install gh
```
</details>

<details>
<summary><b>Linux (Debian/Ubuntu)</b></summary>

```bash
sudo apt install gh
```
</details>

<details>
<summary><b>Linux (Fedora)</b></summary>

```bash
sudo dnf install gh
```
</details>

<details>
<summary><b>Windows</b></summary>

**Option 1: winget (Windows 10/11)**
```powershell
winget install --id GitHub.cli
```

**Option 2: Chocolatey**
```powershell
choco install gh
```

**Option 3: Scoop**
```powershell
scoop install gh
```

**Option 4: Direct Download**
1. Go to: https://cli.github.com/
2. Download and run the `.msi` installer
3. Restart terminal
</details>

### Step 2: Setup Copilot CLI

> ⚠️ **Important:** GitHub CLI and Copilot CLI are **separate**. You must install Copilot as an extension!

```bash
# Login to GitHub
gh auth login

# Verify login
gh auth status

# Install Copilot CLI extension
gh extension install github/gh-copilot

# Verify Copilot works
gh copilot -p "test"
```

<details>
<summary><b>Windows Extra Steps</b></summary>

When installing Copilot, you'll be prompted:
```
? Authenticate Git with your GitHub credentials? (Y/n) y
! First copy your one-time code: XXXX-XXXX
Press Enter to open browser...
✓ Authentication complete.
```
</details>

### Step 3: Install Copilot Autopsy

```bash
# Clone the repository
git clone https://github.com/xdarwin13/copilot-autopsy.git
cd copilot-autopsy

# Install dependencies
npm install

# Install globally
npm install -g .

# On Linux/macOS if permission denied:
sudo npm install -g .
```

---

## 💻 Usage

```bash
# Analyze current directory
autopsy

# Quick analysis (30 seconds)
autopsy --depth quick

# Focus on security only
autopsy --focus security

# Deep analysis (all files)
autopsy --depth deep

# Show Copilot CLI calls in real-time
autopsy --verbose
```

### All Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--path <dir>` | `-p` | Target repository path | `.` |
| `--output <file>` | `-o` | Output file name | `AUTOPSY.md` |
| `--depth <level>` | `-d` | `quick`, `standard`, `deep` | `standard` |
| `--focus <area>` | `-f` | `security`, `quality`, `architecture`, `testing`, `docs`, `all` | `all` |
| `--fix` | | Generate fix suggestions | `false` |
| `--verbose` | `-v` | Show Copilot CLI calls | `false` |

---

## 🎬 Demo

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

╭────────────────────────────╮
│                            │
│   📋 AUTOPSY COMPLETE      │
│                            │
│   Health Score: 72/100     │
│   ██████████████░░░░░░     │
│                            │
│   🔴 Critical: 1           │
│   🟠 High: 3               │
│   🟡 Medium: 8             │
│   🟢 Low: 4                │
│                            │
│   Duration: 45.2s          │
│   Copilot CLI calls: 18    │
│                            │
╰────────────────────────────╯
```

---

## 🧠 How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SCANNER   │───▶│  ANALYZER   │───▶│ AGGREGATOR  │───▶│  REPORTER   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
  Detect            GitHub              Dedupe &          AUTOPSY.md
  Language,         Copilot             Score             Report
  Framework,        CLI ⭐              Findings
  Tooling
```

### 1. Scanner Module
Automatically detects:
- Programming languages (JS, TS, Python, Go, etc.)
- Frameworks (React, Next.js, Express, Django, etc.)
- Tooling (ESLint, Jest, GitHub Actions, Docker, etc.)

### 2. Analyzer Module
Sends **6 specialized prompts** to GitHub Copilot CLI:
- Quality Analysis (code smells, SOLID)
- Security Analysis (vulnerabilities, CWE)
- Architecture Analysis (coupling, dependencies)
- Testing Analysis (coverage gaps)
- Documentation Analysis (README check)
- Root Cause Analysis (the **WHY**)

### 3. Aggregator Module
- Deduplicates findings
- Normalizes severity levels
- Calculates Health Score (0-100)

### 4. Reporter Module
- Generates professional `AUTOPSY.md`
- Groups findings by category
- Prioritizes action items

---

## 🌟 Why GitHub Copilot CLI?

**Copilot Autopsy is built for the GitHub Copilot CLI Challenge.**

Every piece of intelligence comes from `gh copilot`:

```javascript
// The brain of Copilot Autopsy
async query(prompt) {
  const result = execSync(
    `gh copilot -p ${JSON.stringify(prompt)}`,
    { encoding: 'utf-8', timeout: 120000 }
  );
  return this.parseResponse(result);
}
```

**Without GitHub Copilot CLI, this tool would have zero intelligence.**

---

## 📄 License

MIT

---

## 👨‍💻 Author

Built with ❤️ for the **GitHub Copilot CLI Challenge 2026**

<div align="center">

⭐ **Star this repo if you find it useful!** ⭐

</div>
