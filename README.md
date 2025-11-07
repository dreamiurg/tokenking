# TokenKing

A simple CLI tool that shows how much Claude Code usage a specific project has consumed.

## What it does

Analyzes your Claude Code session history and shows aggregated statistics for a specific project:
- Total sessions and date range
- Token usage (input, output, cache creation/read)
- Models used
- Estimated costs in USD

## Requirements

- Node.js >= 18
- `npx` (for running ccusage)

## Installation

```bash
git clone https://github.com/dreamiurg/tokenking.git
cd tokenking
npm install
```

## Usage

```bash
# Analyze current directory
node src/index.js .

# Analyze specific project
node src/index.js ~/src/my-project
```

## How it works

TokenKing is a lightweight wrapper around [ccusage](https://github.com/ryoppippi/ccusage). It calls `ccusage session --json` to get all Claude Code session data, filters sessions matching your project path, then aggregates and displays the results.

## Dependencies

- `picocolors` - Terminal colors for output formatting
- `ccusage` - Used via npx to read Claude Code session data
