# EconSim Pro — CBSE Economics (030) Simulator, Class XI & XII

> Interactive simulators, graph labs, data labs and "Living Worlds" that teach the CBSE 2026–27 Economics syllabus (Subject Code 030) by letting students run the economy themselves.

**[▶ Open the live app](https://anveshix.github.io/cbse-economics-simulator/)** · [Syllabus source](curriculum/Economics_2026-27_Content_MicroContent_Taxonomy.md) · [QA reports](reports/) · [Docs](docs/)

---

## Features

- **10 Living Worlds** — role-play economies (a chai stall, a mandi, a town survey, an island, a national-income count and more). Students decide first; the textbook concept is named afterwards, from their own rounds.
- **44 simulators, graph labs, data labs and concept explorers** covering Statistics for Economics, Introductory Microeconomics (Class XI) and Introductory Macroeconomics and Indian Economic Development (Class XII).
- **Movement vs shift in Graph Labs** — drag a point along a curve (movement) or drag the whole curve (shift); the app names exactly what changed.
- **Story Mode, PREDICT cards and quizzes** with answers computed from the model, not typed by hand.
- **English and Hindi** for simulators, charts, diagrams and Living Worlds (coverage is tracked per simulator in `js/i18n_*`).
- **Installable PWA** with an offline-friendly service worker.

## Tech stack

- Vanilla HTML, CSS and JavaScript — **no framework, no bundler**.
- [Plotly.js](https://plotly.com/javascript/) (vendored in `js/plotly.min.js`) for charts; hand-built SVG for diagrams.
- three.js (vendored, loaded on demand) for the optional 3D circular-flow view.
- Node.js only for the test and QA scripts in `tools/`.

## Setup

```bash
git clone https://github.com/anveshix/cbse-economics-simulator.git
cd cbse-economics-simulator
npm install

npm run verify        # typecheck + lint + curriculum tests + build check + browser smoke test
npx http-server . -p 8080   # or just open index.html in a browser
```

Requirements: a current Node.js LTS for the checks (`npm run smoke` also needs Playwright and Chromium). The app itself needs only a browser.

## Usage

1. Open the app and choose a class, part and unit from the home screen.
2. Start with a **Living World** or a **Graph Lab**, make a prediction, then change the controls and compare the result.
3. Use the **Practice** and **Quiz** panels to check understanding.

## Folder structure

```
.
├── index.html, css/, js/       # The app (sim-engine, simulations, graph labs, Living Worlds, i18n)
├── icons/, manifest.webmanifest, sw.js   # PWA assets
├── curriculum/                 # Syllabus source of truth (CBSE 2026–27 taxonomy)
├── docs/                       # Economic models, validation, architecture, planning notes
├── reports/                    # Coverage matrix, calculation and QA reports
├── tools/                      # Test, smoke, build-check and report generators
├── CLAUDE.md, AGENTS.md        # Guidance for AI coding agents working on this repo
└── run_econ_sim.bat            # Windows launcher (local use only)
```

Start with [`CLAUDE.md`](CLAUDE.md) for architecture and working conventions, and [`docs/economics/`](docs/economics/) before changing any formula.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Economic changes must pass the economic check, not only `npm run verify`.

## License

No licence has been chosen for this repository yet. Until one is added, the default applies: **all rights reserved** by the author (anveshix). Please ask before reusing or redistributing the code.

Third-party libraries keep their own licences (all MIT). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Author

**anveshix** — [github.com/anveshix](https://github.com/anveshix)
