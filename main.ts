// Leonida Platinum — the hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// The guide itself is plain static files in app/ (index.html, style.css, app.js and
// app/data/trophies.json) plus 3-4 screenshots in screenshots/. This program copies
// both folders into the output directory and writes dossier.json there with the
// vendored make.fun library, exactly as the scorer rebuilds it. vendor/
// makefun-frontend.ts is the kit's copy and must stay byte-identical.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and the program writes to /output.
// Two runs must write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: text_max_bytes shapes the dossier text; the other caps
// refuse an entry the scorer would refuse (more than 4 screenshots, one over
// 256 KiB, app/ over 993 files/directories or 48 MiB — app/ shares /output's
// 1000-entry cap with screenshots/ and dossier.json, so leave room).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
