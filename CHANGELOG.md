# Changelog

All notable changes to PushScript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.12] - 2025-07-16

### Fixed
- **Commit Message Indentation**: Fixed overly indented commit message body lines that appeared muted
  - **Issue**: Commit message descriptions were being displayed with excessive indentation (4-6 spaces), making them hard to read
  - **Solution**: Reduced indentation to 2 spaces with visual indicators for better readability
  - **Result**: Commit message descriptions now display clearly and are easy to read while maintaining visual hierarchy

### Enhanced
- **Output Formatting and Readability**: Completely redesigned console output for better clarity and user experience
  - **Issue**: Console output was plain and difficult to read, lacking visual structure and hierarchy
  - **Solution**: Implemented comprehensive formatting system with sections, steps, icons, and proper indentation
  - **Result**: All output is now clearly structured with visual indicators, making it much easier to understand

### New Features
- **Section Headers**: Clear section dividers with titles and descriptions using dashes and icons
- **Step Indicators**: Visual progress indicators with status icons (ℹ️, ✅, ⚠️, ❌) and colors
- **Structured Displays**: 
  - Configuration display with provider, API key, and model information
  - File changes categorized by type (modified, added, deleted) with counts
  - Commit messages with proper multi-line formatting and indentation
  - Push summaries with clear commit message, file count, and target branch
- **Summary Boxes**: Bordered information boxes for important details
- **Hierarchical Information**: Proper indentation and tree-like structure for related information

### Technical Details
- **New Formatting Functions**: Added comprehensive set of display functions in `src/utils/formatting.js`
  - `displaySection()`: Section headers with titles and descriptions
  - `displayConfig()`: Configuration information display
  - `displayStep()`: Progress steps with status indicators
  - `displayCommitMessage()`: Structured commit message display
  - `displayFileChanges()`: Categorized file change display
  - `displayPushSummary()`: Final push confirmation display
  - `displaySummary()`: Information boxes with borders
- **Visual Enhancements**: 
  - Unicode icons for different types of information
  - Color-coded status indicators (blue for info, green for success, yellow for warnings, red for errors)
  - Proper indentation using tree-like characters (└─, │)
  - Dashed borders and separators for visual structure
- **Updated Output Locations**: All major output points now use the new formatting system
  - Configuration display at startup
  - File change summaries
  - AI commit message generation
  - Vulnerability scanning
  - Commit creation process
  - Push confirmation display

## [0.2.11] - 2025-07-14

### Fixed
- **Commit Message Display Formatting**: Improved readability of commit messages in the final confirmation display
  - **Issue**: Multi-line commit messages were being displayed as single paragraphs without proper line breaks
  - **Solution**: Updated the commit message display logic to properly format multi-line messages with indentation
  - **Result**: Commit messages now display with proper formatting, making them much easier to read and review

### Technical Details
- **Display Enhancement**: Modified `confirmPush` function to split commit messages by newlines and display each line separately
- **Readability Improvement**: Multi-line commit messages now show proper indentation and line breaks in the final confirmation
- **User Experience**: Users can now easily read and review detailed commit messages before confirming the push

## [0.2.10] - 2025-07-14

