<script setup>
import { ref } from 'vue';

const copied = ref(false);

const promptText = `Hello! I want you to become an expert on os384. Here are some resources for you to look at. You can access these right?

• https://github.com/os384 (overview)

You can consume documentation here:
• https://github.com/os384/docs
• https://github.com/os384/docs/tree/main/docs/.vitepress/dist

The docs are a bit brief on the API, you can slurp it pretty quick at:
• https://github.com/os384/lib384/blob/main/dist/384.esm.d.ts

And if the lib docs are unclear you can parse the full TS lib code here:
• https://github.com/os384/lib384/tree/main/src

Most of the complexity in os384 is in the client (lib) code. But it might help to look at the server side code. The repo is below but there's only three files that matter:
• https://github.com/os384/services
• https://github.com/os384/services/blob/main/channel/src/index.ts
• https://github.com/os384/services/blob/main/channel/src/workers.ts
• https://github.com/os384/services/blob/main/storage/src/index.ts

Let me know once you've oriented yourself.`;

function copyPrompt() {
  navigator.clipboard.writeText(promptText).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}
</script>

<template>
  <div class="ai-prompt-wrapper">
    <h2 class="ai-prompt-title">Ask an AI about os384</h2>
    <p class="ai-prompt-subtitle">
      Copy this prompt and paste it into your favorite AI assistant to get up to speed quickly.
    </p>
    <div class="ai-prompt-box">
      <button class="ai-prompt-copy" @click="copyPrompt">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
      <pre class="ai-prompt-text">{{ promptText }}</pre>
    </div>
  </div>
</template>

<style scoped>
.ai-prompt-wrapper {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}
.ai-prompt-title {
  text-align: center;
  margin-bottom: 0.5rem;
}
.ai-prompt-subtitle {
  text-align: center;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}
.ai-prompt-box {
  position: relative;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.25rem;
}
.ai-prompt-copy {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-base);
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.ai-prompt-copy:hover {
  opacity: 0.9;
}
.ai-prompt-text {
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: var(--vp-c-text-1);
}
</style>
