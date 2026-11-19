/**
 * Проверка словаря ru.json против en-словаря вендора dsh-soul.
 *
 * Использование: node scripts/check-keys.mjs [путь до client/index.mjs вендора]
 * Выход: число ключей en/ru, missing (в en, но нет в ru), extra (лишние в ru).
 * Код 0 — наборы совпадают; код 1 — расхождение.
 */
import fs from 'node:fs';

// Путь к вендорскому client/index.mjs: аргумент, затем $DSH_PROFILE_DIR профиля,
// затем типичное расположение профиля по умолчанию.
const VENDOR = process.argv[2]
  ?? (process.env.DSH_PROFILE_DIR
    ? `${process.env.DSH_PROFILE_DIR}/node_modules/dsh-soul/client/index.mjs`
    : `${process.env.HOME}/.dsh/profiles/web/node_modules/dsh-soul/client/index.mjs`);

function extractObject(src, marker) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error(`marker not found: ${marker}`);
  const start = i + marker.length - 1;
  let depth = 0, j = start, inStr = null, inLC = false, inBC = false;
  for (; j < src.length; j++) {
    const c = src[j], n = src[j + 1];
    if (inLC) { if (c === '\n') inLC = false; continue; }
    if (inBC) { if (c === '*' && n === '/') { inBC = false; j++; } continue; }
    if (inStr) { if (c === '\\') { j++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inLC = true; j++; continue; }
    if (c === '/' && n === '*') { inBC = true; j++; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  return (new Function('return (' + src.slice(start, j) + ')'))();
}

const here = new URL('.', import.meta.url).pathname;
const ru = JSON.parse(fs.readFileSync(here + '../ru.json', 'utf8'));
const en = extractObject(fs.readFileSync(VENDOR, 'utf8'), 'const en = {');

const enKeys = Object.keys(en), ruKeys = Object.keys(ru);
const missing = enKeys.filter(k => !(k in ru));
const extra = ruKeys.filter(k => !(k in en));
console.log(JSON.stringify({ en: enKeys.length, ru: ruKeys.length, missing, extra }, null, 2));
if (missing.length || extra.length) { console.error('KEY MISMATCH'); process.exit(1); }
if (ru['nav.label'] !== 'Персонализация') { console.error("nav.label must be 'Персонализация'"); process.exit(1); }
// placeholder parity
const ph = s => ((s.match(/\{\w+\}/g)) ?? []).sort().join(',');
const badPh = enKeys.filter(k => ph(en[k]) !== ph(ru[k]));
if (badPh.length) { console.error('PLACEHOLDER MISMATCH:', badPh); process.exit(1); }
console.log('OK: 1:1 keys, nav.label, placeholders');
