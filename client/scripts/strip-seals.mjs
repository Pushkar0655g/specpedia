import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../../');
const brandDir = path.join(repoRoot, 'brand');
const publicSealsDir = path.join(repoRoot, 'client/public/seals');

if (!fs.existsSync(publicSealsDir)) {
  fs.mkdirSync(publicSealsDir, { recursive: true });
}

const filesToProcess = [
  { src: 'seal-colour.svg', targets: ['seal-colour.svg'] },
  { src: 'seal-favicon.svg', targets: ['seal-favicon.svg'] },
  { src: 'seal-stamp-ink.svg', targets: ['seal-stamp-ink.svg', 'seal-ink.svg'] },
  { src: 'seal-stamp-parchment.svg', targets: ['seal-stamp-parchment.svg', 'seal-parchment.svg'] },
];

for (const { src, targets } of filesToProcess) {
  const srcPath = path.join(brandDir, src);
  if (!fs.existsSync(srcPath)) {
    console.error(`Missing source file: ${srcPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(srcPath, 'utf8');
  // Strip entire <metadata>...</metadata> block (including newlines and whitespace)
  const stripped = content.replace(/<metadata>[\s\S]*?<\/metadata>/, '').trim();

  for (const target of targets) {
    const targetPath = path.join(publicSealsDir, target);
    fs.writeFileSync(targetPath, stripped + '\n', 'utf8');
    const stats = fs.statSync(targetPath);
    console.log(`Wrote ${target} (${stats.size} bytes)`);
  }
}

console.log('Seals successfully stripped and written to client/public/seals/');
