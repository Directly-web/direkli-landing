/**
 * build.js — Direktli build script
 *
 * Runs at Vercel build time (see vercel.json).
 * Reads index.html, replaces the %%APPS_SCRIPT_URL%% token
 * with the real value from the APPS_SCRIPT_URL environment
 * variable, and writes the result to dist/index.html.
 *
 * HOW TO SET THE SECRET IN VERCEL:
 * 1. Go to your Vercel project → Settings → Environment Variables
 * 2. Add a new variable:
 *      Name  → APPS_SCRIPT_URL
 *      Value → https://script.google.com/macros/s/YOUR_ID/exec
 *      Environments → Production, Preview, Development (tick all)
 * 3. Redeploy — Vercel will inject it automatically every build.
 *
 * The secret is NEVER written into your Git repo or source files.
 */

const fs   = require('fs');
const path = require('path');

const TOKEN       = '%%APPS_SCRIPT_URL%%';
const SCRIPT_URL  = process.env.APPS_SCRIPT_URL;

// ── Guard: fail the build loudly if the secret is missing ────────
if (!SCRIPT_URL) {
  console.error('\n❌  BUILD FAILED: APPS_SCRIPT_URL environment variable is not set.');
  console.error('    Add it in Vercel → Project Settings → Environment Variables.\n');
  process.exit(1);
}

// ── Validate it looks like a real Apps Script URL ─────────────────
const VALID_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/;
if (!VALID_PATTERN.test(SCRIPT_URL)) {
  console.error('\n❌  BUILD FAILED: APPS_SCRIPT_URL does not look like a valid Google Apps Script Web App URL.');
  console.error('    Expected format: https://script.google.com/macros/s/<ID>/exec\n');
  process.exit(1);
}

// ── Read source ───────────────────────────────────────────────────
const srcPath  = path.join(__dirname, 'index.html');
const distDir  = path.join(__dirname, 'dist');
const distPath = path.join(distDir, 'index.html');

let html = fs.readFileSync(srcPath, 'utf8');

// ── Replace token ─────────────────────────────────────────────────
if (!html.includes(TOKEN)) {
  console.error(`\n❌  BUILD FAILED: Token "${TOKEN}" not found in index.html.\n`);
  process.exit(1);
}

html = html.replace(TOKEN, SCRIPT_URL);

// ── Write output ──────────────────────────────────────────────────
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(distPath, html, 'utf8');

console.log('✅  Build complete → dist/index.html');
console.log(`    APPS_SCRIPT_URL injected (${SCRIPT_URL.slice(0, 48)}...)`);
