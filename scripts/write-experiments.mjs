// scripts/write-experiments.mjs
import {readFileSync, writeFileSync} from 'node:fs';
const src = readFileSync('scripts/experiments-new-content.txt', 'utf8');
writeFileSync('src/pages/experiments.tsx', src, 'utf8');
console.log('OK', src.length);