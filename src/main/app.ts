import { app } from 'electron';

let isAppStarted = false;

export async function startApp(): Promise<void> {
	if (isAppStarted) {
		return;
	}

	isAppStarted = true;

	// Quit on non-macOS platforms when the last window closes. On macOS the app stays resident.
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	await app.whenReady();
}
