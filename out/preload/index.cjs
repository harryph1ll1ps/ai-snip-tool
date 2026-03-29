"use strict";
const electron = require("electron");
const IPC_CHANNELS = {
  storeSelection: "screenshot:store-selection",
  cancelSnipFlow: "screenshot:cancel-snip-flow"
};
const electronAPI = {
  storeSelection(bounds) {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.storeSelection, bounds);
  },
  cancelSnipFlow() {
    console.log("preload cancelSnipFlow invoked");
    return electron.ipcRenderer.invoke(IPC_CHANNELS.cancelSnipFlow);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
