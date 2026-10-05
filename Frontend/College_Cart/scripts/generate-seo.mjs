import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  PRIVATE_PATHS,
  PRIVATE_PATTERNS,
  ROUTES,
  SITE_URL,
} from '../src/util/seoConfig.js';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');
const today = new Date().toISOString().slice(0, 10);

const xmlEscape = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const urlEntry = ({ path, changefreq, priority }) =>
  [
    '  <url>',
    `    <loc>${xmlEscape(SITE_URL + path)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTES.map(urlEntry),
  '</urlset>',
  '',
].join('\n');

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  ...[...PRIVATE_PATHS, ...PRIVATE_PATTERNS].map((path) => `Disallow: ${path}`),
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8');

console.log(`sitemap.xml  ${ROUTES.length} urls`);
console.log(`robots.txt   ${PRIVATE_PATHS.length + PRIVATE_PATTERNS.length} disallow rules`);
console.log(`site         ${SITE_URL}`);
