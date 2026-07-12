# V3 Prototype Comparison

## Isolation

- Source branch: `newweb` at `d22b5d8`.
- Prototype branch: `codex/immersive-v3`.
- All V3 implementation lives under `src/visual-v3` plus nine isolated page entries.
- Existing routes, navigation, page components, CSS and persisted state are unchanged.

## Structural Differences

| Area | Existing site | V3 prototype |
|---|---|---|
| Global structure | One shared workbench shell | Three area-specific shells with a small area switcher |
| Project | Dashboard and page sections | Full-bleed project narrative, system route, evidence states, Gantt and briefing archive |
| Resources | Database/table and repeated cards | Editorial archive, asymmetric paper layout, tag rail and interactive lineage |
| Workbench | Fixed three-column paper page | Research OS with resizable panels, modes, tabs, status bar and local persistence |
| Charts | Mixed component defaults | Explicit source/verification contract and honest empty states |
| 3D | None | Compression data flow tied to model and bitstream semantics |
| Motion | General transitions | 120-180 ms interface feedback and longer narrative transitions only in labs |
| Mobile | Shared responsive shell | Project narrative, archive drawer and stacked workbench panels |

## Verification

- Desktop checks: 1440 x 1000.
- Tablet checks: 1024 x 768.
- Mobile checks: 390 x 844.
- Tested global search, workbench mode switching, panel hiding, React Flow controls, Gantt rendering and Three.js canvas creation.
- Screenshots were intentionally omitted at the user's latest request.

## Known Baseline Issue

The source branch already contains malformed or binary-looking TSX files under `src/components`, so the repository-wide `npm run typecheck` fails before reaching V3. The Docusaurus production build succeeds for both Chinese and English locales, and all V3 routes compile and run. The pre-existing files were not modified because prototype isolation is a hard requirement.

## Rollback

Switch back to `newweb` or delete `codex/immersive-v3`. No data migration or old-route replacement is required.
