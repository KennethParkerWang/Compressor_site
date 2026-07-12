import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = process.cwd();
const routes = [
  'src/pages/design-lab.tsx',
  'src/pages/navigation-lab.tsx',
  'src/pages/card-lab.tsx',
  'src/pages/chart-lab.tsx',
  'src/pages/motion-lab.tsx',
  'src/pages/three-lab.tsx',
  'src/pages/prototype/project.tsx',
  'src/pages/prototype/resources.tsx',
  'src/pages/prototype/workbench.tsx',
];

const missing = routes.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) throw new Error(`Missing V3 routes:\n${missing.join('\n')}`);

const adapter = readFileSync(resolve(root, 'src/visual-v3/data/researchAdapter.ts'), 'utf8');
for (const required of ['literatureData', 'evolutionNodes', 'compressionDatasets', 'experimentAssets', 'getWeeklyReportAt']) {
  if (!adapter.includes(required)) throw new Error(`Research adapter does not reference ${required}`);
}

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
for (const dependency of ['echarts', 'frappe-gantt', 'three', '@react-three/fiber', 'lenis', 'react-pdf']) {
  if (!packageJson.dependencies[dependency]) throw new Error(`Missing V3 dependency: ${dependency}`);
}

console.log(`V3 verification passed: ${routes.length} routes and 6 integration dependencies.`);
