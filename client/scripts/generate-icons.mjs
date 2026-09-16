import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.resolve(__dirname, '../');
const svgSource = path.join(clientDir, 'public/seals/seal-favicon.svg');
const iconsDir = path.join(clientDir, 'public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(svgSource)) {
  console.error(`Source SVG not found: ${svgSource}`);
  process.exit(1);
}

const PARCHMENT_BG = '#F4EFE6';

async function generate() {
  console.log('Generating icons from', svgSource);

  // 1. icon-192.png
  await sharp(svgSource)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 2. icon-512.png
  await sharp(svgSource)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgSource)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. maskable-512.png: seal composited at 80% scale centered on a full #F4EFE6 canvas
  // 512 * 0.8 = 409.6 -> 410px
  const maskableSealSize = Math.round(512 * 0.8);
  const sealBuffer410 = await sharp(svgSource)
    .resize(maskableSealSize, maskableSealSize)
    .toBuffer();

  const maskableOffset = Math.round((512 - maskableSealSize) / 2);

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: PARCHMENT_BG,
    },
  })
    .composite([
      {
        input: sealBuffer410,
        top: maskableOffset,
        left: maskableOffset,
      },
    ])
    .png()
    .toFile(path.join(iconsDir, 'maskable-512.png'));
  console.log('Generated maskable-512.png');

  // 5. og-cover.png: 1200x630 #F4EFE6 canvas with the seal centered at 420px height
  const ogSealHeight = 420;
  // seal-favicon is square, so width=420
  const sealBuffer420 = await sharp(svgSource)
    .resize(ogSealHeight, ogSealHeight)
    .toBuffer();

  const ogLeft = Math.round((1200 - ogSealHeight) / 2);
  const ogTop = Math.round((630 - ogSealHeight) / 2);

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: PARCHMENT_BG,
    },
  })
    .composite([
      {
        input: sealBuffer420,
        top: ogTop,
        left: ogLeft,
      },
    ])
    .png()
    .toFile(path.join(iconsDir, 'og-cover.png'));
  console.log('Generated og-cover.png');

  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
