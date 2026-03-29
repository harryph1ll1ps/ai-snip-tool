import { randomUUID } from 'node:crypto';
import type { CapturedScreenshot, SnipSession } from '../types/ipc';

let activeSession: SnipSession | null = null;

export function createSession(screenshot: CapturedScreenshot): SnipSession {
	const session: SnipSession = {
		id: randomUUID(),
		createdAt: new Date().toISOString(),
		screenshot
	};

	activeSession = session;

	return session;
}

export function getActiveSession(): SnipSession | null {
	return activeSession;
}

export function clearActiveSession(): void {
	activeSession = null;
}
