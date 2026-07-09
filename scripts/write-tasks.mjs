// scripts/write-tasks.mjs
import {readFileSync, writeFileSync} from 'node:fs';
const src = readFileSync('scripts/tasks-new-content.txt', 'utf8');
writeFileSync('src/pages/tasks.tsx', src, 'utf8');
console.log('OK, written', src.length, 'chars to src/pages/tasks.tsx');