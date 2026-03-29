# AI Snip Tool

Electron + SvelteKit desktop app for a fast screenshot-to-chat workflow on macOS.

## Current MVP

The app currently supports this end-to-end flow:

1. Launch the app in the background.
2. Press `Cmd + Shift + A`.
3. Open a fullscreen snipping overlay.
4. Drag to select part of the screen.
5. Capture that region to a temp PNG.
6. Close the overlay and open a floating chat window.

The chat window UI is currently a visual shell only. The screenshot metadata is captured in main, but it is not yet displayed in the renderer or sent to an AI backend.

## Architecture

```text
src/
  main/      Electron main process: lifecycle, shortcuts, windows, IPC, capture
  preload/   Safe typed bridge from renderer to main
  renderer/  Svelte UI for overlay and chat
docs/        Notes on roadmap and architecture
```

Key runtime flow:

- [src/main/index.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/main/index.ts) boots the app, IPC handlers, and global shortcuts.
- [src/main/shortcuts.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/main/shortcuts.ts) registers `Cmd + Shift + A`.
- [src/main/windows/overlay-window.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/main/windows/overlay-window.ts) opens the snipping overlay.
- [src/renderer/lib/components/SnipOverlay.svelte](/Users/harryphillips/PROJECTS/ai-snip-tool/src/renderer/lib/components/SnipOverlay.svelte) handles drag selection and Escape-to-cancel.
- [src/preload/index.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/preload/index.ts) exposes the typed Electron bridge.
- [src/main/ipc/screenshot.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/main/ipc/screenshot.ts) handles selection storage/cancel actions.
- [src/main/services/capture-service.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/main/services/capture-service.ts) captures the selected region.
- [src/main/windows/chat-window.ts](/Users/harryphillips/PROJECTS/ai-snip-tool/src/main/windows/chat-window.ts) opens the floating chat window.

## Scripts

- `npm run dev`: run Electron with watched main/preload builds and renderer HMR
- `npm run build`: build the app
- `npm run preview`: preview the built app
- `npm run check`: run Svelte + TypeScript checks

## Notes

- The preload bundle is intentionally built as CommonJS so Electron can load it reliably.
- The renderer is rooted in `src/renderer` and uses SvelteKit static output for production routes.
- Current roadmap notes live in [docs/build-roadmap.md](/Users/harryphillips/PROJECTS/ai-snip-tool/docs/build-roadmap.md).
