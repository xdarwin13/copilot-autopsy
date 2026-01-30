/**
 * Prompt Templates for Copilot CLI Analysis
 * Each template is designed for specific analysis types
 */

/**
 * Code Quality Analysis Prompt
 */
export function buildQualityPrompt(file, context) {
    return `You are a senior code reviewer performing a forensic analysis.

PROJECT: ${context.framework || 'Generic'} ${context.languages?.[0]?.name || 'Unknown'} project

FILE: ${file.relativePath}
\`\`\`${getLanguageId(file.extension)}
${file.content}
\`\`\`

Analyze for quality issues:
1. Code smells (long methods >50 lines, deep nesting >3 levels, magic numbers)
2. SOLID violations
3. DRY violations (duplicated logic)
4. Complexity issues
5. Poor naming

For EACH issue found, respond in this EXACT format (one per line):
[QUAL-NNN] SEVERITY | LINE | Description | Why this matters | Fix suggestion

Severity: critical, high, medium, low
If no issues, respond: NO_ISSUES_FOUND`;
}

/**
 * Security Analysis Prompt
 */
export function buildSecurityPrompt(file, context) {
    return `You are a security researcher performing a forensic security audit.

FILE: ${file.relativePath}
FRAMEWORK: ${context.framework || 'Unknown'}
HAS_ENV: ${context.hasEnvFile ? 'Yes' : 'No'}

\`\`\`${getLanguageId(file.extension)}
${file.content}
\`\`\`

Analyze for security vulnerabilities:
1. Injection flaws (SQL, XSS, Command injection)
2. Authentication/Authorization issues
3. Sensitive data exposure
4. Hardcoded secrets/credentials
5. Missing input validation
6. Insecure configurations

For EACH vulnerability found, respond in this EXACT format (one per line):
[SEC-NNN] SEVERITY | LINE | CWE-ID | Description | Exploitation risk | Fix

Severity: critical, high, medium, low
If no issues, respond: NO_ISSUES_FOUND`;
}

/**
 * Architecture Analysis Prompt
 */
export function buildArchitecturePrompt(context) {
    const fileList = context.keyFiles
        .slice(0, 20)
        .map(f => f.relativePath)
        .join('\n');

    return `You are a software architect analyzing codebase structure.

PROJECT STRUCTURE:
${context.directoryTree}

KEY FILES:
${fileList}

DEPENDENCIES:
${context.dependencies.runtime?.slice(0, 15).join(', ') || 'None detected'}

Analyze architecture for:
1. Circular dependencies
2. God classes/modules (files doing too much)
3. Missing abstractions
4. Tight coupling
5. Layer violations (e.g., UI calling DB directly)

For EACH issue found, respond in this EXACT format (one per line):
[ARCH-NNN] SEVERITY | LOCATION | Description | Impact | Refactoring suggestion

Severity: critical, high, medium, low
If no issues, respond: NO_ISSUES_FOUND`;
}

/**
 * Testing Analysis Prompt
 */
export function buildTestingPrompt(sourceFile, testFile, context) {
    const sourceContent = sourceFile?.content || 'No source file';
    const testContent = testFile?.content || 'No tests found';

    return `You are a QA engineer analyzing test coverage.

SOURCE FILE: ${sourceFile?.relativePath || 'Unknown'}
\`\`\`${getLanguageId(sourceFile?.extension || '.js')}
${sourceContent.substring(0, 5000)}
\`\`\`

TEST FILE: ${testFile?.relativePath || 'None'}
\`\`\`${getLanguageId(testFile?.extension || '.js')}
${testContent.substring(0, 3000)}
\`\`\`

Analyze testing gaps:
1. Untested functions/methods
2. Missing edge case tests
3. Missing error handling tests
4. Weak assertions

For EACH gap found, respond in this EXACT format (one per line):
[TEST-NNN] SEVERITY | FUNCTION | What's missing | Why it matters | Example test

Severity: critical, high, medium, low
If no issues, respond: NO_ISSUES_FOUND`;
}

/**
 * Documentation Analysis Prompt
 */
export function buildDocumentationPrompt(context, readme) {
    const readmeContent = readme?.content || 'No README found';
    const undocumented = context.keyFiles
        .filter(f => !f.content.includes('/**') && !f.content.includes('"""'))
        .slice(0, 5)
        .map(f => f.relativePath)
        .join(', ');

    return `You are a technical writer analyzing documentation.

README:
\`\`\`markdown
${readmeContent.substring(0, 3000)}
\`\`\`

PROJECT: ${context.framework || 'Unknown'} with ${context.fileCount} files
UNDOCUMENTED FILES: ${undocumented || 'None detected'}
DEPENDENCIES: ${context.dependencies.runtime?.length || 0} runtime, ${context.dependencies.dev?.length || 0} dev

Analyze documentation for:
1. Missing/incomplete README sections (install, usage, API)
2. Missing JSDoc/docstrings in code
3. Outdated information
4. Missing contributing guidelines
5. Missing license

For EACH issue found, respond in this EXACT format (one per line):
[DOC-NNN] SEVERITY | LOCATION | What's missing | Impact | Suggested content

Severity: critical, high, medium, low
If no issues, respond: NO_ISSUES_FOUND`;
}

/**
 * Root Cause Analysis Prompt (WHY analysis)
 */
export function buildRootCausePrompt(finding, codeContext) {
    return `You are explaining WHY a code issue exists, not just WHAT it is.

FINDING: ${finding.id} - ${finding.description}
SEVERITY: ${finding.severity}
LOCATION: ${finding.location || finding.file}

RELEVANT CODE:
\`\`\`
${codeContext.substring(0, 2000)}
\`\`\`

Explain in 2-3 sentences:
1. The likely reason this issue was introduced
2. The technical debt it creates
3. The priority for fixing it

Be specific and actionable. Do not repeat the finding description.`;
}

/**
 * Get language identifier for code blocks
 */
function getLanguageId(extension) {
    const map = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.go': 'go',
        '.java': 'java',
        '.rb': 'ruby',
        '.php': 'php',
        '.rs': 'rust'
    };
    return map[extension] || 'text';
}
