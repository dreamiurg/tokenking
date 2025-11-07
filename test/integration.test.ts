import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, writeFileSync, symlinkSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const execFileAsync = promisify(execFile);

describe('CLI Integration Tests', () => {
  it('should run successfully when invoked directly', async () => {
    const { stdout } = await execFileAsync('node', ['dist/index.js', '.']);

    strictEqual(stdout.includes('TokenKing Report'), true, 'Should display report header');
    strictEqual(stdout.length > 0, true, 'Should produce output');
  });

  it('should run successfully when invoked through a symlink', async () => {
    // Create a temporary directory for our test
    const tempDir = mkdtempSync(join(tmpdir(), 'tokenking-test-'));

    try {
      const realScript = join(process.cwd(), 'dist/index.js');
      const symlinkPath = join(tempDir, 'tokenking-symlink');

      // Create a symlink to the real script
      symlinkSync(realScript, symlinkPath);

      // Run through the symlink
      const { stdout } = await execFileAsync('node', [symlinkPath, '.']);

      strictEqual(
        stdout.includes('TokenKing Report'),
        true,
        'Should display report header when run through symlink'
      );
      strictEqual(stdout.length > 0, true, 'Should produce output when run through symlink');
    } finally {
      // Clean up temp directory
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should handle missing path gracefully', async () => {
    try {
      await execFileAsync('node', ['dist/index.js', '/nonexistent/path']);
      throw new Error('Should have thrown an error');
    } catch (error: any) {
      strictEqual(error.code, 2, 'Should exit with code 2 for invalid path');
      strictEqual(
        error.stderr.includes('Error: Path does not exist'),
        true,
        'Should show path error'
      );
    }
  });

  it('should use current directory when no argument provided', async () => {
    const { stdout } = await execFileAsync('node', ['dist/index.js']);

    strictEqual(stdout.includes('TokenKing Report'), true, 'Should display report header');
    strictEqual(stdout.includes('Project: ' + process.cwd()), true, 'Should use current directory');
  });

  it('should display help when --help flag is used', async () => {
    const { stdout } = await execFileAsync('node', ['dist/index.js', '--help']);

    strictEqual(stdout.includes('TokenKing'), true, 'Should display TokenKing in help');
    strictEqual(stdout.includes('Usage:'), true, 'Should display usage information');
    strictEqual(stdout.includes('Examples:'), true, 'Should display examples');
  });

  it('should display version when --version flag is used', async () => {
    const { stdout } = await execFileAsync('node', ['dist/index.js', '--version']);

    strictEqual(stdout.includes('TokenKing v'), true, 'Should display version');
    strictEqual(stdout.includes('1.3.1'), true, 'Should display correct version number');
  });
});
