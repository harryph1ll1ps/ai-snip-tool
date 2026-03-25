import { desktopCapturer, screen } from 'electron';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { SelectionBounds } from '../types/ipc';

export type CapturedScreenshot = {
	path: string;
	selectionBounds: SelectionBounds;
	width: number;
	height: number;
	scaleFactor: number;
};

// MVP assumption: the overlay selection is taken from the primary display only.
export async function captureSelection(bounds: SelectionBounds): Promise<CapturedScreenshot> {
	const display = screen.getPrimaryDisplay();
	const scaleFactor = display.scaleFactor;
	const source = await getPrimaryDisplaySource();

	// The renderer gives us selection bounds in CSS pixels. Desktop capture thumbnails use
	// device pixels, so we scale the selection up before cropping.
	const cropBounds = {
		x: Math.round(bounds.x * scaleFactor),
		y: Math.round(bounds.y * scaleFactor),
		width: Math.round(bounds.width * scaleFactor),
		height: Math.round(bounds.height * scaleFactor)
	};

	if (cropBounds.width <= 0 || cropBounds.height <= 0) {
		throw new Error('Selection must have a positive size before it can be captured.');
	}

	const screenshot = source.thumbnail.crop(cropBounds);
	
	// Saving to a temp file keeps the renderer IPC payload small and makes later preview/upload easy.
	const outputPath = join(tmpdir(), `ai-snip-${randomUUID()}.png`);

	await writeFile(outputPath, screenshot.toPNG());

	return {
		path: outputPath,
		selectionBounds: bounds,
		width: screenshot.getSize().width,
		height: screenshot.getSize().height,
		scaleFactor
	};
}

async function getPrimaryDisplaySource() {
	const display = screen.getPrimaryDisplay();
	// Ask Electron for a full-resolution thumbnail so the cropped result matches the selected area.
	const thumbnailSize = {
		width: Math.round(display.size.width * display.scaleFactor),
		height: Math.round(display.size.height * display.scaleFactor)
	};

	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize
	});

	const primarySource = sources.find((source) => source.display_id === String(display.id));

	if (!primarySource) {
		throw new Error('Could not find a desktop capture source for the primary display.');
	}

	return primarySource;
}
