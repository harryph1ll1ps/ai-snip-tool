<div class="overlay-shell">
	<div class="overlay-panel">
		<p class="eyebrow">Overlay</p>
		<h1>Snip selection surface</h1>
		<p>Global shortcut wiring is live. Drag-selection UI comes next.</p>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	.overlay-shell {
		display: grid;
		min-height: 100vh;
		place-items: center;
		background:
			linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55)),
			radial-gradient(circle at top, rgba(56, 189, 248, 0.25), transparent 40%);
		color: #f8fafc;
		font-family: 'SF Pro Display', 'Helvetica Neue', sans-serif;
	}

	.overlay-panel {
		width: min(420px, calc(100vw - 48px));
		padding: 24px;
		border: 1px solid rgba(226, 232, 240, 0.25);
		border-radius: 20px;
		background: rgba(15, 23, 42, 0.72);
		backdrop-filter: blur(16px);
		box-shadow: 0 24px 80px rgba(15, 23, 42, 0.35);
	}

	.eyebrow {
		margin: 0 0 8px;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #7dd3fc;
	}

	h1 {
		margin: 0 0 12px;
		font-size: 2rem;
		line-height: 1.05;
	}

	p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		color: rgba(226, 232, 240, 0.92);
	}
</style>
