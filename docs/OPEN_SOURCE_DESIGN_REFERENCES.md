# Open-source design and library references

Checked on 2026-07-11. This file records candidate sources for the research site rebuild. Repository metadata and licenses can change; re-check the upstream license before copying code or assets.

## Academic site references

| Project | License | Useful idea | Decision |
| --- | --- | --- | --- |
| [al-folio](https://github.com/alshedivat/al-folio) | MIT | Restrained academic typography, publication lists, project pages | Use as an information-density reference; do not copy theme code |
| [academicpages](https://github.com/academicpages/academicpages.github.io) | MIT | Stable personal identity, publications, talks, and portfolio structure | Use its personal-research hierarchy as a reference |
| [Hugo Academic CV](https://github.com/HugoBlox/hugo-theme-academic-cv) | MIT | Structured publications, talks, projects, and BibTeX workflows | Consider only if the site later needs a public CV export |

The current site is a working research record rather than a public CV. The rebuild therefore keeps operational pages, but gives the shell the calmer hierarchy of an academic portfolio.

## UI and data libraries

| Project | License | Possible use | Current status |
| --- | --- | --- | --- |
| [Lucide](https://github.com/lucide-icons/lucide) | ISC | Interface icons | Already installed and used |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | MIT | Accessible component patterns | Existing local components may follow its patterns; avoid importing a second visual system |
| [TanStack Table](https://github.com/TanStack/table) | MIT | Literature and benchmark tables | Already installed |
| [TanStack Virtual](https://github.com/TanStack/virtual) | MIT | Large literature lists | Already installed |
| [React Flow / xyflow](https://github.com/xyflow/xyflow) | MIT | Interactive algorithm and literature graphs | Already installed |
| [D3](https://github.com/d3/d3) | ISC | Custom research visualizations | Already installed |
| [Recharts](https://github.com/recharts/recharts) | MIT | Experiment curves and compact charts | Already installed |
| [Observable Plot](https://github.com/observablehq/plot) | ISC | Concise statistical graphics | Candidate; add only when a chart cannot be expressed cleanly with the current stack |
| [PDF.js](https://github.com/mozilla/pdf.js) | Apache-2.0 | Embedded paper and report preview | Candidate for a later PDF reader; current report links remain direct |

## Visual assets

| Source | License | Appropriate use | Constraint |
| --- | --- | --- | --- |
| [Simple Icons](https://github.com/simple-icons/simple-icons) | CC0-1.0 | GitHub, arXiv, Zotero, and tool marks | Use only when a brand mark communicates more clearly than text |
| [Tabler Icons](https://github.com/tabler/tabler-icons) | MIT | Alternative interface icons | Do not mix with Lucide in the same interface |
| [Academicons](https://github.com/jpswalsh/academicons) | Upstream-specific | DOI, arXiv, ORCID, Google Scholar marks | Verify each release and font license before bundling |
| [OpenMoji](https://github.com/hfg-gmuend/openmoji) | CC-BY-SA-4.0 | Educational diagrams | Attribution and share-alike obligations make it unsuitable for routine UI chrome |

No third-party artwork was copied during this rebuild. The homepage uses the repository's existing literature cover images so the visual material represents the actual research collection.

## Rebuild rules

1. The primary navigation contains only six durable research objects: overview, literature, algorithms, datasets, experiments, and briefings.
2. Secondary tools remain available through the research directory instead of competing in the main navigation.
3. Prefer lists, tables, timelines, and diagrams over generic cards.
4. Use interface language that names the object or action. Avoid phrases such as "AI intelligence console", "smart cockpit", and unsupported progress claims.
5. Empty experiment and meeting states stay visibly empty until real data exists.
6. Add a dependency only when it solves a concrete gap that the current stack cannot cover.
