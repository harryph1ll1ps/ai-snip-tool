import { app, BrowserWindow, globalShortcut } from "electron";
import { fileURLToPath } from "node:url";
let isAppStarted = false;
async function startApp(options = {}) {
  if (isAppStarted) {
    return;
  }
  isAppStarted = true;
  const createInitialWindow = options.createInitialWindow;
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createInitialWindow?.();
    }
  });
  await app.whenReady();
  await createInitialWindow?.();
}
const START_SNIP_ACCELERATOR = "CommandOrControl+Shift+A";
function registerGlobalShortcuts(options) {
  const startSnipFlow = options.startSnipFlow;
  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
  globalShortcut.register(START_SNIP_ACCELERATOR, () => {
    void startSnipFlow();
  });
}
const OVERLAY_ROUTE = "/overlay";
async function createOverlayWindow() {
  const overlayWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    title: "AI Snip Overlay",
    webPreferences: {
      preload: fileURLToPath(new URL("../../preload/index.js", import.meta.url))
    }
  });
  overlayWindow.once("ready-to-show", () => {
    overlayWindow.show();
  });
  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    await overlayWindow.loadURL(`${rendererUrl}${OVERLAY_ROUTE}`);
  } else {
    await overlayWindow.loadFile(
      fileURLToPath(new URL(`../../renderer${OVERLAY_ROUTE}/index.html`, import.meta.url))
    );
  }
  return overlayWindow;
}
async function bootstrap() {
  await startApp();
  registerGlobalShortcuts({
    startSnipFlow: createOverlayWindow
  });
}
void bootstrap();
