import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

describe('TokenKing CLI', () => {
  it('should have executable CLI file', () => {
    const cliPath = './src/index.js';
    strictEqual(existsSync(cliPath), true, 'CLI file should exist');
  });

  it('should show error for non-existent path', () => {
    try {
      execSync('node src/index.js /this/path/does/not/exist/at/all', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      throw new Error('Should have thrown an error');
    } catch (error) {
      strictEqual(error.message.includes('Path does not exist'), true, 'Should show path error');
    }
  });

  it('should accept current directory as argument', () => {
    const output = execSync('node src/index.js .', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    strictEqual(output.includes('TokenKing Report'), true, 'Should display report header');
  });
});
