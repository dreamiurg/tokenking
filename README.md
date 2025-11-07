# TokenKing

[![npm version](https://img.shields.io/npm/v/tokenking.svg)](https://www.npmjs.com/package/tokenking)
[![npm downloads](https://img.shields.io/npm/dm/tokenking.svg)](https://www.npmjs.com/package/tokenking)
[![GitHub Release](https://img.shields.io/github/v/release/dreamiurg/tokenking)](https://github.com/dreamiurg/tokenking/releases)
[![CI/Release](https://github.com/dreamiurg/tokenking/actions/workflows/release.yml/badge.svg)](https://github.com/dreamiurg/tokenking/actions/workflows/release.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
# Install globally
npm install -g tokenking

# Or use with npx (no installation required)
npx tokenking ~/src/my-project
```

## Usage

```bash
# Analyze current directory
tokenking .

# Analyze specific project
tokenking ~/src/my-project

# Or use with npx
npx tokenking ~/src/my-project
```

## Example Output

```
📊 TokenKing Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: /path/to/my-project

Sessions: 12
First Session: 2025-10-15
Last Session: 2025-11-06
Date Range: 22 days

Total Tokens: 2,450,789
  Input: 1,234,567 tokens
  Output: 456,789 tokens
  Cache Create: 234,567 tokens
  Cache Read: 524,866 tokens

Models Used:
  • claude-sonnet-4-5-20250929
  • claude-haiku-4-5-20251001

Estimated Cost: $45.67 USD
```

## How it works

TokenKing is a lightweight wrapper around [ccusage](https://github.com/ryoppippi/ccusage). It calls `ccusage session --json` to get all Claude Code session data, filters sessions matching your project path, then aggregates and displays the results.

## Dependencies

- `picocolors` - Terminal colors for output formatting
- `ccusage` - Used via npx to read Claude Code session data
