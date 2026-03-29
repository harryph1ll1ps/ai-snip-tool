import { ipcMain } from 'electron';
import { getActiveSession } from '../services/session-store';
import { IPC_CHANNELS } from '../types/ipc';

export function registerSessionIpc(): void {
	ipcMain.handle(IPC_CHANNELS.getActiveSession, () => {
		return getActiveSession();
	});
}
