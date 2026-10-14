// Copies the site files into public/ and writes public/config.js from the
// GOOGLE_CLIENT_ID environment variable (set it in Vercel's project settings).
// Every file lives at the top level of the repository, so no folders need uploading.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const out = 'public';
const files = ['index.html', 'style.css', 'app.js'];

const missing = files.filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error(`Missing ${missing.join(', ')}. Upload ${missing.length > 1 ? 'these files' : 'this file'} to the top level of your repository, then redeploy.`);
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of files) fs.copyFileSync(f, path.join(out, f));

// Stamp app.js and style.css with a content hash so browsers always load the newest version.
const version = (f) => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 10);
const htmlPath = path.join(out, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8')
  .replace(/href="style\.css[^"]*"/, `href="style.css?v=${version('style.css')}"`)
  .replace(/src="app\.js[^"]*"/, `src="app.js?v=${version('app.js')}"`);
fs.writeFileSync(htmlPath, html);

const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
fs.writeFileSync(path.join(out, 'config.js'), `window.APP_CONFIG = { googleClientId: ${JSON.stringify(clientId)} };\n`);

console.log(`Built ${out}/ ${clientId ? '(Google client ID set)' : '(GOOGLE_CLIENT_ID is not set; the Send button will show setup help)'}`);
