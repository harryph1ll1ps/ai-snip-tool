import { startApp } from './app';
import { registerGlobalShortcuts } from './shortcuts';
import { createOverlayWindow } from './windows/overlay-window';

async function bootstrap(): Promise<void> {
	await startApp();

	registerGlobalShortcuts({
		startSnipFlow: createOverlayWindow
	});
}

void bootstrap();
