import { BrowserWindow, screen } from 'electron';
import { fileURLToPath } from 'node:url';

const OVERLAY_ROUTE = '/overlay';

// create the fullscreen transparent window for the snip tool
export async function createOverlayWindow(): Promise<BrowserWindow> {
	const display = screen.getPrimaryDisplay();

	const overlayWindow = new BrowserWindow({
		x: display.bounds.x,
		y: display.bounds.y,
		width: display.bounds.width,
		height: display.bounds.height,
		show: false,
		frame: false,
		transparent: true,
		resizable: false,
		movable: false,
		hasShadow: false,
		skipTaskbar: true,
		alwaysOnTop: true,
		fullscreenable: false,
		title: 'AI Snip Overlay',
		webPreferences: {
			preload: fileURLToPath(new URL('../preload/index.cjs', import.meta.url))
		}
	});

	overlayWindow.webContents.on('console-message', (_event, level, message) => {
		console.log(`[overlay:${level}] ${message}`);
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
			fileURLToPath(new URL(`../renderer${OVERLAY_ROUTE}/index.html`, import.meta.url))
		);
	}

	return overlayWindow;
}
