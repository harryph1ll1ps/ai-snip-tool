import { contextBridge, ipcRenderer } from "electron";
const IPC_CHANNELS = {
  storeSelection: "screenshot:store-selection",
  cancelSnipFlow: "screenshot:cancel-snip-flow"
};
const electronAPI = {
  storeSelection(bounds) {
    return ipcRenderer.invoke(IPC_CHANNELS.storeSelection, bounds);
  },
  cancelSnipFlow() {
    return ipcRenderer.invoke(IPC_CHANNELS.cancelSnipFlow);
  }
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
