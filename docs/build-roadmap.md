# AI Snip Tool Build Roadmap

## Goal

Build a fast macOS desktop flow where the user presses `Cmd + Shift + A`, selects a screen region, and immediately chats with an AI about that screenshot in a lightweight floating window.

This roadmap is intentionally practical. It is designed to help you get to a working MVP quickly without locking yourself into a messy architecture.

## Product Shape

The MVP has one core interaction:

1. Launch the app quietly in the background.
2. Register a global shortcut in Electron.
3. Open a fullscreen transparent overlay.
4. Let the user drag-select a region.
5. Capture that region as an image.
6. Open a small chat window near the selection.
7. Start a chat session with the screenshot already attached as context.
8. Send user prompts plus the screenshot-backed conversation state to OpenAI.
9. Show the response and keep the session alive for follow-up questions.

If a decision does not improve this flow, defer it.

## Recommended Architecture

Keep the app split into three clear layers:

### 1. Electron Main Process

Owns native desktop concerns:

- app lifecycle
- global shortcut registration
- window creation and teardown
- screenshot capture orchestration
- OpenAI calls or server-side orchestration
- session state coordination
- IPC boundary definition

This layer should act like the system coordinator. It should not contain UI code.

### 2. Preload

Owns the secure bridge between renderer and main:

- expose a small typed API to the frontend
- hide raw `ipcRenderer`
- validate the allowed operations at the boundary

Think of preload as the only door between UI and native behavior.

### 3. Svelte Renderer

Owns interface concerns:

- overlay visuals and drag selection
- floating chat UI
- screenshot preview
- message list
- prompt input
- loading and error states

The renderer should not know how screenshots are captured or how windows are managed. It should only request actions through the preload API.

## Folder Responsibilities

Your current scaffold is already close to the right shape. Use it like this:

### `src/main`

Use this for app orchestration.

- `app.ts`: app startup orchestration
- `index.ts`: entrypoint bootstrapping
- `shortcuts.ts`: global shortcut registration and cleanup
- `windows/overlay-window.ts`: create/configure overlay BrowserWindow
- `windows/chat-window.ts`: create/configure floating chat BrowserWindow
- `services/capture-service.ts`: screen capture flow and region-to-image logic
- `services/openai-service.ts`: OpenAI request construction and response handling
- `services/session-store.ts`: in-memory session state for current screenshot chats
- `ipc/*.ts`: one file per domain, not one giant IPC file
- `types/ipc.ts`: shared IPC contracts used by main and preload

### `src/preload`

Keep this small.

- `index.ts`: expose a typed `window.electronAPI` surface

### `src/renderer`

Use this for all Svelte-facing logic.

- `routes/overlay/+page.svelte`: fullscreen selection screen
- `routes/chat/+page.svelte`: floating chat screen
- `lib/components`: visual building blocks
- `lib/stores/chat-session.ts`: renderer-side session state
- `lib/stores/ui.ts`: local UI state like loading, visibility, selection state
- `lib/api/electron.ts`: typed wrappers around preload-exposed methods
- `lib/types`: UI-facing types only

## What Goes Where

This is the most important architectural rule set for the project.

### Put it in Electron main if it involves:

- global shortcuts
- macOS permissions
- screen capture APIs
- BrowserWindow creation or positioning
- OpenAI API secrets
- session persistence outside the active UI
- cross-window coordination

### Put it in the renderer if it involves:

- drawing the selection rectangle
- rendering messages
- handling text input
- previewing the screenshot
- showing pending/error states
- optimistic UI updates

### Put it in preload if it involves:

- exposing safe, typed commands from main to renderer
- hiding IPC implementation details

## IPC Design

Keep IPC narrow and event-driven. Avoid exposing generic send/invoke helpers.

Recommended command surface:

- `startSnipFlow()`
- `cancelSnipFlow()`
- `completeSelection(bounds)`
- `getActiveSession()`
- `sendChatMessage({ sessionId, text })`
- `closeSession(sessionId)`
- `onSessionUpdated(callback)`
- `onOverlayCommand(callback)`

Design principles:

- use `ipcMain.handle` for request/response actions
- use events only for push-style updates from main to renderer
- keep payloads typed and small
- send file paths, IDs, and metadata rather than large blobs when possible

For the screenshot itself, prefer one of these approaches:

1. Save the image to a temp file and pass a file path around.
2. Save the image in memory in main and expose only session metadata to renderer.

For the MVP, temp file plus session metadata is the most pragmatic option.

## Session Model

Treat each screenshot chat as a session.

A session should contain:

- `sessionId`
- `createdAt`
- `screenshotPath`
- `selectionBounds`
- `messages`
- `status`

The screenshot should be persistent context for that session. That means follow-up prompts should not require the user to reattach the image manually.

For the MVP, keep sessions in memory and delete screenshot temp files when the session is closed.

## Build Order

Build in vertical slices, not by finishing every layer at once.

### Step 1: Lock the foundations

Set up the app shell and types before building features.

What to do:

- finalise Electron + SvelteKit + TypeScript wiring
- define shared IPC types
- create window factory helpers
- create a minimal preload API

Why this matters:

You want the boundaries to be clean early, because this project touches native APIs, UI, and AI orchestration. If the boundaries are vague, the app will get messy fast.

Success check:

- app launches quietly without opening chat by default
- overlay route can open in a BrowserWindow
- chat route can open in a separate BrowserWindow

### Step 2: Implement the snipping overlay only

Do not mix AI into this step.

What to do:

- open a fullscreen transparent always-on-top overlay
- render a dimmed background with a visible selection rectangle
- support click-and-drag selection
- allow escape to cancel
- send selected bounds back to main

Why this matters:

