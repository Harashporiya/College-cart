import sharp from 'sharp';
import { statSync, copyFileSync, existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ASSETS = 'src/assets';
const ORIGINALS = join(ASSETS, '.originals');

const PLAN = {
  'chitkara1.jpg':            { width: 1920, ext: 'jpg', quality: 74 },
  'cartbackground.jpg':       { width: 1920, ext: 'jpg', quality: 74 },
  'addproduct.png':           { width: 1600, ext: 'jpg', quality: 76 },
  'Signup.png':               { width: 1100, ext: 'jpg', quality: 78 },
  'collegeCartInterface.png': { width: 1200, ext: 'png', quality: 80 },
  'jyoti.png':                { width: 320,  ext: 'png', quality: 80 },
  'harash.jpeg':              { width: 320,  ext: 'jpg', quality: 82 },
  'hardik.jpeg':              { width: 320,  ext: 'jpg', quality: 82 },
  'jatin.jpg':                { width: 320,  ext: 'jpg', quality: 82 },
  'logo.jpeg':                { width: 240,  ext: 'jpg', quality: 84 },
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

  if (existsSync(src) && !existsSync(archived)) copyFileSync(src, archived);
  if (!existsSync(archived)) {
    console.warn(`skip (missing): ${file}`);
    continue;
  }

  const stem = basename(file, extname(file));
  const outName = `${stem}.${opts.ext}`;
  const startSize = statSync(archived).size;
  const meta = await sharp(archived).metadata();
  const width = Math.min(opts.width, meta.width);
  const resized = () => sharp(archived).resize({ width, withoutEnlargement: true });

  await encode(resized(), opts.ext, opts.quality).toFile(join(ASSETS, outName));
  const webpInfo = await resized().webp({ quality: opts.quality - 4, effort: 6 }).toFile(join(ASSETS, `${stem}.webp`));

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

const svgPath = join(ASSETS, 'svgLogo.svg');
if (existsSync(svgPath)) {
  const archived = join(ORIGINALS, 'svgLogo.svg');
  if (!existsSync(archived)) copyFileSync(svgPath, archived);

  const original = readFileSync(archived, 'utf8');
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
