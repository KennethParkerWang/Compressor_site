// scripts/write-library.mjs - 用 Node 直接读 .txt 内容(UTF-8)并写到 library.tsx
import {readFileSync, writeFileSync} from 'node:fs';

const src = readFileSync('scripts/library-new-content.txt', 'utf8');
writeFileSync('src/pages/library.tsx', src, 'utf8');
console.log('OK, written', src.length, 'chars to src/pages/library.tsx');