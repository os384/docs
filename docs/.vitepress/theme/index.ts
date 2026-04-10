import DefaultTheme from 'vitepress/theme';
import AiPromptBox from './AiPromptBox.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AiPromptBox', AiPromptBox);
  },
};
