import { app, BrowserWindow } from "electron";
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
const CHAT_ROUTE = "/chat";
async function createChatWindow() {
  const chatWindow = new BrowserWindow({
    width: 420,
    height: 640,
    minWidth: 360,
    minHeight: 480,
    show: false,
    // hide window initally
    title: "AI Snip Tool",
    webPreferences: {
      preload: fileURLToPath(new URL("../../preload/index.js", import.meta.url))
    }
  });
  chatWindow.once("ready-to-show", () => {
    chatWindow.show();
  });
  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    await chatWindow.loadURL(`${rendererUrl}${CHAT_ROUTE}`);
  } else {
    await chatWindow.loadFile(
      fileURLToPath(new URL(`../../renderer${CHAT_ROUTE}/index.html`, import.meta.url))
    );
  }
  return chatWindow;
}
void startApp({
  createInitialWindow: createChatWindow
});
