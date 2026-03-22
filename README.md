# AI Snip Tool

Electron + SvelteKit desktop app for a fast screenshot-to-chat workflow on macOS.

## Project objective

The target interaction is:

1. User presses `Cmd + Shift + A`
2. A fullscreen snipping overlay opens
3. User selects a screen region
4. The app captures that region
5. A small floating AI chat opens with the screenshot already attached as context
6. The user can ask follow-up questions about the same screenshot

This repo is currently in the foundation stage. The focus right now is app boot, process boundaries, typed IPC contracts, and renderer wiring.

## Tech stack

- Electron for desktop lifecycle, windows, shortcuts, and native integrations
- SvelteKit for the renderer UI
- TypeScript across main, preload, and renderer
- `electron-vite` for development/build tooling

## Current structure

```text
src/
  main/      Electron main process code
  preload/   Safe bridge between Electron and the renderer
  renderer/  SvelteKit UI
docs/        Planning and architecture notes
```

## Scripts

- `npm run dev`: start Electron in development with renderer HMR and main/preload watch mode
- `npm run build`: generate a production build
- `npm run preview`: run the built app
- `npm run check`: run Svelte + TypeScript checks

## Notes

- The renderer is configured as a SvelteKit app rooted in `src/renderer`.
- The Electron app entrypoint is `src/main/index.ts`.
- The current roadmap lives in `docs/build-roadmap.md`.

## Next implementation step

The next concrete task is to wire the first real BrowserWindow from `src/main/app.ts` through `src/main/windows/chat-window.ts` so the app boots into a visible renderer route.
