# Immersive V3 First-Round Report

## Delivered

- Three runnable prototypes: project, resources and workbench.
- Six runnable labs: design, navigation, cards, charts, motion and 3D.
- Shared search index for papers, algorithms, compressors, datasets, experiments and reports.
- Local workspace state under `cr-v3-workspace`; note drafts use IndexedDB.
- Real first briefing assets, literature records, algorithm lineage and datasets.

## Data Rules

- No benchmark number is generated without a repository source.
- Missing experiment results render an explicit empty chart or empty panel.
- Missing paper PDF renders a source link and local-file empty state.
- Prototype-only local editing is labeled as local and does not imply collaboration or upload support.

## Runtime

Run `npm start -- --port 3022 --host 127.0.0.1`, then open `/Compressor_site/prototype/project`.

`npm run build` and `npm run verify:v3` pass. Repository-wide `npm run typecheck` remains blocked by pre-existing malformed TSX files outside V3.

## Next Gate

Do not replace existing routes yet. Review the three prototypes, choose which interactions survive, then prepare a route-by-route migration plan.
