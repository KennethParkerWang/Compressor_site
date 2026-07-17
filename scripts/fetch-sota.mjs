// scripts/fetch-sota.mjs
// 自动抓取 SOTA 公开榜(Mahoney/Silesia/Hutter/CLIC),写入 leaderboards.auto.json
// 跑法: node scripts/fetch-sota.mjs
// 由 .github/workflows/refresh-sota.yml 每天 04:00 UTC 自动跑

import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'src', 'data', 'leaderboards.auto.json');

const UA = 'Mozilla/5.0 (compatible; CompressorResearchAtlas/1.0; +https://example.com)';

function loadPreviousSnapshot() {
  if (!existsSync(OUT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function updateBoard(out, key, entries, sourceKey, sourceUrl, refreshedAt) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('parser returned no valid entries');
  }
  out.boards[key] = entries;
  out.sources[sourceKey] = sourceUrl;
  out.boardUpdatedAt[key] = refreshedAt;
}

function retainFailure(out, sourceKey, error) {
  out.failures.push({source: sourceKey, message: String(error?.message ?? error).slice(0, 180)});
}

async function fetchText(url) {
  const r = await fetch(url, {headers: {'User-Agent': UA}});
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.text();
}

// ---------- Mahoney LTCB (enwik9) ----------
function parseMahoneyLTCB(html) {
  // 行形如: nncp v3.2            14,915,298  106,632,363    628,955 xd 107,261,318 ...
  const lines = html.split('\n');
  const entries = [];
  for (const line of lines) {
    const m = line.match(/^\s*([a-zA-Z0-9._-]+(?:\s+v\d[\w.-]*)?)\s+(-?\s?\d[\d,]*)\s+(\d[\d,]*)\s+(\d[\d,]*|\s)\s*\w*\s+(\d[\d,]*)/);
    if (!m) continue;
    const [, name, enwik8, enwik9, decompressor, total] = m;
    const e9 = parseInt(enwik9.replace(/,/g, ''), 10);
    if (!e9 || e9 < 100000000 || e9 > 500000000) continue;
    entries.push({
      method: name.trim(),
      year: 2024,
      metric: `${(e9 / 1e6).toFixed(2)} MB (enwik9+decompressor)`,
      metricShort: String(e9),
      lowerIsBetter: true,
      sourceUrl: 'http://mattmahoney.net/dc/text.html',
    });
    if (entries.length >= 8) break;
  }
  return entries;
}

// ---------- Mahoney Silesia ----------
function parseMahoneySilesia(html) {
  // 行形如: 27825511  1860  6094 1750 ... paq8px_v215 -12L
  // 末尾的 compressor 是 name+options,我们把它当作 method
  const lines = html.split('\n');
  const entries = [];
  for (const line of lines) {
    const m = line.match(/^\s*(\d{7,9})\s+(?:\d+\s+){11}(\d+)\s+(\S.*)$/);
    if (!m) continue;
    const [, total, lastCol, compressor] = m;
    const bytes = parseInt(total.replace(/,/g, ''), 10);
    entries.push({
      method: compressor.trim(),
      year: 2026,
      metric: `${(bytes / 1e6).toFixed(2)} MB`,
      metricShort: String(bytes),
      lowerIsBetter: true,
      sourceUrl: 'http://mattmahoney.net/dc/silesia.html',
    });
    if (entries.length >= 6) break;
  }
  return entries;
}

// ---------- Hutter Prize (alt parse) ----------
function parseHutter(html) {
  // 表格行: <tr align="center"> 含 records
  const out = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = trRe.exec(html)) !== null) {
    const body = m[1];
    const tds = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let c;
    while ((c = tdRe.exec(body)) !== null) {
      tds.push(c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim());
    }
    if (tds.length < 4) continue;
    // size 在第 4 列,形如 " 110'793'128 "
    const sizeMatch = tds[3].match(/(\d{2,3})'(\d{3})'(\d{3})/);
    if (!sizeMatch) continue;
    const size = parseInt(sizeMatch[1] + sizeMatch[2] + sizeMatch[3], 10);
    // decompressor 在第 3 列(可能含 "...")
    const decompressor = tds[2].replace(/\s*\.\.\.\s*$/, '').trim();
    if (!decompressor) continue;
    // 跳过 "You?" 和 pre-prize
    if (/^\?+$/.test(decompressor) || /you\?/i.test(tds[0]) || /you\?/i.test(decompressor) || tds[5]?.toLowerCase().includes('pre-prize')) continue;
    // 提取年份
    const dateMatch = tds[1].match(/(\d{4})/);
    const year = dateMatch ? parseInt(dateMatch[1], 10) : 2024;
    out.push({
      method: `${decompressor} (Hutter, ${tds[0]})`,
      year,
      metric: `${(size / 1e6).toFixed(2)} MB`,
      metricShort: String(size),
      lowerIsBetter: true,
      sourceUrl: 'http://prize.hutter1.net/',
    });
    if (out.length >= 5) break;
  }
  // 去重
  const seen = new Set();
  return out.filter((e) => {
    if (seen.has(e.metricShort)) return false;
    seen.add(e.metricShort);
    return true;
  });
}

