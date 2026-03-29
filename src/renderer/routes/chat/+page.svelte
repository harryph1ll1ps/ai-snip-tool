<script lang="ts">
	type Message = {
		id: string;
		role: 'assistant' | 'user';
		text: string;
	};

	const messages: Message[] = [
		{
			id: 'user-1',
			role: 'user',
			text: 'What do I say next?'
		},
		{
			id: 'assistant-1',
			role: 'assistant',
			text: "Acknowledge the concern clearly, then answer with one concrete point about setup speed and how lightweight the integration is."
		}
	];
</script>

<svelte:head>
	<title>AI Snip Chat</title>
</svelte:head>

<div class="chat-stage">
	<section class="glass-shell" aria-label="Screenshot assistant">
		<section class="messages-panel" aria-label="Conversation">
			{#each messages as message}
				<article class:assistant={message.role === 'assistant'} class:user={message.role === 'user'}>
					<p class="message-text">{message.text}</p>
				</article>
			{/each}
		</section>

		<form class="assist-bar">
			<label class="sr-only" for="prompt">Ask about the screenshot</label>
			<textarea
				id="prompt"
				rows="1"
				placeholder="Ask for help with what’s on screen..."
			></textarea>
			<button type="submit">Ask</button>
		</form>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		min-height: 100vh;
		font-family: 'SF Pro Display', 'Helvetica Neue', sans-serif;
		color: #111111;
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.82), transparent 24%),
			linear-gradient(180deg, rgba(245, 245, 245, 0.94), rgba(235, 235, 235, 0.88));
	}

	.chat-stage {
		min-height: 100vh;
		padding: 18px;
		box-sizing: border-box;
		display: flex;
		align-items: stretch;
	}

	.glass-shell {
		position: relative;
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		gap: 18px;
		width: 100%;
		min-height: 100%;
		padding: 18px;
		border-radius: 28px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(245, 245, 245, 0.72)),
			radial-gradient(circle at top, rgba(255, 255, 255, 0.34), transparent 34%);
		border: 1px solid rgba(255, 255, 255, 0.72);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.72),
			0 20px 60px rgba(15, 23, 42, 0.12);
		backdrop-filter: blur(28px) saturate(135%);
		-webkit-backdrop-filter: blur(28px) saturate(135%);
		overflow: hidden;
	}

	.glass-shell::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.28), transparent 24%),
			radial-gradient(circle at 72% 28%, rgba(255, 255, 255, 0.16), transparent 22%);
		pointer-events: none;
	}

	.messages-panel {
		position: relative;
		z-index: 1;
		display: grid;
		align-content: start;
		gap: 14px;
		padding: 4px;
		overflow: auto;
	}

	article {
		max-width: 88%;
	}

	article.user {
		margin-left: auto;
	}

	.message-text {
		margin: 0;
		padding: 18px 22px;
		border-radius: 22px;
		font-size: clamp(1rem, 1rem + 0.45vw, 1.28rem);
		line-height: 1.34;
		letter-spacing: -0.01em;
	}

	article.assistant .message-text {
		background: transparent;
		color: rgba(17, 17, 17, 0.94);
		text-wrap: balance;
	}

	article.user .message-text {
		padding: 14px 22px;
		border: 1px solid rgba(17, 17, 17, 0.14);
		background: linear-gradient(180deg, rgba(24, 24, 27, 0.96), rgba(10, 10, 10, 0.96));
		color: #fafafa;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.12),
			0 12px 28px rgba(0, 0, 0, 0.14);
	}

	.assist-bar {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.42);
		border: 1px solid rgba(255, 255, 255, 0.62);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.44);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
	}

	textarea {
		width: 100%;
		min-height: 30px;
		max-height: 132px;
		padding: 6px 4px;
		border: 0;
		resize: none;
		background: transparent;
		color: rgba(17, 17, 17, 0.98);
		font: inherit;
		font-size: 1rem;
		line-height: 1.45;
		outline: none;
	}

	textarea::placeholder {
		color: rgba(17, 17, 17, 0.42);
	}

	button {
		padding: 11px 18px;
		border: 1px solid rgba(17, 17, 17, 0.18);
		border-radius: 999px;
		background: linear-gradient(180deg, rgba(24, 24, 27, 0.96), rgba(10, 10, 10, 0.96));
		color: #fafafa;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.12),
			0 12px 24px rgba(0, 0, 0, 0.12);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 560px) {
		.chat-stage {
			padding: 12px;
		}

		.glass-shell {
			padding: 14px;
			border-radius: 24px;
			gap: 14px;
		}

		.message-text {
			padding: 14px 16px;
			font-size: 1rem;
		}

		article.user .message-text {
			padding: 12px 16px;
		}

		.assist-bar {
			grid-template-columns: 1fr;
			align-items: stretch;
		}

		button {
			justify-self: end;
		}
	}
</style>
