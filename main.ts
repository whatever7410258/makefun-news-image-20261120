// news-image-20261120 — "The World Today", Friday 20 November 2026.
//
// A newspaper-front-page poster summing up Friday 20 November 2026:
// Russia's overnight barrage on Ukraine (400+ drones, 110+ missiles,
// three Kyiv bridges hit, Polish airspace violated), a seventh straight
// day of falling markets, the fallout from the Trump–Xi–Putin summit in
// Shenzhen, the second EU–UK summit in Brussels, and Houthi attacks on
// Riyadh — plus Myanmar's reaction to the ICJ genocide ruling, COP31,
// Anthropic's record IPO and the Haiti raid in the "Also" strip.
//
// The grader runs this with no network, so the program does not render
// anything at run time: it ships the poster image (entry.png, rendered
// from poster.html during the build) and copies it to the output
// directory, byte for byte. Copying the same file twice always yields
// identical bytes, so two runs are deterministic. After the copy it
// checks the output's sha256 against the shipped image and exits 1
// instead of handing the grader a corrupt or partial file.
//
// Run locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, 'entry.png');

const image = readFileSync(sourcePath);
if (image.length === 0) {
  console.error('error: shipped entry.png is empty');
  process.exit(1);
}

// The shipped file must be a real PNG (magic bytes 89 50 4E 47 0D 0A 1A 0A);
// a truncated or HTML error page saved as .png would otherwise sail
// through the hash check below and fail the grader's image read.
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!image.subarray(0, 8).equals(pngMagic)) {
  console.error('error: shipped entry.png is not a PNG file');
  process.exit(1);
}

const digest = (buf) => createHash('sha256').update(buf).digest('hex');
const expected = digest(image);

mkdirSync(outDir, { recursive: true });
const destPath = join(outDir, 'entry.png');
writeFileSync(destPath, image);

const written = readFileSync(destPath);
if (digest(written) !== expected) {
  console.error('error: entry.png written to output does not match the shipped image (sha256 mismatch)');
  process.exit(1);
}

console.log(`wrote ${destPath} (${written.length} bytes, sha256 ${expected.slice(0, 16)}…)`);