This is the core UX. If the overlay feels wrong, the whole product feels wrong.

Success check:

- `Cmd + Shift + A` opens the overlay
- dragging returns correct coordinates
- cancel works reliably

### Step 3: Capture the selected region

Once selection works, turn it into a real image.

What to do:

- use Electron desktop capture or a macOS-compatible screen capture path
- map overlay coordinates to the captured display correctly
- save the selected image to a temp path
- return session-ready screenshot metadata

Why this matters:

Coordinate handling across screen scale factors and multiple displays is one of the easiest places to waste time. Prove this works early.

Success check:

- saved image matches the selected region
- retina scaling does not break capture
- basic multi-display behavior is understood, even if MVP support is limited

### Step 4: Open the floating chat window

Build the lightweight response surface next.

What to do:

- create a frameless or minimal chrome chat window
- position it near the selected region when possible
- load the screenshot preview into the UI
- show an empty conversation state

Why this matters:

This is where the product starts to feel real. You want to prove the transition from capture to chat is fast and coherent.

Success check:

- after capture, the chat window opens automatically
- screenshot preview is visible
- closing the chat ends the session cleanly

### Step 5: Add session state and message flow

Before calling the AI, make sure the session mechanics are sound.

What to do:

- define message types
- store session messages in main
- sync session state to renderer
- support multi-turn chat on the same screenshot

Why this matters:

If you bolt the AI in before the session model is stable, you will end up rewriting request construction and UI state together.

Success check:

- user messages appear immediately
- session can rehydrate current messages
- close/reset behavior is predictable

### Step 6: Integrate OpenAI

Add the AI only after screenshot flow and session flow are both solid.

What to do:

- keep API access in main, not renderer
- construct multimodal requests using the screenshot plus message history
- stream or return the assistant response
- map errors into user-friendly UI states

Why this matters:

This is the only networked part of the MVP. Keeping it isolated makes it easier to test, replace, or move behind a local backend later.

Success check:

- prompt plus screenshot produces an answer
- follow-up questions continue using the same screenshot session
- API failures do not crash the UI

### Step 7: Tighten UX and failure handling

Polish after the core loop works end to end.

What to do:

- loading states
- retry states
- empty/error messaging
- keyboard shortcuts for cancel/submit/close
- smoother overlay and chat window transitions

Why this matters:

The difference between a demo and a usable tool is usually latency perception and failure behavior.

Success check:

- common failure cases feel controlled
- UI remains responsive during requests
- session cleanup is consistent

## Early Decisions To Make Now

These are worth deciding up front because they affect multiple layers.

### 1. Screenshot storage strategy

Recommendation: store captured images in temp files for MVP.

Reason:

- simpler than moving large binary payloads through IPC
- easier to preview in renderer
- easier to attach to OpenAI requests from main

### 2. Session persistence

Recommendation: in-memory only for MVP.

Reason:

- simpler lifecycle
- faster prototype path
- avoids premature database work

### 3. OpenAI integration location

Recommendation: call OpenAI from Electron main.

Reason:

- keeps secrets out of renderer
- fits your architecture expectation that backend logic stays outside UI

### 4. Overlay capture strategy

Recommendation: keep overlay selection in renderer, but perform actual capture in main.

Reason:

- renderer is best for interaction
- main is best for native and security-sensitive operations

### 5. Multi-display scope

Recommendation: support the primary display first, then expand.

Reason:

- multi-display and scale-factor mapping can become a large detour
- you only need a realistic MVP path right now

## Practical Risks

These are the main things likely to slow you down:

### Coordinate translation

Overlay coordinates, display bounds, and screenshot image coordinates may not line up directly, especially on retina displays.

Mitigation:

- log display bounds and scale factors
- keep capture logic isolated in one service
- write a simple manual verification checklist early

### macOS permissions

Screen recording permission may block capture behavior.

Mitigation:

- detect failure cleanly
- show a clear explanation in the UI
- test this early, not after the rest of the stack is built

### Window focus and z-order

Overlay and chat windows can behave unexpectedly on macOS.

Mitigation:

- isolate window config in dedicated window modules
- tune flags intentionally rather than inline

### Overgrown IPC

It is easy to let IPC become a bag of random commands.

Mitigation:

- keep IPC grouped by domain
- type every payload
- review API additions before exposing them through preload

## Suggested MVP Milestones

Use these as practical checkpoints:

### Milestone 1

Shortcut opens overlay and returns selection bounds.

### Milestone 2

Selection produces a correct screenshot file.

### Milestone 3

Screenshot opens in floating chat window with a live session.

### Milestone 4

Prompt + screenshot reaches OpenAI and renders a response.

### Milestone 5

Multi-turn chat works reliably on the same screenshot.

## What Not To Build Yet

Defer these until the core loop works:

- screenshot history browser
- persistent local database
- authentication system
- advanced prompt templates
- annotation tools
- background sync
- cross-platform support
- OCR-only side pipelines separate from the main multimodal flow

## Recommended First Implementation Pass

If you want the fastest realistic path, build in this exact order:

1. Window factories and app boot.
2. Global shortcut registration.
3. Overlay UI and region selection.
4. Selection-to-main IPC.
5. Capture service and temp image output.
6. Chat window creation and screenshot preview.
7. Session store and chat message model.
8. OpenAI service integration.
9. Loading, errors, and cleanup.

That sequence keeps each step testable and avoids building on unproven assumptions.

## Final Guidance

The right MVP here is not a general desktop AI framework. It is one extremely tight loop:

`shortcut -> select -> capture -> ask -> answer -> follow up`

Protect that loop. Keep native concerns in Electron main, keep UI concerns in Svelte, keep preload thin, and avoid adding infrastructure until the first end-to-end version is working.
