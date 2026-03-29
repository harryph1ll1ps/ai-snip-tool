<script lang="ts">
	import { cancelSnipFlow, storeSelection } from '$lib/api/electron';
	import type { SelectionBounds } from '../../../main/types/ipc';

	type SelectionState = SelectionBounds & {
		active: boolean;
	};

	const MIN_SELECTION_SIZE = 8;
	const EMPTY_SELECTION: SelectionState = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		active: false
	};

	let selection: SelectionState = { ...EMPTY_SELECTION };
	let dragStart: { x: number; y: number } | null = null;
	// The host element gives us the overlay's viewport-relative bounds.
	let hostElement: HTMLDivElement | null = null;
	// Keep the last completed drag visible after the pointer is released.
	let lastSelection: SelectionBounds | null = null;

	// Start a fresh drag selection from the current pointer position.
	function beginSelection(event: PointerEvent): void {
		if (event.button !== 0 || !hostElement) {
			return;
		}

		// Convert the pointer from page coordinates into coordinates local to the overlay.
		const bounds = hostElement.getBoundingClientRect();
		const startX = clamp(event.clientX - bounds.left, 0, bounds.width);
		const startY = clamp(event.clientY - bounds.top, 0, bounds.height);

		dragStart = { x: startX, y: startY };
		selection = {
			x: startX,
			y: startY,
			width: 0,
			height: 0,
			active: true
		};
		lastSelection = null;

		// Keep pointer events flowing to the overlay even if the cursor moves across other elements.
		hostElement.setPointerCapture(event.pointerId);
	}

	// Reset the in-progress selection while keeping any final selection separate.
	function clearSelection(): void {
		dragStart = null;
		selection = { ...EMPTY_SELECTION };
	}

	// Recompute the live rectangle as the pointer moves.
	function updateSelection(event: PointerEvent): void {
		if (!dragStart || !hostElement) {
			return;
		}

		// Clamp keeps the drag rectangle inside the visible overlay bounds.
		const bounds = hostElement.getBoundingClientRect();
		const currentX = clamp(event.clientX - bounds.left, 0, bounds.width);
		const currentY = clamp(event.clientY - bounds.top, 0, bounds.height);
		const nextSelection = getSelectionBounds(dragStart, { x: currentX, y: currentY });

		selection = {
			...nextSelection,
			active: true
		};
	}

	// Finalize the drag and keep it only if it is large enough to be meaningful.
	async function finishSelection(event: PointerEvent): Promise<void> {
		if (!dragStart || !hostElement) {
			return;
		}

		if (hostElement.hasPointerCapture(event.pointerId)) {
			hostElement.releasePointerCapture(event.pointerId);
		}

		// Ignore tiny clicks so a selection represents an intentional drag.
		const isValidSelection =
			selection.width >= MIN_SELECTION_SIZE && selection.height >= MIN_SELECTION_SIZE;

		lastSelection = isValidSelection
			? {
					x: selection.x,
					y: selection.y,
					width: selection.width,
					height: selection.height
				}
			: null;
		clearSelection();

		if (lastSelection) {
			await storeSelection(lastSelection);
		}
	}

	async function handleEscape(event: KeyboardEvent): Promise<void> {
		if (event.key === 'Escape') {
			clearSelection();
			lastSelection = null;
			await cancelSnipFlow();
		}
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	function getSelectionBounds(
		start: { x: number; y: number },
		current: { x: number; y: number }
	): SelectionBounds {
		// This lets the user drag in any direction while still producing a top-left anchored box.
		const x = Math.min(start.x, current.x);
		const y = Math.min(start.y, current.y);
		const width = Math.abs(current.x - start.x);
		const height = Math.abs(current.y - start.y);

		return { x, y, width, height };
	}

	// The template renders either the active drag rectangle or the most recent completed one.
	$: visibleSelection = selection.active ? selection : lastSelection;
	$: selectionLabel = lastSelection
		? `${Math.round(lastSelection.width)} x ${Math.round(lastSelection.height)} px`
		: selection.active
			? `${Math.round(selection.width)} x ${Math.round(selection.height)} px`
			: 'Click and drag to select an area';

	$: instructionLabel = lastSelection
		? 'Selection sent to the main process.'
		: 'Press Escape to clear the current selection.';
</script>

<svelte:window on:keydown={handleEscape} />

<div
	bind:this={hostElement}
	class="overlay-surface"
	role="application"
	aria-label="Screen snipping overlay"
	on:pointerdown={beginSelection}
	on:pointermove={updateSelection}
	on:pointerup={finishSelection}
	on:pointercancel={clearSelection}
>
	<div class="overlay-backdrop"></div>

	{#if visibleSelection}
		<!-- Keep the active drag visually distinct from the last completed selection. -->
		<!-- Inline positioning ties the rectangle directly to the current selection state. -->
		<div
			class:active={selection.active}
			class="selection-frame"
			style={`left:${visibleSelection.x}px;top:${visibleSelection.y}px;width:${visibleSelection.width}px;height:${visibleSelection.height}px;`}
		>
			<div class="selection-size">{selectionLabel}</div>
		</div>
	{/if}

	<div class="overlay-hud">
		<p class="eyebrow">Snip Mode</p>
		<h1>Select the part of the screen you want to ask about.</h1>
		<p>{instructionLabel}</p>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		user-select: none;
		cursor: crosshair;
	}

	.overlay-surface {
		position: relative;
		width: 100vw;
		height: 100vh;
		cursor: crosshair;
		font-family: 'SF Pro Display', 'Helvetica Neue', sans-serif;
		color: #f8fafc;
	}

	.overlay-surface,
	.overlay-surface * {
		cursor: crosshair;
	}

	.overlay-backdrop {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.64)),
			radial-gradient(circle at top, rgba(56, 189, 248, 0.22), transparent 34%);
	}

	.selection-frame {
		position: absolute;
		box-sizing: border-box;
		border: 2px solid rgba(125, 211, 252, 0.95);
		border-radius: 18px;
		background: rgba(56, 189, 248, 0.12);
		box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.58);
		backdrop-filter: brightness(1.08);
	}

	.selection-frame.active {
		border-color: #f8fafc;
	}

	.selection-size {
		position: absolute;
		top: -44px;
		left: 0;
		padding: 8px 12px;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.92);
		border: 1px solid rgba(226, 232, 240, 0.18);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	.overlay-hud {
		position: absolute;
		left: 24px;
		bottom: 24px;
		width: min(460px, calc(100vw - 48px));
		padding: 20px 22px;
		border-radius: 22px;
		border: 1px solid rgba(226, 232, 240, 0.24);
		background: rgba(15, 23, 42, 0.78);
		backdrop-filter: blur(18px);
		box-shadow: 0 24px 80px rgba(15, 23, 42, 0.32);
		pointer-events: none;
	}

	.eyebrow {
		margin: 0 0 10px;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #7dd3fc;
	}

	h1 {
		margin: 0 0 10px;
		font-size: clamp(1.8rem, 3.2vw, 2.6rem);
		line-height: 1.02;
	}

	p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		color: rgba(226, 232, 240, 0.88);
	}

	@media (max-width: 640px) {
		.overlay-hud {
			left: 12px;
			right: 12px;
			bottom: 12px;
			width: auto;
			padding: 16px;
		}

		.selection-frame {
			border-radius: 14px;
		}

		.selection-size {
			top: auto;
			bottom: calc(100% + 8px);
			max-width: 100%;
		}
	}
</style>
