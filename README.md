# TokenKing

Analyze Claude Code token usage and costs for a specific project.

## Installation

```bash
npm install
```

## Usage

```bash
# Analyze current directory
npm start

# Analyze specific project
npm start ~/src/my-project

# Or use the bin directly
./src/index.js ~/src/my-project
```

## What it does

TokenKing wraps `ccusage` to filter and aggregate Claude Code session data for a specific project path. It shows:

- Total sessions
- Date range (first/last session)
- Token breakdown (input, output, cache)
- Models used
- Estimated costs

## Requirements

- Node.js >= 18
- `npx` (for running ccusage)
