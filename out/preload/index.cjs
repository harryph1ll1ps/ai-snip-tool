"use strict";
const electron = require("electron");
const IPC_CHANNELS = {
  storeSelection: "screenshot:store-selection",
  cancelSnipFlow: "screenshot:cancel-snip-flow",
  getActiveSession: "session:get-active"
};
const electronAPI = {
  storeSelection(bounds) {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.storeSelection, bounds);
  },
  cancelSnipFlow() {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.cancelSnipFlow);
  },
  getActiveSession() {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.getActiveSession);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
