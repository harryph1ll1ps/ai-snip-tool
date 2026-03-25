import { startApp } from './app';
import { registerIpcHandlers } from './ipc';
import { registerGlobalShortcuts } from './shortcuts';
import { createOverlayWindow } from './windows/overlay-window';

async function bootstrap(): Promise<void> {
	await startApp();
	
	registerIpcHandlers();

	registerGlobalShortcuts({
		startSnipFlow: createOverlayWindow
	});
}

void bootstrap();
