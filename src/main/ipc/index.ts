import { registerSessionIpc } from './session';
import { registerScreenshotIpc } from './screenshot';

export function registerIpcHandlers(): void {
	registerScreenshotIpc();
	registerSessionIpc();
}
