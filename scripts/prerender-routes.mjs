// After `vite build`: write one HTML file per page so every URL is a real page
// GitHub Pages can serve directly (and Google can index), each with its own
// title, description and canonical URL. Also writes sitemap.xml and 404.html.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://nickkourakis.com';
const routes = JSON.parse(readFileSync('src/routes.json', 'utf8'));
const shell = readFileSync('dist/index.html', 'utf8');

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function page({ path, title, description }, { noindex = false } = {}) {
  const url = SITE + (path === '/' ? '/' : path);
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${escText(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(title)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escAttr(title)}$2`);
  if (noindex) {
    html = html
      .replace(/<link rel="canonical"[^>]*>\n?/, '')
      .replace('</head>', '<meta name="robots" content="noindex">\n</head>');
  }
  return html;
}

for (const r of routes) {
  const file = r.path === '/' ? 'dist/index.html' : `dist${r.path}.html`;
  writeFileSync(file, page(r));
}

writeFileSync(
  'dist/404.html',
  page({ path: '/404', title: 'Page not found · Nick Kourakis', description: 'This page does not exist.' }, { noindex: true }),
);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE}${r.path === '/' ? '/' : r.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
);

console.log(`prerendered ${routes.length} pages + 404.html + sitemap.xml`);