// ---------- CLIC 2025 (basic HTML scrape of leaderboard table) ----------
function parseCLIC(html, bitrate) {
  // CLIC table rows: <tr><td><a href="...">Team</a></td><td>ELO</td><td>PSNR</td>...
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const out = [];
  let m;
  while ((m = trRe.exec(html)) !== null) {
    const body = m[1];
    const cells = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let c;
    while ((c = tdRe.exec(body)) !== null) cells.push(c[1].replace(/<[^>]+>/g, '').trim());
    if (cells.length < 4) continue;
    const team = cells[0];
    const elo = cells[1];
    if (!team || !elo || !/^\d+$/.test(elo)) continue;
    out.push({
      method: team,
      year: 2025,
      metric: `ELO ${elo} · PSNR ${cells[2] || '?'} · MS-SSIM ${cells[3] || '?'}`,
      metricShort: elo,
      lowerIsBetter: false,
      sourceUrl: `https://clic2025.compression.cc/leaderboard/image_${bitrate}/test/`,
    });
    if (out.length >= 8) break;
  }
  return out;
}

// ---------- main ----------
async function main() {
  const now = new Date().toISOString().slice(0, 10);
  const previous = loadPreviousSnapshot();
  const previousBoardUpdatedAt = Object.fromEntries(
    Object.keys(previous?.boards ?? {}).map((key) => [key, previous?.boardUpdatedAt?.[key] ?? previous?.refreshedAt]),
  );
  const out = {
    refreshedAt: now,
    sources: {
      ltcb: null,
      silesia: null,
      hutter: null,
      clic015: null,
      clic0075: null,
      ...(previous?.sources ?? {}),
    },
    boards: {...(previous?.boards ?? {})},
    boardUpdatedAt: {...previousBoardUpdatedAt},
    failures: [],
  };

  // Mahoney LTCB
  try {
    const html = await fetchText('http://mattmahoney.net/dc/text.html');
    updateBoard(out, 'enwik9_mahoney', parseMahoneyLTCB(html), 'ltcb', 'http://mattmahoney.net/dc/text.html', now);
    console.log(`✓ Mahoney LTCB: ${out.boards.enwik9_mahoney.length} entries`);
  } catch (e) {
    retainFailure(out, 'ltcb', e);
    console.warn('✗ Mahoney LTCB:', e.message);
  }

  // Silesia
  try {
    const html = await fetchText('http://mattmahoney.net/dc/silesia.html');
    updateBoard(out, 'silesia', parseMahoneySilesia(html), 'silesia', 'http://mattmahoney.net/dc/silesia.html', now);
    console.log(`✓ Silesia: ${out.boards.silesia.length} entries`);
  } catch (e) {
    retainFailure(out, 'silesia', e);
    console.warn('✗ Silesia:', e.message);
  }

  // Hutter
  try {
    const html = await fetchText('http://prize.hutter1.net/');
    updateBoard(out, 'hutter', parseHutter(html), 'hutter', 'http://prize.hutter1.net/', now);
    console.log(`✓ Hutter: ${out.boards.hutter.length} entries`);
  } catch (e) {
    retainFailure(out, 'hutter', e);
    console.warn('✗ Hutter:', e.message);
  }

  // CLIC 0.15
  try {
    const html = await fetchText('https://clic2025.compression.cc/leaderboard/image_0_15/test/');
    updateBoard(out, 'clic_image_0_15', parseCLIC(html, '0_15'), 'clic015', 'https://clic2025.compression.cc/leaderboard/image_0_15/test/', now);
    console.log(`✓ CLIC 0.15: ${out.boards.clic_image_0_15.length} entries`);
  } catch (e) {
    retainFailure(out, 'clic015', e);
    console.warn('✗ CLIC 0.15:', e.message);
  }

  // CLIC 0.075
  try {
    const html = await fetchText('https://clic2025.compression.cc/leaderboard/image_0_075/test/');
    updateBoard(out, 'clic_image_0_075', parseCLIC(html, '0_075'), 'clic0075', 'https://clic2025.compression.cc/leaderboard/image_0_075/test/', now);
    console.log(`✓ CLIC 0.075: ${out.boards.clic_image_0_075.length} entries`);
  } catch (e) {
    retainFailure(out, 'clic0075', e);
    console.warn('✗ CLIC 0.075:', e.message);
  }

  mkdirSync(dirname(OUT_PATH), {recursive: true});
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\n→ wrote ${OUT_PATH}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
