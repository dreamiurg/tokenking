import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { filterSessionsByPath, aggregateData, calculateDateRange } from '../src/index.js';

describe('filterSessionsByPath', () => {
  it('should match exact path by sessionId', () => {
    const sessions = [
      { sessionId: '-Users-dreamiurg-src-project-a' },
      { sessionId: '-Users-dreamiurg-src-project-b' },
    ];
    const result = filterSessionsByPath(sessions as any, '/Users/dreamiurg/src/project-a');
    strictEqual(result.length, 1);
    strictEqual(result[0].sessionId, '-Users-dreamiurg-src-project-a');
  });

  it('should match by basename for moved projects', () => {
    const sessions = [
      { sessionId: '-Users-dreamiurg-src-old-location-my-project' },
      { sessionId: '-Users-dreamiurg-src-new-location-my-project' },
      { sessionId: '-Users-dreamiurg-src-different-project' },
    ];
    const result = filterSessionsByPath(sessions as any, '/Users/dreamiurg/src/current/my-project');
    strictEqual(result.length, 2);
    strictEqual(result[0].sessionId, '-Users-dreamiurg-src-old-location-my-project');
    strictEqual(result[1].sessionId, '-Users-dreamiurg-src-new-location-my-project');
  });

  it('should prioritize projectPath over sessionId', () => {
    const sessions = [{ sessionId: '-wrong-path', projectPath: '/Users/dreamiurg/src/correct' }];
    const result = filterSessionsByPath(sessions as any, '/Users/dreamiurg/src/correct');
    strictEqual(result.length, 1);
  });

  it('should return empty array for no matches', () => {
    const sessions = [{ sessionId: '-Users-dreamiurg-src-other' }];
    const result = filterSessionsByPath(sessions as any, '/Users/dreamiurg/src/nomatch');
    strictEqual(result.length, 0);
  });
});

describe('aggregateData', () => {
  it('should return null for empty sessions', () => {
    const result = aggregateData([]);
    strictEqual(result, null);
  });

  it('should sum tokens correctly', () => {
    const sessions = [
      {
        inputTokens: 100,
        outputTokens: 50,
        cacheCreationTokens: 200,
        cacheReadTokens: 300,
        totalTokens: 650,
        totalCost: 1.5,
      },
      {
        inputTokens: 150,
        outputTokens: 75,
        cacheCreationTokens: 250,
        cacheReadTokens: 350,
        totalTokens: 825,
        totalCost: 2.0,
      },
    ];
    const result = aggregateData(sessions as any);
    strictEqual(result!.totalInputTokens, 250);
    strictEqual(result!.totalOutputTokens, 125);
    strictEqual(result!.totalCacheCreationTokens, 450);
    strictEqual(result!.totalCacheReadTokens, 650);
    strictEqual(result!.totalTokens, 1475);
    strictEqual(result!.totalCost, 3.5);
    strictEqual(result!.sessionCount, 2);
  });

  it('should track date range correctly', () => {
    const sessions = [
      { lastActivity: '2025-10-15' },
      { lastActivity: '2025-11-06' },
      { lastActivity: '2025-10-20' },
    ];
    const result = aggregateData(sessions as any);
    strictEqual(result!.firstActivity, '2025-10-15');
    strictEqual(result!.lastActivity, '2025-11-06');
  });

  it('should collect unique models', () => {
    const sessions = [
      { modelsUsed: ['claude-sonnet-4-5', 'claude-haiku-4-5'] },
      { modelsUsed: ['claude-sonnet-4-5'] },
    ];
    const result = aggregateData(sessions as any);
    strictEqual(result!.models.size, 2);
    strictEqual(result!.models.has('claude-sonnet-4-5'), true);
    strictEqual(result!.models.has('claude-haiku-4-5'), true);
  });
});

describe('calculateDateRange', () => {
  it('should return 0 for null dates', () => {
    strictEqual(calculateDateRange(null, null), 0);
    strictEqual(calculateDateRange('2025-10-15', null), 0);
    strictEqual(calculateDateRange(null, '2025-10-15'), 0);
  });

  it('should calculate days between dates', () => {
    const result = calculateDateRange('2025-10-15', '2025-10-20');
    strictEqual(result, 5);
  });

  it('should return 0 for same date', () => {
    const result = calculateDateRange('2025-10-15', '2025-10-15');
    strictEqual(result, 0);
  });

  it('should handle dates in any order', () => {
    const result1 = calculateDateRange('2025-10-15', '2025-10-20');
    const result2 = calculateDateRange('2025-10-20', '2025-10-15');
    strictEqual(result1, result2);
  });
});
