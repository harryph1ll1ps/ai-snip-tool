<script lang="ts">
	const messages = [
		{
			id: 'assistant-1',
			role: 'assistant',
			text: 'Drop a screenshot into the flow, then ask a question about what is on screen.'
		},
		{
			id: 'user-1',
			role: 'user',
			text: 'What should I focus on first?'
		},
		{
			id: 'assistant-2',
			role: 'assistant',
			text: 'I can summarize the screen, explain a bug, or turn visible content into a concrete next step.'
		}
	];
</script>

<svelte:head>
	<title>AI Snip Chat</title>
</svelte:head>

<div class="chat-shell">
	<section class="chat-card">
		<header class="chat-header">
			<div>
				<p class="eyebrow">Active Session</p>
				<h1>Screenshot chat</h1>
			</div>
			<button type="button" class="header-action">New snip</button>
		</header>

		<div class="preview-panel">
			<div class="preview-art">
				<div class="preview-grid"></div>
				<div class="preview-badge">Screenshot preview</div>
			</div>
			<div class="preview-copy">
				<p class="preview-label">Context image</p>
				<p class="preview-text">
					Captured content will appear here before the first prompt is sent.
				</p>
			</div>
		</div>

		<section class="messages-panel" aria-label="Conversation">
			{#each messages as message}
				<article class:assistant={message.role === 'assistant'} class:user={message.role === 'user'}>
					<p class="message-role">{message.role}</p>
					<p class="message-text">{message.text}</p>
				</article>
			{/each}
		</section>

		<form class="prompt-panel">
			<label class="sr-only" for="prompt">Ask about the screenshot</label>
			<textarea
				id="prompt"
				rows="3"
				placeholder="Ask anything about the captured screen..."
			></textarea>
			<div class="prompt-actions">
				<p class="prompt-hint">Enter to send, Shift+Enter for a new line</p>
				<button type="submit">Send</button>
			</div>
		</form>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at top, rgba(251, 191, 36, 0.24), transparent 30%),
			linear-gradient(180deg, #f5efe2 0%, #efe5d2 100%);
		color: #172033;
		font-family: 'Avenir Next', 'Helvetica Neue', sans-serif;
	}

	.chat-shell {
		min-height: 100vh;
		padding: 20px;
		box-sizing: border-box;
	}

	.chat-card {
		display: grid;
		grid-template-rows: auto auto 1fr auto;
		gap: 16px;
		min-height: calc(100vh - 40px);
		padding: 20px;
		border: 1px solid rgba(23, 32, 51, 0.08);
		border-radius: 28px;
		background: rgba(255, 251, 245, 0.88);
		box-shadow: 0 18px 50px rgba(73, 52, 18, 0.12);
		backdrop-filter: blur(18px);
	}

	.chat-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}

	.eyebrow,
	.preview-label,
	.message-role,
	.prompt-hint {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.eyebrow,
	.preview-label,
	.message-role {
		color: #a16207;
	}

	h1 {
		margin: 6px 0 0;
		font-size: 2rem;
		line-height: 1;
	}

	.header-action,
	button {
		border: 0;
		border-radius: 999px;
		background: #172033;
		color: #fff9ef;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.header-action {
		padding: 10px 14px;
	}

	.preview-panel {
		display: grid;
		grid-template-columns: 144px 1fr;
		gap: 16px;
		padding: 16px;
		border-radius: 22px;
		background: rgba(255, 248, 235, 0.9);
		border: 1px solid rgba(161, 98, 7, 0.12);
	}

	.preview-art {
		position: relative;
		min-height: 120px;
		border-radius: 18px;
		overflow: hidden;
		background:
			linear-gradient(135deg, rgba(23, 32, 51, 0.9), rgba(49, 46, 129, 0.78)),
			#172033;
	}

	.preview-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
		background-size: 18px 18px;
	}

	.preview-badge {
		position: absolute;
		left: 12px;
		bottom: 12px;
		padding: 6px 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		color: #fff9ef;
		font-size: 0.82rem;
	}

	.preview-copy {
		align-self: center;
	}

	.preview-text {
		margin: 8px 0 0;
		line-height: 1.5;
		color: rgba(23, 32, 51, 0.78);
	}

	.messages-panel {
		display: grid;
		align-content: start;
		gap: 12px;
		padding: 6px 2px;
		overflow: auto;
	}

	article {
		max-width: 85%;
		padding: 14px 16px;
		border-radius: 18px;
		background: #fff8eb;
		border: 1px solid rgba(161, 98, 7, 0.12);
	}

	article.user {
		margin-left: auto;
		background: #172033;
		border-color: transparent;
	}

	article.user .message-role,
	article.user .message-text {
		color: #fff9ef;
	}

	.message-text {
		margin: 6px 0 0;
		line-height: 1.5;
	}

	.prompt-panel {
		display: grid;
		gap: 12px;
		padding: 14px;
		border-radius: 22px;
		background: rgba(255, 248, 235, 0.92);
		border: 1px solid rgba(23, 32, 51, 0.08);
	}

	textarea {
		width: 100%;
		border: 0;
		resize: none;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 1rem;
		line-height: 1.5;
		outline: none;
	}

	.prompt-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.prompt-hint {
		color: rgba(23, 32, 51, 0.54);
	}

	button[type='submit'] {
		padding: 10px 16px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	@media (max-width: 640px) {
		.chat-shell {
			padding: 12px;
		}

		.chat-card {
			min-height: calc(100vh - 24px);
			padding: 16px;
			border-radius: 22px;
		}

		.preview-panel {
			grid-template-columns: 1fr;
		}

		.prompt-actions,
		.chat-header {
			flex-direction: column;
			align-items: stretch;
		}

		article {
			max-width: 100%;
		}
	}
</style>
