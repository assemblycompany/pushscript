# PushScript Roadmap

## 🔐 Hardcoded Secret Detection

**Status:** Missing / Proposed  
**Priority:** High Security Enhancement  
**Impact:** Prevents accidental commit of API keys, tokens, and sensitive credentials

### Current Gap

PushScript currently scans for:
- ✅ Sensitive file patterns (`.env`, `credentials.json`, etc.)
- ✅ Large JSON files
- ✅ Dependency vulnerabilities

**Missing:** Detection of hardcoded secrets within file contents before commit.

### Implementation Approach

#### 1. Secret Scanner Module
Create `src/security/secret-scanner.js` with:

**Secret patterns to detect:**
- API keys (`AIza...`, `sk-...`, `pk_...`)
- GitHub tokens (`ghp_...`, `gho_...`)
- Slack tokens (`xoxb-...`, `xoxp-...`)
- AWS credentials (`AKIA...`, `SECRET_ACCESS_KEY`)
- Connection strings (`mongodb://`, `postgres://`, `mysql://`)
- JWT tokens (Base64 patterns)
- Private keys (`-----BEGIN PRIVATE KEY-----`)
- Database URLs with credentials

#### 2. Integration Point
Insert into existing security flow:
```
1. Pre-staging checks → runSecurityChecks()
2. Staging → git add .
3. 🆕 SECRET SCANNING → checkHardcodedSecrets()  ← NEW
4. Post-staging checks → Large JSON + sensitive files recheck
5. Dependency scanning → Conflicts + vulnerabilities
6. Commit
```

#### 3. Smart Filtering
- **Ignore test files** - `*.test.js`, `*_test.py`, `test/**`
- **Ignore documentation** - `*.md`, `docs/**`
- **Ignore examples** - `example.*`, `*.example.*`
- **Configurable patterns** - Via `.pushscript.json`

#### 4. Configuration Support
Allow customization in `.pushscript.json`:
```json
{
  "security": {
    "secretDetection": {
      "enabled": true,
      "ignorePatterns": ["test/**", "docs/**"],
      "customPatterns": ["CUSTOM_API_.*"],
      "severity": "warn" // "error" | "warn" | "info"
    }
  }
}
```

#### 5. User Experience
- **Interactive prompts** - Allow override for intentional test data
- **Clear reporting** - Show file, line number, and pattern matched
- **Actionable guidance** - Suggest moving to environment variables

### Benefits
- 🔒 **Prevent credential leaks** before they reach remote repository
- 👥 **Team protection** - Catches secrets across all team members
- ⚙️ **Configurable** - Teams can customize patterns and severity
- 🚀 **Zero setup** - Works out of the box with sensible defaults

---

## 🔄 Auto PR Creation with AI-Generated Descriptions

**Status:** Missing / Proposed  
**Priority:** High Team Productivity Enhancement  
**Impact:** Streamlines team workflows by automating pull request creation and description generation

### Current Gap

PushScript currently handles:
- ✅ AI-generated commit messages
- ✅ Branch targeting (`--main`, `--dev`)
- ✅ Team-friendly configuration

**Missing:** Automatic pull request creation with AI-generated descriptions for GitHub/GitLab workflows.

### Implementation Approach

#### 1. PR Creation Module
Create `src/git/pr-manager.js` with:

**Platform support:**
- GitHub API (primary)
- GitLab API
- Bitbucket API (future)

#### 2. Integration Point
Extend existing push workflow:
```
1. Commit → AI-generated message
2. Push → Target branch
3. 🆕 PR CREATION → createPullRequest() ← NEW (optional)
```

#### 3. Command Interface
```bash
pushscript "feat: add payment gateway" dev --pr
pushscript --pr                    # Current branch → main
pushscript commit --pr-draft       # Create draft PR
```

#### 4. Configuration Support
```json
{
  "auto_pr": true,
  "pr_base_branch": "main", 
  "pr_description_style": "Concise, include issue references and technical impact.",
  "pr_draft_by_default": false,
  "github_token_env": "GITHUB_API_TOKEN"
}
```

