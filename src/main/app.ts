import { BrowserWindow, app } from 'electron';

type StartAppOptions = {
	createInitialWindow?: () => unknown | Promise<unknown>;
};

let isAppStarted = false;

export async function startApp(options: StartAppOptions = {}): Promise<void> {
	if (isAppStarted) {
		return;
	}

	isAppStarted = true;

    const createInitialWindow = options.createInitialWindow;

    // windows/linix: quit app when windows are closed -- macOS: stays open
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {  // darwin == macOS
			app.quit();
		}
	});

    // when the app is reopened, open windows 
	app.on('activate', async () => {
		if (BrowserWindow.getAllWindows().length === 0) { // checks there are no open windows already
			await createInitialWindow?.();
		}
	});

    // on the first function run, let electron load, then create the first window
	await app.whenReady();
	await createInitialWindow?.();
}
