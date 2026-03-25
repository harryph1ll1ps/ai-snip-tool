import { BrowserWindow, ipcMain } from 'electron';

import { captureSelection } from '../services/capture-service';
import { IPC_CHANNELS, type SelectionBounds } from '../types/ipc';
import { createChatWindow } from '../windows/chat-window';

function closeSenderWindow(senderWindow: BrowserWindow | null): void {
	senderWindow?.close();
}

export function registerScreenshotIpc(): void {
	ipcMain.handle(IPC_CHANNELS.storeSelection, async (event, bounds: SelectionBounds) => {
		try {
			const capturedScreenshot = await captureSelection(bounds);
			const overlayWindow = BrowserWindow.fromWebContents(event.sender);

			closeSenderWindow(overlayWindow);

			await createChatWindow({
				x: 96,
				y: 96
			});

			return capturedScreenshot;
		} catch (error) {
			console.error('Failed to store selection:', error);
			throw error;
		}
	});

	ipcMain.handle(IPC_CHANNELS.cancelSnipFlow, (event) => {
		console.info('Overlay selection cancelled');

		closeSenderWindow(BrowserWindow.fromWebContents(event.sender));
	});
}
