# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first

- `AGENTS.md` — binding rules (UI zero-tolerance rules, OnPush/signals, models, images, session, workflow). Follow it exactly.
- `PROJECT_CONTEXT.md` — architecture map (routes, services, shared components, backend integration, known gaps).

Keep both up to date when you change structure or conventions.

## Commands

```bash
npm start                               # ng serve → http://localhost:4200 (needs the LAN backend 192.168.1.150:500)
npm run build                           # production build — must pass
npx tsc -p tsconfig.app.json --noEmit   # fast type-check (templates are only checked by the build)
npx prettier --write <files>
```

There is **no test runner** (no `test` target, no specs, Vitest not installed). Verify changes with `npm run build`; the only accepted warning is the existing initial-bundle budget warning.

## Things that bite

- The app is **zoneless** and every component is `OnPush`: rendered state that changes asynchronously must be a signal.
- Models: one interface/type per `*.model.ts` in the nearest `models/` folder, no `index.ts` barrels.
- Images come from `environment.filesUrl` / `FILES_ORIGIN` (`core/constants/files.constants.ts`), never `apiUrl`.
- No `hover:*` / `group-hover:*` / `active:*` classes or `:hover` CSS.
- Environment config is `src/app/core/environments/environment.ts` (single file, no replacements).
