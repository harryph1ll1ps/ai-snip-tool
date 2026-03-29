import { app, ipcMain, screen, desktopCapturer, BrowserWindow, globalShortcut } from "electron";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
let isAppStarted = false;
async function startApp() {
  if (isAppStarted) {
    return;
  }
  isAppStarted = true;
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  await app.whenReady();
}
let activeSession = null;
function createSession(screenshot) {
  const session = {
    id: randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    screenshot
  };
  activeSession = session;
  return session;
}
function getActiveSession() {
  return activeSession;
}
const IPC_CHANNELS = {
  storeSelection: "screenshot:store-selection",
  cancelSnipFlow: "screenshot:cancel-snip-flow",
  getActiveSession: "session:get-active"
};
function registerSessionIpc() {
  ipcMain.handle(IPC_CHANNELS.getActiveSession, () => {
    return getActiveSession();
  });
}
async function captureSelection(bounds) {
  const display = screen.getPrimaryDisplay();
  const scaleFactor = display.scaleFactor;
  const source = await getPrimaryDisplaySource();
  const cropBounds = {
    x: Math.round(bounds.x * scaleFactor),
    y: Math.round(bounds.y * scaleFactor),
    width: Math.round(bounds.width * scaleFactor),
    height: Math.round(bounds.height * scaleFactor)
  };
  if (cropBounds.width <= 0 || cropBounds.height <= 0) {
    throw new Error("Selection must have a positive size before it can be captured.");
  }
  const screenshot = source.thumbnail.crop(cropBounds);
  const outputPath = join(tmpdir(), `ai-snip-${randomUUID()}.png`);
  await writeFile(outputPath, screenshot.toPNG());
  return {
    path: outputPath,
    previewDataUrl: screenshot.toDataURL(),
    selectionBounds: bounds,
    scaledWidth: screenshot.getSize().width,
    scaledHeight: screenshot.getSize().height,
    scaleFactor
  };
}
async function getPrimaryDisplaySource() {
  const display = screen.getPrimaryDisplay();
  const thumbnailSize = {
    width: Math.round(display.size.width * display.scaleFactor),
    height: Math.round(display.size.height * display.scaleFactor)
  };
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize
  });
  const primarySource = sources.find((source) => source.display_id === String(display.id)) ?? sources[0];
  if (!primarySource) {
    throw new Error("Could not find a desktop capture source for the primary display.");
  }
  return primarySource;
}
const CHAT_ROUTE = "/chat";
async function createChatWindow(options = {}) {
  const chatWindow = new BrowserWindow({
    width: 420,
    height: 640,
    minWidth: 360,
    minHeight: 480,
    show: false,
    alwaysOnTop: true,
    title: "AI Chat",
    webPreferences: {
      // before loading the UI, run the preload script
      preload: fileURLToPath(new URL("../preload/index.cjs", import.meta.url))
    }
  });
  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    await chatWindow.loadURL(`${rendererUrl}${CHAT_ROUTE}`);
  } else {
    await chatWindow.loadFile(
      fileURLToPath(new URL(`../renderer${CHAT_ROUTE}/index.html`, import.meta.url))
    );
  }
  if (typeof options.x === "number" && typeof options.y === "number") {
    chatWindow.setPosition(options.x, options.y);
  }
  chatWindow.show();
  chatWindow.focus();
  return chatWindow;
}
function closeSenderWindow(senderWindow) {
  senderWindow?.close();
}
function registerScreenshotIpc() {
  ipcMain.handle(IPC_CHANNELS.storeSelection, async (event, bounds) => {
    try {
      const capturedScreenshot = await captureSelection(bounds);
      const overlayWindow = BrowserWindow.fromWebContents(event.sender);
      createSession(capturedScreenshot);
      closeSenderWindow(overlayWindow);
      await createChatWindow({
        x: 96,
        y: 96
      });
      return capturedScreenshot;
    } catch (error) {
      console.error("Failed to store selection:", error);
      throw error;
    }
  });
  ipcMain.handle(IPC_CHANNELS.cancelSnipFlow, (event) => {
    console.info("Overlay selection cancelled");
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    closeSenderWindow(senderWindow);
  });
}
function registerIpcHandlers() {
  registerScreenshotIpc();
  registerSessionIpc();
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
  const display = screen.getPrimaryDisplay();
  const overlayWindow = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    fullscreenable: false,
    title: "AI Snip Overlay",
    webPreferences: {
      preload: fileURLToPath(new URL("../preload/index.cjs", import.meta.url))
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
      fileURLToPath(new URL(`../renderer${OVERLAY_ROUTE}/index.html`, import.meta.url))
    );
  }
  return overlayWindow;
}
async function bootstrap() {
  await startApp();
  registerIpcHandlers();
  registerGlobalShortcuts({
    startSnipFlow: createOverlayWindow
  });
}
void bootstrap();
