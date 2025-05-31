# PushScript Quick Setup

Get started with PushScript in under 60 seconds.

## 🚀 Quick Install

```bash
# Global installation (recommended)
npm install -g pushscript@latest
# or
pnpm add -g pushscript@latest

# One-time use
npx pushscript@latest
```

## ⚙️ Basic Configuration

1. **Get an API key** (free options available):
   - [Gemini](https://makersuite.google.com/app/apikey) (recommended, free)
   - [Groq](https://console.groq.com/keys) (fast, free tier)
   - [OpenAI](https://platform.openai.com/api-keys) (paid)

2. **Set environment variable**:
   ```bash
   # Add to .env.local or .env
   GEMINI_API_KEY=your-key-here
   ```

## 📦 Add to Project

```bash
# Auto-add npm scripts to package.json
pushscript setup
```

This adds convenient shortcuts:
- `npm run push` - AI commit + push
- `npm run commit` - AI commit only

## 🎯 Usage

```bash
pushscript                    # AI commit + push to current branch
pushscript "fix: bug"         # Custom message + push
pushscript commit             # Commit only (no push)
pushscript --help             # Show all options
```

## 📖 Full Documentation

For complete configuration, troubleshooting, and advanced features, see the [README.md](../README.md).

**Key sections:**
- [Configuration files](../README.md#42--configuration-files-advanced) - Custom `.pushscript.json` setup
- [Environment variables](../README.md#4--configuration) - All provider options
- [CLI reference](../README.md#5--cli-reference) - Complete command list  
- [Troubleshooting](../README.md#7--troubleshooting) - Common issues