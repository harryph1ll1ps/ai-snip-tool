import { app, globalShortcut } from 'electron';

type RegisterGlobalShortcutsOptions = {
	startSnipFlow: () => unknown | Promise<unknown>;
};

const START_SNIP_ACCELERATOR = 'CommandOrControl+Shift+A';

export function registerGlobalShortcuts(
	options: RegisterGlobalShortcutsOptions
): void {
	const startSnipFlow = options.startSnipFlow;

	// clear shortcuts when the app is about to quit
	app.on('will-quit', () => {
		globalShortcut.unregisterAll();
	});

	// register the command to call startSnipFlow
	globalShortcut.register(START_SNIP_ACCELERATOR, () => {
		void startSnipFlow();
	});
}
