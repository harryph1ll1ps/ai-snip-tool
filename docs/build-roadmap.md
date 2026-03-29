# AI Snip Tool Build Roadmap

## Goal

Build a fast desktop flow where the user presses `Cmd + Shift + A`, selects a screen region, and immediately gets a lightweight floating assistant window anchored to that screenshot workflow.

## Current Status

What is working now:

- app bootstrap and quiet background startup
- global shortcut registration
- fullscreen overlay BrowserWindow creation
- drag-to-select overlay UI
- Escape-to-cancel flow
- typed preload bridge for overlay actions
- main-process IPC registration for screenshot actions
- primary-display screenshot capture to a temp PNG
- automatic transition from overlay to chat window after capture
- a styled floating chat UI shell

What is not built yet:

- passing the captured screenshot metadata into the chat renderer
- screenshot preview in the chat window
- chat state persistence
- prompt submission flow
- OpenAI request/response handling
- smart chat-window positioning relative to the selected region

Known assumptions:

- capture is primary-display only
- screenshots are written to temp files
- selection bounds are measured in CSS pixels and translated to device pixels in main

## Current Directory Shape

```text
src/
  main/
    app.ts
    index.ts
    shortcuts.ts
    ipc/
      index.ts
      screenshot.ts
    services/
      capture-service.ts
    types/
      ipc.ts
    windows/
      chat-window.ts
      overlay-window.ts
  preload/
    index.ts
  renderer/
    app.d.ts
    app.html
    lib/
      api/
        electron.ts
      components/
        SnipOverlay.svelte
    routes/
      chat/+page.svelte
      overlay/+page.svelte
```

Empty placeholder files and unused scaffolding were intentionally removed during cleanup so the repo reflects only the implemented MVP.

## Architectural Rules

Put logic in Electron main when it involves:

- global shortcuts
- screen capture
- BrowserWindow creation
- cross-window orchestration
- secret-backed AI calls

Put logic in preload when it involves:

- exposing a safe, typed bridge to the renderer
- hiding raw Electron IPC details

Put logic in the renderer when it involves:

- drawing UI
- pointer interaction
- message rendering
- prompt entry
- loading and error presentation

## Suggested Next Steps

1. Add a session model in main so a capture can open chat with structured screenshot metadata.
2. Extend the preload bridge with `getActiveSession()` and `sendChatMessage(...)`.
3. Replace the hard-coded chat messages with renderer state driven by a real session payload.
4. Add screenshot preview and metadata display in the chat UI.
5. Implement the OpenAI service and wire responses back into the chat window.
