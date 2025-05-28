# Changelog

All notable changes to PushScript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-28

### Added
- **🤖 Multi-Provider AI Support**: Support for Groq, OpenAI, Anthropic Claude, and Google Gemini
- **⚙️ Custom Configuration System**: 
  - Support for `.pushscript.json`, `.pushscript.yml`, `.pushscript.yaml` config files
  - Configuration via `package.json` pushscript field
  - Customizable commit message styles and prompts
  - Configurable validation rules (max length, conventional commits, allowed types)
  - Pattern-based rules for file analysis
- **📦 Auto-Package Setup**: 
  - Automatic npm script installation (`npm run push`, `npm run commit`, `npm run pushscript`)
  - Interactive setup with user consent
  - One-time setup with preference memory
  - Manual setup command: `pushscript setup`
- **🔒 Security Features**:
  - Sensitive file detection and warnings
  - Dependency vulnerability scanning
  - Large JSON file detection and auto-gitignore
  - Security check integration in commit workflow
- **🔧 Dependency Management**:
  - Dependency conflict detection
  - AI-powered conflict analysis and resolution suggestions
  - Support for npm, yarn, and pnpm package managers
  - Peer dependency validation
- **🚀 Token Optimization**:
  - Smart diff optimization for LLM APIs
  - Token usage tracking and rate limiting
  - Provider-specific token management
  - Gemini Flash model optimization
- **📝 Commit Message Generation**:
  - Conventional commit format enforcement
  - Intelligent change categorization
  - Multi-line commit message support
  - Fallback to simple generation on API failures
- **🎨 Enhanced CLI Experience**:
  - Colorized output and formatting
  - Progress indicators and status messages
  - Interactive prompts for user decisions
  - Comprehensive help system
- **🧪 Testing Infrastructure**:
  - Comprehensive test suite with 11 test cases
  - Config integration testing
  - Auto-package setup testing
  - Environment variable testing
  - JSON size limiter testing

### Technical Features
- **ESM Module Support**: Full ES6 module compatibility
- **Environment Management**: Flexible .env file loading with priority system
- **Git Integration**: Advanced git status parsing and change analysis
- **Error Handling**: Graceful fallbacks and detailed error reporting
- **Debug Mode**: `PUSHSCRIPT_DEBUG=true` for detailed logging
- **Cross-Platform**: Support for macOS, Linux, and Windows

### Configuration Options
- **Commit Styles**: Fully customizable AI prompts
- **Validation Rules**: 
  - `max_length`: Character limit for first line (default: 80)
  - `require_conventional`: Enforce conventional commit format (default: true)
  - `allowed_types`: Customizable commit types (default: feat, fix, docs, style, refactor, perf, test, chore)
- **Pattern Rules**: File path-based scope and type hints
- **Security Settings**: Configurable JSON size limits and auto-gitignore behavior

### CLI Commands
- `pushscript` - Interactive commit and push
- `pushscript commit` - Commit only
- `pushscript push` - Commit and push
- `pushscript setup` - Manual package setup
- `pushscript --help` - Show help information

### Supported AI Providers
- **Groq**: Fast inference with Llama models
- **OpenAI**: GPT-3.5 and GPT-4 support
- **Anthropic**: Claude 3 Haiku, Sonnet, and Opus
- **Google Gemini**: Gemini 1.5 Flash and Pro models

### Package Details
- **Size**: 31.3 kB compressed / 111.5 kB unpacked
- **Files**: 23 total files
- **Dependencies**: Minimal external dependencies
- **License**: MIT
- **Node.js**: Requires Node.js 16+ for ESM support

---

## Future Releases

### Planned for v0.2.0
- GitHub integration for pull request automation
- Custom commit templates
- Branch-specific configuration
- Commit message history and learning
- Plugin system for extensibility

### Planned for v0.3.0
- Web dashboard for team configuration
- Commit analytics and insights
- Integration with popular IDEs
- Advanced security scanning

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to PushScript.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 