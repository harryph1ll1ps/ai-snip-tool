import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS, type ElectronAPI, type SelectionBounds } from '../main/types/ipc';

// preload is the only place the renderer should touch Electron IPC directly.
const electronAPI: ElectronAPI = {
	storeSelection(bounds: SelectionBounds) {
		return ipcRenderer.invoke(IPC_CHANNELS.storeSelection, bounds);
	},
	cancelSnipFlow() {
		return ipcRenderer.invoke(IPC_CHANNELS.cancelSnipFlow);
	},
	getActiveSession() {
		return ipcRenderer.invoke(IPC_CHANNELS.getActiveSession);
	}
};

// make the API available to be called in the UI/rendering
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
