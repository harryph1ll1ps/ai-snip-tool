import type { ElectronAPI, SelectionBounds } from '../../../main/types/ipc';

function getElectronAPI(): ElectronAPI {
	if (!window.electronAPI) {
		throw new Error('Electron API is not available in this renderer context.');
	}

	return window.electronAPI;
}

export function completeSelection(bounds: SelectionBounds): Promise<void> {
	return getElectronAPI().completeSelection(bounds);
}

export function cancelSnipFlow(): Promise<void> {
	return getElectronAPI().cancelSnipFlow();
}
