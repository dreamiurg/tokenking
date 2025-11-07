#!/usr/bin/env node

import { readFileSync, writeFileSync, chmodSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndexPath = join(__dirname, '../dist/index.js');

const content = readFileSync(distIndexPath, 'utf8');
const withShebang = `#!/usr/bin/env node\n${content}`;

writeFileSync(distIndexPath, withShebang);
chmodSync(distIndexPath, 0o755);

console.log('✓ Added shebang and made executable');
