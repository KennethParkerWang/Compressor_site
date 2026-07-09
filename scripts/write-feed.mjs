// scripts/write-feed.mjs
import {readFileSync, writeFileSync} from 'node:fs';
const src = readFileSync('scripts/feed-new-content.txt', 'utf8');
writeFileSync('src/pages/research-feed.tsx', src, 'utf8');
console.log('OK', src.length);