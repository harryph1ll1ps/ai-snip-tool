import { startApp } from './app';
import { createChatWindow } from './windows/chat-window';

// call startapp for its side effects
void startApp({
	createInitialWindow: createChatWindow
});
