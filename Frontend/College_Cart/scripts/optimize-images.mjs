/**
 * One-shot asset optimiser.
 *
 * The repo shipped ~8.8 MB of source images: full-resolution camera JPEGs used as
 * CSS backgrounds, and 800px PNGs rendered into 120px avatars. All of them were
 * downloaded in full on first paint, which is what made the site slow to open and
 * made hero/background images appear late.
 *
 * Each entry is resized to the largest size it is actually *displayed* at (2x for
 * high-DPR screens) and re-encoded. Photographic PNGs become JPEG, since PNG cannot
 * compress a photograph. A .webp sibling is emitted for every asset so CSS can use
 * image-set() and <picture>/imports can prefer it, with the classic format as the
 * automatic fallback.
 *
 * Pristine copies live in src/assets/.originals so this is safe to re-run and never
 * compounds generation loss.
 *
 * Run with: npm run optimize:images
 */
import sharp from 'sharp';
import { statSync, copyFileSync, existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ASSETS = 'src/assets';
const ORIGINALS = join(ASSETS, '.originals');

// width = max rendered width x2 for high-DPR; `ext` is the classic-format output.
// A differing `ext` means the file is renamed and references were updated to match.
const PLAN = {
  'chitkara1.jpg':            { width: 1920, ext: 'jpg', quality: 74 }, // full-bleed home hero
  'cartbackground.jpg':       { width: 1920, ext: 'jpg', quality: 74 }, // cart page backdrop
  'addproduct.png':           { width: 1600, ext: 'jpg', quality: 76 }, // add-product backdrop (photo)
  'Signup.png':               { width: 1100, ext: 'jpg', quality: 78 }, // signup right panel (photo)
  'collegeCartInterface.png': { width: 1200, ext: 'png', quality: 80 }, // UI screenshot, needs alpha
  'jyoti.png':                { width: 320,  ext: 'png', quality: 80 }, // 120px avatar
  'harash.jpeg':              { width: 320,  ext: 'jpg', quality: 82 },
  'hardik.jpeg':              { width: 320,  ext: 'jpg', quality: 82 },
  'jatin.jpg':                { width: 320,  ext: 'jpg', quality: 82 },
  'logo.jpeg':                { width: 240,  ext: 'jpg', quality: 84 }, // 80px header logo
};

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' KB';
const encode = (pipe, ext, quality) =>
  ext === 'png'
    ? pipe.png({ quality, compressionLevel: 9, palette: true })
    : pipe.jpeg({ quality, mozjpeg: true, progressive: true });

if (!existsSync(ORIGINALS)) mkdirSync(ORIGINALS, { recursive: true });

let before = 0;
let after = 0;
const renamed = [];

for (const [file, opts] of Object.entries(PLAN)) {
  const src = join(ASSETS, file);
  const archived = join(ORIGINALS, file);

  // First run archives the pristine original; later runs re-encode from the archive.
  if (existsSync(src) && !existsSync(archived)) copyFileSync(src, archived);
  if (!existsSync(archived)) {
    console.warn(`skip (missing): ${file}`);
    continue;
  }

  const stem = basename(file, extname(file));
  const outName = `${stem}.${opts.ext}`;
  const startSize = statSync(archived).size;
  const meta = await sharp(archived).metadata();
  // Never upscale: an asset already below the target keeps its own width.
  const width = Math.min(opts.width, meta.width);
  const resized = () => sharp(archived).resize({ width, withoutEnlargement: true });

  await encode(resized(), opts.ext, opts.quality).toFile(join(ASSETS, outName));
  const webpInfo = await resized().webp({ quality: opts.quality - 4, effort: 6 }).toFile(join(ASSETS, `${stem}.webp`));

  // Drop the superseded file when the extension changed (e.g. a photo PNG -> JPEG).
  if (outName !== file && existsSync(src)) {
    rmSync(src);
    renamed.push(`${file} -> ${outName}`);
  }

  const endSize = statSync(join(ASSETS, outName)).size;
  before += startSize;
  after += endSize;
  console.log(
    `${file.padEnd(28)} ${String(meta.width).padStart(4)}px -> ${String(width).padStart(4)}px  ` +
      `${kb(startSize)} -> ${kb(endSize)} ${opts.ext.padEnd(4)} ` +
      `(-${(100 - (endSize / startSize) * 100).toFixed(0)}%)   webp: ${kb(webpInfo.size)}`
  );
}

console.log('-'.repeat(100));
console.log(`total ${kb(before)} -> ${kb(after)}   saved ${kb(before - after)} (-${(100 - (after / before) * 100).toFixed(0)}%)`);
if (renamed.length) console.log(`renamed: ${renamed.join(', ')}`);

// ---------------------------------------------------------------------------
// svgLogo.svg is the favicon, so it is fetched on the very first page load.
//
// Two problems: it was 57 kB of traced path data carrying up to 8 decimal
// places (far more precision than a 1080px canvas can express, let alone a
// 32px tab icon), and it had no viewBox at all - so a browser asked to draw it
// at favicon size had no way to scale it and clipped it to the top-left corner
// instead.
//
// The rounding is applied only to `d` attribute contents. Rewriting numbers
// across the whole file would also rewrite the XML prolog's version="1.0",
// which the XML spec requires verbatim.
const svgPath = join(ASSETS, 'svgLogo.svg');
if (existsSync(svgPath)) {
  const archived = join(ORIGINALS, 'svgLogo.svg');
  if (!existsSync(archived)) copyFileSync(svgPath, archived);

  const original = readFileSync(archived, 'utf8');
  // Read the dimensions off the root element only, so a stroke-width or a
  // nested element cannot be picked up by mistake.
  const root = original.match(/<svg[^>]*>/)?.[0] ?? '';
  const width = root.match(/[\s"]width="(\d+(?:\.\d+)?)"/)?.[1];
  const height = root.match(/[\s"]height="(\d+(?:\.\d+)?)"/)?.[1];

  let trimmed = original.replace(
    /(\sd=")([^"]+)(")/g,
    (_, open, data, close) =>
      open +
      data
        .replace(/-?\d*\.\d+/g, (n) => String(Math.round(parseFloat(n) * 100) / 100))
        .replace(/\s+/g, ' ')
        .trim() +
      close
  );

  // Give the icon an intrinsic coordinate system so it can be drawn at any size.
  if (!/viewBox=/.test(trimmed) && width && height) {
    trimmed = trimmed.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
  }

  writeFileSync(svgPath, trimmed);
  const before = statSync(archived).size;
  const afterSize = statSync(svgPath).size;
  console.log(
    `svgLogo.svg (favicon)        ${kb(before)} -> ${kb(afterSize)}  ` +
      `(-${(100 - (afterSize / before) * 100).toFixed(0)}%)  2dp path data` +
      (/viewBox=/.test(original) ? '' : ', viewBox added')
  );
}
