# Calisthenics Slop (web)

Source for the Calisthenics Slop web app, served at
[stuffbyalex.net/calisthenics-slop](https://stuffbyalex.net/calisthenics-slop/).

It's a Vite + React + TypeScript SPA backed by Supabase. Routing uses
`HashRouter` so deep links work on GitHub Pages without server rewrites.

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

This builds into `../calisthenics-slop/` (the folder GitHub Pages serves at
`/calisthenics-slop/`). Commit both this source folder and the regenerated
`../calisthenics-slop/` output, then push — Pages redeploys automatically.

## Supabase

Schema and migrations live in [`supabase/`](./supabase). The app connects with
the project's **publishable** (anon) key, hardcoded in `src/supabase.ts` — safe
for a public client. Never commit the service-role key.
