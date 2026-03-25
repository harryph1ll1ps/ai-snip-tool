import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';

const OVERLAY_ROUTE = '/overlay';

// create the fullscreen transparent window for the snip tool
export async function createOverlayWindow(): Promise<BrowserWindow> {
	const overlayWindow = new BrowserWindow({
		fullscreen: true,
		show: false,
		frame: false,
		transparent: true,
		resizable: false,
		movable: false,
		hasShadow: false,
		skipTaskbar: true,
		alwaysOnTop: true,
		title: 'AI Snip Overlay',
		webPreferences: {
			preload: fileURLToPath(new URL('../../preload/index.js', import.meta.url))
		}
	});

	// show overlay window once ready
	overlayWindow.once('ready-to-show', () => {
		overlayWindow.show();
	});

	// load the frontend
	const rendererUrl = process.env.ELECTRON_RENDERER_URL;
	if (rendererUrl) {
		await overlayWindow.loadURL(`${rendererUrl}${OVERLAY_ROUTE}`);
	} else {
		await overlayWindow.loadFile(
			fileURLToPath(new URL(`../../renderer${OVERLAY_ROUTE}/index.html`, import.meta.url))
		);
	}

	return overlayWindow;
}