// Copies the site files into public/ and writes public/config.js from the
// GOOGLE_CLIENT_ID environment variable (set it in Vercel's project settings).
// Every file lives at the top level of the repository, so no folders need uploading.
import fs from 'fs';
import path from 'path';

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

const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
fs.writeFileSync(path.join(out, 'config.js'), `window.APP_CONFIG = { googleClientId: ${JSON.stringify(clientId)} };\n`);

console.log(`Built ${out}/ ${clientId ? '(Google client ID set)' : '(GOOGLE_CLIENT_ID is not set; the Send button will show setup help)'}`);
