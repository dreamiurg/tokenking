#!/usr/bin/env node

import path from 'node:path';
import { existsSync } from 'node:fs';
import pc from 'picocolors';
import { loadSessionData } from 'ccusage/data-loader';

interface Session {
  sessionId: string;
  projectPath?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  totalTokens?: number;
  totalCost?: number;
  lastActivity?: string;
  modelsUsed?: string[];
}

interface AggregatedData {
  sessionCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheCreationTokens: number;
  totalCacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  firstActivity: string | null;
  lastActivity: string | null;
  models: Set<string>;
  sessionPaths: Set<string>;
}

/**
 * Format a number with thousand separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Load and parse ccusage session data
 */
async function getCcusageData(): Promise<Session[]> {
  try {
    const sessions = await loadSessionData();
    return (sessions || []) as Session[];
  } catch (error) {
    console.error(pc.red('Error: Failed to load Claude Code session data.'));
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(2);
  }
}

/**
 * Filter sessions by project path
 */
export function filterSessionsByPath(sessions: Session[], targetPath: string): Session[] {
  const normalizedTarget = path.resolve(targetPath);
  const targetBasename = path.basename(normalizedTarget);

  return sessions.filter((session) => {
    // Check if the session's projectPath matches
    if (session.projectPath && session.projectPath !== 'Unknown Project') {
      return session.projectPath === normalizedTarget;
    }

    // Fallback: convert target path to sessionId format and compare
    // sessionId format: -Users-dreamiurg-src-project (path with slashes replaced by dashes)
    if (session.sessionId) {
      const expectedSessionId = '-' + normalizedTarget.replace(/^\//, '').replace(/\//g, '-');

      // Try exact match first
      if (session.sessionId === expectedSessionId) {
        return true;
      }

      // Also match by basename - catches moved projects
      // Check if sessionId ends with the target directory name
      const expectedSuffix = '-' + targetBasename;
      if (session.sessionId.endsWith(expectedSuffix)) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Aggregate session data
 */
export function aggregateData(sessions: Session[]): AggregatedData | null {
  if (sessions.length === 0) {
    return null;
  }

  const result: AggregatedData = {
    sessionCount: sessions.length,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheCreationTokens: 0,
    totalCacheReadTokens: 0,
    totalTokens: 0,
    totalCost: 0,
    firstActivity: null,
    lastActivity: null,
    models: new Set(),
    sessionPaths: new Set(),
  };

  sessions.forEach((session) => {
    result.totalInputTokens += session.inputTokens || 0;
    result.totalOutputTokens += session.outputTokens || 0;
    result.totalCacheCreationTokens += session.cacheCreationTokens || 0;
    result.totalCacheReadTokens += session.cacheReadTokens || 0;
    result.totalTokens += session.totalTokens || 0;
    result.totalCost += session.totalCost || 0;

    // Track date range
    if (session.lastActivity) {
      if (!result.lastActivity || session.lastActivity > result.lastActivity) {
        result.lastActivity = session.lastActivity;
      }
      if (!result.firstActivity || session.lastActivity < result.firstActivity) {
        result.firstActivity = session.lastActivity;
      }
    }

    // Collect models
    if (session.modelsUsed && Array.isArray(session.modelsUsed)) {
      session.modelsUsed.forEach((model) => result.models.add(model));
    }

    // Track session IDs
    if (session.sessionId) {
      result.sessionPaths.add(session.sessionId);
    }
  });

  return result;
}

/**
 * Calculate date range in days
 */
export function calculateDateRange(firstDate: string | null, lastDate: string | null): number {
  if (!firstDate || !lastDate) return 0;
  const first = new Date(firstDate);
  const last = new Date(lastDate);
  const diffTime = Math.abs(last.getTime() - first.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Display the report
 */
function displayReport(targetPath: string, data: AggregatedData | null): void {
  const resolvedPath = path.resolve(targetPath);

  console.log('');
  console.log(pc.cyan(pc.bold('📊 TokenKing Report')));
  console.log(pc.cyan('━'.repeat(60)));
  console.log(pc.dim('Project:'), resolvedPath);
  console.log('');

  if (!data) {
    console.log(pc.yellow('No Claude Code sessions found for this project.'));
    console.log('');
    return;
  }

  const dateRange = calculateDateRange(data.firstActivity, data.lastActivity);

  console.log(pc.bold('Sessions:'), formatNumber(data.sessionCount));

  // Show matched paths if more than one or if path differs from target
  if (data.sessionPaths && data.sessionPaths.size > 0) {
    const targetSessionId = '-' + resolvedPath.replace(/^\//, '').replace(/\//g, '-');
    const pathArray = Array.from(data.sessionPaths).sort((a, b) => {
      // Sort exact match first, then alphabetically
      const aIsExact = a === targetSessionId;
      const bIsExact = b === targetSessionId;
      if (aIsExact && !bIsExact) return -1;
      if (!aIsExact && bIsExact) return 1;
      return a.localeCompare(b);
    });

    // Only show if multiple paths or path doesn't match exactly
    if (pathArray.length > 1 || pathArray[0] !== targetSessionId) {
      console.log(pc.bold('Matched Paths:'));
      pathArray.forEach((sessionPath) => {
        const isExact = sessionPath === targetSessionId;
        if (isExact) {
          console.log(pc.dim('  •'), pc.green(sessionPath), pc.dim('(exact)'));
        } else {
          console.log(pc.dim('  •'), pc.yellow(sessionPath), pc.dim('(basename match)'));
        }
      });
    }
  }

  if (data.firstActivity && data.lastActivity) {
    console.log(pc.bold('First Session:'), data.firstActivity);
    console.log(pc.bold('Last Session:'), data.lastActivity);
    console.log(pc.bold('Date Range:'), `${dateRange} days`);
  }
  console.log('');

  console.log(pc.bold('Total Tokens:'), pc.green(formatNumber(data.totalTokens)));
  console.log(pc.dim('  Input:'), formatNumber(data.totalInputTokens), 'tokens');
  console.log(pc.dim('  Output:'), formatNumber(data.totalOutputTokens), 'tokens');
  console.log(pc.dim('  Cache Create:'), formatNumber(data.totalCacheCreationTokens), 'tokens');
  console.log(pc.dim('  Cache Read:'), formatNumber(data.totalCacheReadTokens), 'tokens');
  console.log('');

  if (data.models.size > 0) {
    console.log(pc.bold('Models Used:'));
    Array.from(data.models).forEach((model) => {
      console.log(pc.dim('  •'), model);
    });
    console.log('');
  }

  console.log(pc.bold('Estimated Cost:'), pc.magenta('$' + data.totalCost.toFixed(2) + ' USD'));
  console.log('');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Get target path from args or use current directory
  const targetPath = args[0] || '.';

  // Validate path exists
  if (!existsSync(targetPath)) {
    console.error(pc.red(`Error: Path does not exist: ${targetPath}`));
    process.exit(2);
  }

  // Get ccusage data
  console.log(pc.dim('Fetching Claude Code session data...'));
  const sessions = await getCcusageData();

  // Filter by path
  const matchingSessions = filterSessionsByPath(sessions, targetPath);

  // Aggregate
  const aggregated = aggregateData(matchingSessions);

  // Display
  displayReport(targetPath, aggregated);

  // Exit code
  if (!aggregated) {
    process.exit(1);
  }
  process.exit(0);
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(pc.red('Unexpected error:'), error);
    process.exit(1);
  });
}
