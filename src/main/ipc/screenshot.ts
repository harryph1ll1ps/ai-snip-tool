import { BrowserWindow, ipcMain } from 'electron';

import { captureSelection } from '../services/capture-service';
import { IPC_CHANNELS, type SelectionBounds } from '../types/ipc';
import { createChatWindow } from '../windows/chat-window';

function closeSenderWindow(senderWindow: BrowserWindow | null): void {
	senderWindow?.close();
}

export function registerScreenshotIpc(): void {
	ipcMain.handle(IPC_CHANNELS.storeSelection, async (event, bounds: SelectionBounds) => {
		const capturedScreenshot = await captureSelection(bounds);
		const chatWindow = await createChatWindow();

		chatWindow.setPosition(96, 96);

		closeSenderWindow(BrowserWindow.fromWebContents(event.sender));

		return capturedScreenshot;
	});

	ipcMain.handle(IPC_CHANNELS.cancelSnipFlow, (event) => {
		console.info('Overlay selection cancelled');

		closeSenderWindow(BrowserWindow.fromWebContents(event.sender));
	});
}
