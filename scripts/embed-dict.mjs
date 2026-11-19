/** Пересобирает литерал словаря в client.js из ru.json (источник истины — ru.json). */
import fs from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
const dictPath = here + '../ru.json';
const clientPath = here + '../client.js';
const dict = fs.readFileSync(dictPath, 'utf8').trimEnd();
let src = fs.readFileSync(clientPath, 'utf8');
if (!src.includes('DICT_PLACEHOLDER')) {
  // already embedded: replace between markers
  const start = src.indexOf('var RU = ');
  const end = src.indexOf('\n\n    return {', start);
  if (start < 0 || end < 0) throw new Error('cannot locate embedded dictionary');
  src = src.slice(0, start) + 'var RU = ' + dict + src.slice(end);
} else {
  src = src.replace('DICT_PLACEHOLDER', dict);
}
fs.writeFileSync(clientPath, src);
console.log('embedded', Object.keys(JSON.parse(dict)).length, 'keys into client.js');
