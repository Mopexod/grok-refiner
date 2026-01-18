// src/adapters/grokAdapter.ts
import type { ChatPlatformAdapter } from '../types';

export const GrokAdapter: ChatPlatformAdapter = {
  id: 'grok',

  isMatch(location, _document) {
    return (
      location.hostname === 'grok.com' ||
      location.hostname.endsWith('.grok.com') ||
      location.hostname === 'x.ai' ||
      location.hostname.endsWith('.x.ai') ||
      (location.hostname === 'x.com' && location.pathname.startsWith('/i/grok')) ||
      (location.hostname.endsWith('.x.com') && location.pathname.startsWith('/i/grok'))
    );
  },

  getMessageContainers(root) {
    const result: HTMLElement[] = [];

    const selector = '[data-role="ai-message"], .ai-message, .grok-message';
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      result.push(el);
    });

    return result;
  },

  getInputElement() {
    const el1 = document.querySelector<HTMLElement>('div.tiptap.ProseMirror[contenteditable="true"]');
    const el2 = document.querySelector<HTMLElement>('[contenteditable="true"]');
    const el3 = document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="Ask"]');

    return el1 || el2 || el3 || null;
  },

  observeNewMessages(callback) {
    const root = document.body;
    if (!root) return;

    const observer = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        mut.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          // Ищем контейнеры сообщений внутри добавленного узла
          const selector = '[data-role="ai-message"], .ai-message, .grok-message';
          const containers = node.querySelectorAll<HTMLElement>(selector);
          containers.forEach((c) => callback(c));
          
          // Также проверяем, не является ли сам узел контейнером
          if (node.matches(selector)) {
            callback(node);
          }
        });
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  },
};