import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';

const CHAT_ROUTE = '/chat';

// create the chat box window
export async function createChatWindow(): Promise<BrowserWindow> {

    // create new electron window and store it
	const chatWindow = new BrowserWindow({
		width: 420,
		height: 640,
		minWidth: 360,
		minHeight: 480,
		show: false, // hide window initally
		title: 'AI Chat',
		webPreferences: { 
            // before loading the UI, run the preload script
			preload: fileURLToPath(new URL('../../preload/index.js', import.meta.url))
		}
	});

    // show window once ready
	chatWindow.once('ready-to-show', () => {
		chatWindow.show();
	});


    // if the renderer URL exists, its in dev mode, otherwise its in production mode
	const rendererUrl = process.env.ELECTRON_RENDERER_URL;
    
	if (rendererUrl) {
        // load the front end dev server (e.g. local host)
		await chatWindow.loadURL(`${rendererUrl}${CHAT_ROUTE}`);
	} else {
        // load the front end from compiled file
		await chatWindow.loadFile(
			fileURLToPath(new URL(`../../renderer${CHAT_ROUTE}/index.html`, import.meta.url))
		);
	}

	return chatWindow;
}
