import { BrowserWindow, ipcMain } from 'electron';

import { IPC_CHANNELS, type SelectionBounds } from '../types/ipc';

function closeSenderWindow(senderWindow: BrowserWindow | null): void {
	senderWindow?.close();
}

export function registerScreenshotIpc(): void {
	ipcMain.handle(IPC_CHANNELS.storeSelection, (event, bounds: SelectionBounds) => {
		console.info('Overlay selection received:', bounds);

		closeSenderWindow(BrowserWindow.fromWebContents(event.sender));
	});

	ipcMain.handle(IPC_CHANNELS.cancelSnipFlow, (event) => {
		console.info('Overlay selection cancelled');

		closeSenderWindow(BrowserWindow.fromWebContents(event.sender));
	});
}
