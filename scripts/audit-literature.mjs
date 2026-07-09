// Scan literatureData.ts for problematic entries
import {readFileSync} from 'node:fs';
const txt = readFileSync('src/data/literatureData.ts', 'utf8');

// Split by id occurrences and parse each entry
const entryRe = /\{[^{}]*?"id":\s*"LIT-(\d+)"[^{}]*?\}/gs;
const m = [...txt.matchAll(entryRe)];
console.log(`Matched ${m.length} entries (loose)`);

// Stricter parse: find each entry block by matching { to } starting at id
function parseEntries(s) {
  const out = [];
  const idRe = /"id":\s*"(LIT-\d+)"/g;
  let im;
  while ((im = idRe.exec(s)) !== null) {
    const idStart = im.index;
    // walk backward to the nearest "{"
    let braceStart = idStart;
    while (braceStart > 0 && s[braceStart] !== '{') braceStart--;
    // walk forward to find matching "}"
    let depth = 1;
    let i = braceStart + 1;
    while (i < s.length && depth > 0) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}') depth--;
      i++;
    }
    const block = s.slice(braceStart, i);
    out.push({id: im[1], block});
  }
  return out;
}

const entries = parseEntries(txt);
console.log(`Strict parsed: ${entries.length}`);

// Classify
const flags = [];
for (const e of entries) {
  const b = e.block;
  const checks = {
    hasTitle: /"title":\s*"[^"]+"/.test(b),
    hasAuthors: /"authors":\s*"[^"]+"/.test(b),
    hasYear: /"year":\s*"(?!")[^"]+/.test(b), // non-empty
    hasUrl: /"url":\s*"[^"]+"/.test(b),
    hasQuestionMark: /\?/.test(b.replace(/"label\?:\s*\w+,?/g, '').replace(/"[a-z]+\?":/g, '')), // skip TypeScript optional markers
    isTypePreprint: /"type":\s*"preprint"/.test(b),
    isEmptyVenue: /"venue":\s*""/.test(b),
  };
  const problems = Object.entries(checks).filter(([, v]) => v === false || (e.id && (b.includes('Toderici?') || b.includes('PLDI?'))));
  if (!checks.hasTitle || !checks.hasAuthors || !checks.hasYear || !checks.hasUrl || checks.hasQuestionMark || problems.length) {
    flags.push({id: e.id, problems: Object.entries(checks).filter(([,v])=>!v).map(([k])=>k), snippet: b.slice(0, 200)});
  }
}

console.log(`\nFlagged: ${flags.length}`);
for (const f of flags) {
  console.log(`\n[${f.id}] problems: ${f.problems.join(', ')}`);
  console.log(`  ${f.snippet.replace(/\s+/g, ' ').slice(0, 180)}`);
}

// Specific checks
console.log('\n--- TODERICI entries ---');
const toderici = entries.filter(e => e.block.includes('Toderici'));
toderici.forEach(e => console.log(`  ${e.id}: ${e.block.slice(0, 300).replace(/\s+/g, ' ')}`));

console.log('\n--- PLDI entries ---');
const pldi = entries.filter(e => e.block.includes('PLDI'));
pldi.forEach(e => console.log(`  ${e.id}: ${e.block.slice(0, 250).replace(/\s+/g, ' ')}`));

console.log('\n--- empty venue/year ---');
const empty = entries.filter(e => /"venue":\s*""/.test(e.block) || /"year":\s*""/.test(e.block));
console.log(`  ${empty.length} entries`);
empty.forEach(e => console.log(`  ${e.id}: ${e.block.slice(0, 200).replace(/\s+/g, ' ')}`));

console.log('\n--- missing url ---');
const noUrl = entries.filter(e => !/"url":\s*"[^"]+"/.test(e.block));
console.log(`  ${noUrl.length} entries`);
noUrl.forEach(e => console.log(`  ${e.id}: ${e.block.slice(0, 200).replace(/\s+/g, ' ')}`));