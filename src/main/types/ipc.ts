// Shared payload for the region selected in the overlay UI.
export type SelectionBounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

// The capture flow returns lightweight metadata so renderers do not receive image buffers over IPC.
export type CapturedScreenshot = {
	path: string;
	previewDataUrl: string;
	selectionBounds: SelectionBounds;
	scaledWidth: number;
	scaledHeight: number;
	scaleFactor: number;
};

export type SnipSession = {
	id: string;
	createdAt: string;
	screenshot: CapturedScreenshot;
};

// Centralize channel names so preload, main, and renderer stay in sync.
export const IPC_CHANNELS = {
	storeSelection: 'screenshot:store-selection',
	cancelSnipFlow: 'screenshot:cancel-snip-flow',
	getActiveSession: 'session:get-active'
} as const;

// The preload layer will expose this shape to the renderer as window.electronAPI.
export type ElectronAPI = {
	storeSelection: (bounds: SelectionBounds) => Promise<CapturedScreenshot>;
	cancelSnipFlow: () => Promise<void>;
	getActiveSession: () => Promise<SnipSession | null>;
};