#### 5. AI-Generated PR Descriptions
Leverage existing LLM integration:
- **Summarize changes** - Based on commit messages and file changes
- **Link issues** - Auto-detect `fixes #123`, `closes #456` patterns
- **Technical context** - Scope-aware descriptions (API, UI, etc.)
- **Review guidance** - Highlight areas needing attention

#### 6. Smart Defaults
- **Environment detection** - Auto-detect GitHub repo from git remote
- **Branch validation** - Ensure target branch exists
- **Token validation** - Clear error messages for missing tokens
- **Fallback gracefully** - Continue with push if PR creation fails

### Benefits
- ⚡ **Saves time** - Eliminates manual PR creation and description writing
- 🤝 **Improves collaboration** - AI-generated descriptions provide clear context for reviewers
- 🎯 **Context-aware** - Leverages existing pattern-based config for tailored descriptions
- 👥 **Team-friendly** - Aligns with CI-aware, enterprise-focused features
- 🔧 **Low friction** - Optional usage, minimal setup required

---

## 📚 Intelligent README Updater (Long Term)

**Status:** Future / Research Phase  
**Priority:** Long-term Documentation Automation  
**Impact:** Keeps documentation automatically synchronized with actual codebase changes

### Current Gap

Documentation maintenance relies on:
- ❌ Manual README updates
- ❌ Commit message descriptions (incomplete picture)
- ❌ Developer memory to update docs

**Missing:** Intelligent analysis of actual code changes to automatically maintain documentation accuracy.

### Implementation Approach

#### 1. Enhanced 4-Step Pipeline
Replace basic analysis with sophisticated pipeline:

**Step 1: Delta Generation**
- LLM creates fresh documentation snippets from git diff + semantic analysis
- Generates new content rather than trying to patch existing text

**Step 1.5: Location Tagging** 
- LLM maps new content to existing doc sections with confidence scoring
- Provides reasoning for each mapping decision

**Step 2: Impact Analysis**
- Second LLM validates mappings, identifies conflicts, prioritizes by risk
- Prevents accidental overwrites of important sections

**Step 3: Surgical Application**
- Automated insertion/replacement of high-confidence changes
- Human review queue for complex/low-confidence cases

#### 2. Safety-First Architecture
**No risky direct modifications:**
- **Explainable reasoning** - Every change includes justification
- **Rollback capability** - Version control for documentation changes  
- **Progressive trust** - Start with low-risk changes, build confidence
- **Human oversight** - Complex changes always require approval

#### 3. Leverage Existing Tools
**Code Analysis Foundation:**
- **Tree-sitter** - Multi-language AST parsing for semantic understanding
- **Sourcegraph** - Code intelligence and semantic search capabilities
- **GitHub Semantic** - Language-aware code understanding
- **SemanticDiff** - Language-aware diff analysis beyond line changes

**Documentation Intelligence:**
- **GitBook API** - Structured documentation access and manipulation
- **Sphinx/Docusaurus parsers** - Technical documentation parsing
- **Confluence/Notion APIs** - Enterprise documentation platform integration

**Git Integration:**
- **Test Impact Analysis tools** - Detect change scope and blast radius
- **GitHub/GitLab webhooks** - Automated triggers on push/merge
- **Change Impact Detection** - Map code changes to documentation sections

#### 4. Smart Documentation Mapping
```json
{
  "readme_sections": {
    "installation": ["package.json", "README.md#installation"],
    "api_reference": ["src/api/**", "README.md#api"],
    "configuration": ["src/config.js", ".env.example", "README.md#config"],
    "cli_commands": ["src/cli.js", "README.md#usage"],
    "troubleshooting": ["src/security/**", "README.md#troubleshooting"]
  }
}
```

#### 5. Progressive Trust Model
- **Low-risk first** - Start with obvious changes (new CLI flags, config options)
- **Confidence scoring** - Each change includes AI confidence level and reasoning
- **Human approval gates** - Complex changes require developer review
- **Rollback safety** - All changes tracked with easy revert capability

#### 6. Quality Assurance
- **Cross-reference validation** - Ensure internal links remain valid after changes
- **Example code testing** - Verify generated examples actually compile/run
- **Style consistency** - Maintain existing documentation tone and format
- **Version synchronization** - Keep changelogs and version docs aligned

