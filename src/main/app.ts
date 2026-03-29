import { app } from 'electron';

let isAppStarted = false;

export async function startApp(): Promise<void> {
	if (isAppStarted) {
		return;
	}

	isAppStarted = true;

	// windows/linix: quit app when windows are closed -- macOS: stays open
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {  // darwin == macOS
			app.quit();
		}
	});

	await app.whenReady();
}
