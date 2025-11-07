#!/usr/bin/env node

import { readFileSync, writeFileSync, chmodSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndexPath = join(__dirname, '../dist/index.js');

const content = readFileSync(distIndexPath, 'utf8');

// Only add shebang if it doesn't already exist
if (!content.startsWith('#!/usr/bin/env node')) {
  const withShebang = `#!/usr/bin/env node\n${content}`;
  writeFileSync(distIndexPath, withShebang);
  console.log('✓ Added shebang and made executable');
} else {
  console.log('✓ Shebang already present, skipping');
}

chmodSync(distIndexPath, 0o755);