### Benefits
- 🛡️ **Safe automation** - "AI suggests precise improvements" not "AI rewrites your docs"
- 🧠 **Semantic understanding** - Analyzes actual code impact, not just text changes
- 🎯 **Surgical precision** - Targeted updates to specific sections with confidence scoring
- 📊 **Explainable changes** - Every update includes reasoning and impact analysis
- 🔄 **Progressive improvement** - Builds trust through successful low-risk changes first
- 👥 **Developer-friendly** - Reduces documentation burden without losing control

---

## 📚 Intelligent README Updater (Long Term)

**Status:** Future / Research Phase  
**Priority:** Long-term Documentation Automation  
**Impact:** Keeps documentation automatically synchronized with actual codebase changes

### Current Gap

Documentation maintenance relies on:
- ❌ Manual README updates
- ❌ Commit message descriptions (incomplete picture)
- ❌ Developer memory to update docs

**Missing:** Intelligent analysis of actual code changes to automatically maintain documentation accuracy.

### Implementation Approach

#### 1. Enhanced 4-Step Pipeline
Replace basic analysis with sophisticated pipeline:

**Step 1: Delta Generation**
- LLM creates fresh documentation snippets from git diff + semantic analysis
- Generates new content rather than trying to patch existing text

**Step 1.5: Location Tagging** 
- LLM maps new content to existing doc sections with confidence scoring
- Provides reasoning for each mapping decision

**Step 2: Impact Analysis**
- Second LLM validates mappings, identifies conflicts, prioritizes by risk
- Prevents accidental overwrites of important sections

**Step 3: Surgical Application**
- Automated insertion/replacement of high-confidence changes
- Human review queue for complex/low-confidence cases

#### 2. Safety-First Architecture
**No risky direct modifications:**
- **Explainable reasoning** - Every change includes justification
- **Rollback capability** - Version control for documentation changes  
- **Progressive trust** - Start with low-risk changes, build confidence
- **Human oversight** - Complex changes always require approval

#### 3. Leverage Existing Tools
**Code Analysis Foundation:**
- **Tree-sitter** - Multi-language AST parsing for semantic understanding
- **Sourcegraph** - Code intelligence and semantic search capabilities
- **GitHub Semantic** - Language-aware code understanding
- **SemanticDiff** - Language-aware diff analysis beyond line changes

**Documentation Intelligence:**
- **GitBook API** - Structured documentation access and manipulation
- **Sphinx/Docusaurus parsers** - Technical documentation parsing
- **Confluence/Notion APIs** - Enterprise documentation platform integration

**Git Integration:**
- **Test Impact Analysis tools** - Detect change scope and blast radius
- **GitHub/GitLab webhooks** - Automated triggers on push/merge
- **Change Impact Detection** - Map code changes to documentation sections

#### 4. Smart Documentation Mapping
```json
{
  "readme_sections": {
    "installation": ["package.json", "README.md#installation"],
    "api_reference": ["src/api/**", "README.md#api"],
    "configuration": ["src/config.js", ".env.example", "README.md#config"],
    "cli_commands": ["src/cli.js", "README.md#usage"],
    "troubleshooting": ["src/security/**", "README.md#troubleshooting"]
  }
}
```

#### 5. Update Strategy
- **Incremental updates** - Modify specific sections, not entire README
- **Preserve style** - Maintain existing documentation tone and format
- **Human review** - Generate updates as suggested changes, not automatic commits
- **Version awareness** - Update changelogs and version-specific documentation

#### 6. Advanced Features
- **Cross-reference validation** - Ensure internal links remain valid
- **Example code testing** - Verify generated examples actually work
- **Multi-file documentation** - Update related docs beyond just README
- **Deprecation tracking** - Flag outdated sections for removal

### Benefits
- 📖 **Always accurate docs** - Documentation stays synchronized with actual code
- 🧠 **Semantic understanding** - Analyzes what code actually does, not just surface changes
- ⚡ **Reduces maintenance burden** - Eliminates manual documentation drift
- 🎯 **Contextual updates** - Updates relevant sections based on actual impact
- 🔍 **Comprehensive analysis** - Catches changes commit messages miss
- 👥 **Team efficiency** - Frees developers from documentation maintenance tasks 