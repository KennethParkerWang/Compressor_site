// scripts/write-algo.mjs
import {readFileSync, writeFileSync} from 'node:fs';
const src = readFileSync('scripts/algo-new-content.txt', 'utf8');
writeFileSync('src/pages/algorithm-board.tsx', src, 'utf8');
console.log('OK', src.length);