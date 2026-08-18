# What If? — Financial & Life Scenario Simulator

Interactive personal finance and life-decision simulator that models scenarios, projects wealth over time, and runs stress tests.

## Quick start

- Dev: `npm run dev` (runs `vite --port=3000 --host=0.0.0.0`)
- Build: `npm run build`
- Preview: `npm run preview`
- Other: `npm run clean` (removes `dist` and `server.js`), `npm run lint` (runs `tsc --noEmit`)

## Tech

- React 19, TypeScript, Vite
- Tailwind CSS (via `@tailwindcss/vite`)
- Notable deps: `@google/genai`, `recharts`, `lucide-react`, `canvas-confetti`, `express`, `dotenv`

## Core features (from source)

- Multi-year deterministic financial projection (`runSimulation`)
- Scenario catalog & builder (examples: buy house, increase SIP, job loss, market crash)
- Scenario comparison with explanation nodes (`compareScenarios`)
- Reverse planner to reach a target corpus (`solveReverseWhatIf`)
- Life-shock stress tests with mitigations (`runLifeShockScenarios`)

## Defaults (from src/engine/projection.ts)

- Assumptions: equity 12%, debt 7%, gold 8%, cash 4%, inflation 6%, income growth 8%, loan rate 8.5%, SWR 4%
- Example profile: name `Kunal`, age 32, monthlyIncome 150000, monthlyExpenses 70000, monthlySip 45000, targetRetirementCorpus 50,000,000

## Project structure (top-level)

- `index.html` — app entry (loads `/src/main.tsx`)
- `src/` — React app (App.tsx, components, engine, types)
  - `src/engine/projection.ts` — core simulation & scenario logic
  - `src/types.ts` — data models and scenario types
- `assets/` — static assets
- `package.json`, `tsconfig.json`, `vite.config.ts`, `.env.example`, `bun.lock`, `.gitignore`

## Implementation notes

- Persists to localStorage keys: `whatif_profile`, `whatif_assumptions`, `whatif_saved_history`
- `metadata.json` contains: name and description used by the app
- Some source files include an `SPDX-License-Identifier: Apache-2.0` header; no repository-level `LICENSE` file detected in root