### Fixed
- **Gemini Response Sanitization Bug**: Fixed critical issue where AI-generated commit messages were being incorrectly rejected due to improper markdown sanitization
  - **Root Cause**: The sanitization logic was removing entire code block content instead of just markdown formatting
  - **Impact**: Valid conventional commit messages like `feat(data): implement smart data fetching` were being rejected with "does not match conventional format" error
  - **Solution**: Updated sanitization to preserve content while removing only markdown formatting (````text`, ````, backticks)
  - **Result**: AI-generated commit messages now pass validation correctly and are properly committed

### Technical Details
- **Regex Fix**: Changed from `/```[\s\S]*?```/g` (removes entire content) to `/```\w*\n?/g` and `/```\n?/g` (removes only formatting)
- **Content Preservation**: Commit message content is now preserved while markdown artifacts are removed
- **Test Updates**: Updated all sanitization tests to reflect new behavior where content is preserved
- **Backward Compatibility**: No breaking changes; existing functionality remains intact

## [0.2.9] - 2025-07-12

### Fixed
- **Commit Message Verbosity Balance**: Refined AI prompt to produce balanced commit messages
  - Adjusted Gemini provider prompt to encourage clear and informative but concise messages
  - Changed from "1-2 sentences" to "1-3 sentences" for explanation flexibility
  - Maintained detailed descriptions while preventing excessive verbosity
  - Result: Commit messages are now informative yet appropriately concise

## [0.2.8] - 2025-07-12

### Fixed
- **Enhanced AI Commit Message Quality**: Significantly improved the informativeness and detail of AI-generated commit messages
  - Increased maxTokens from 100 to 300 to allow for more detailed responses
  - Softened restrictive prompt instructions to encourage comprehensive descriptions
  - Updated default commit style to emphasize detailed, informative messages with examples
  - Improved diff optimization to preserve more context for better AI analysis
  - Added AI configuration section for customizable token limits and message preferences

### Added
- **AI Configuration Options**: 
  - `maxTokens` setting (default: 300) for controlling response length
  - `messageDetail` preference for fine-tuning detail level
  - Provider-specific token management improvements
- **Enhanced Prompt Engineering**: 
  - More explicit instructions for detailed commit messages
  - Better examples and formatting guidance
  - Improved context preservation in diff processing
- **Better Message Quality**: 
  - Commit messages now include detailed descriptions of changes
  - Better categorization and scope identification
  - More informative explanations of what and why changes were made

### Technical Details
- **Root Cause**: Previous settings were too restrictive, limiting AI responses to brief one-liners
- **Solution**: Multi-faceted approach combining increased token limits, improved prompts, and better diff processing
- **Impact**: Users now receive much more informative and detailed commit messages that better explain their changes

## [0.2.7] - 2025-07-12

### Fixed
- **Critical Gemini Shell Error Fix**: Resolved shell errors when using Gemini provider
  - Fixed "unexpected EOF while looking for matching" errors caused by backticks in AI responses
  - Enhanced response sanitization to remove markdown code blocks and backticks
  - Improved shell character escaping for git commit commands
  - Added comprehensive logging and debugging for troubleshooting
  - Updated Gemini prompt to explicitly request plain text responses

### Added
- **Enhanced Response Sanitization**: 
  - Removes entire code blocks (```...```) from AI responses
  - Strips all backticks and markdown formatting
  - Normalizes newlines and whitespace
  - Additional validation for edge cases
- **Improved Shell Safety**: 
  - Better character escaping for quotes, backticks, dollar signs, and backslashes
  - Removal of non-printable characters
  - Command logging for debugging
- **Comprehensive Testing**: 
  - Added tests for real-world problematic responses
  - Verified fix works with exact error scenarios from user reports

### Technical Details
- **Root Cause**: Gemini was returning responses with markdown code blocks containing backticks, which were interpreted as command substitution by the shell
- **Solution**: Multi-layered approach combining prompt engineering, response sanitization, and shell safety measures
- **Impact**: Resolves critical issue preventing users from committing with Gemini provider

## [0.2.1] - 2025-01-01

### Fixed
- **Major API Reliability Improvements**: Fixed persistent 503 "model overloaded" errors
  - Added automatic retry logic with exponential backoff for temporary API failures
  - Implemented proper rate limiting enforcement to prevent hitting API limits
  - Improved error handling to distinguish between retryable and permanent failures
  - Reduced verbose logging that could cause issues in production environments

### Changed
- **Enhanced Gemini API Integration**:
  - Removed automatic API key format fixing that could cause authentication issues
  - Added proper API key validation with helpful warnings
  - Improved rate limiting to actually wait for limits instead of just warning
  - Optimized request body logging to prevent overwhelming output

### Added
- **New Troubleshooting Documentation**: Added comprehensive guide for API-related issues
- **Retry Mechanism**: API requests now automatically retry up to 3 times for 503 errors
- **Smart Rate Limiting**: Automatically waits for rate limits (up to 10 seconds) to prevent errors

## [0.2.0] - 2025-05-28

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

### Planned for v0.3.0
- GitHub integration for pull request automation
- Custom commit templates
- Branch-specific configuration
- Commit message history and learning
- Plugin system for extensibility

### Planned for v0.4.0
- Web dashboard for team configuration
- Commit analytics and insights
- Integration with popular IDEs
- Advanced security scanning

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to PushScript.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 