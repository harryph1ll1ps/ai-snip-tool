// Shared payload for the region selected in the overlay UI.
export type SelectionBounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

// Centralize channel names so preload, main, and renderer stay in sync.
export const IPC_CHANNELS = {
	completeSelection: 'screenshot:complete-selection',
	cancelSnipFlow: 'screenshot:cancel-snip-flow'
} as const;

// The preload layer will expose this shape to the renderer as window.electronAPI.
export type ElectronAPI = {
	completeSelection: (bounds: SelectionBounds) => Promise<void>;
	cancelSnipFlow: () => Promise<void>;
};
