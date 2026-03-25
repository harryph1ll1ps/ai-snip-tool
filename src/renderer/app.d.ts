import type { ElectronAPI } from '../main/types/ipc';

declare global {
	interface Window {
		electronAPI?: ElectronAPI;
	}
}

export {};
