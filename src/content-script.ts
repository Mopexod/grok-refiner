// src/content-script.ts
import { detectPlatform } from './adapters/index';
import type { ChatPlatformAdapter, EditItem, StoredState } from './types';
import { loadState, saveState } from './storage';
import { buildChatText } from './buildChatText';

type PanelFromIframeMessage =
  | {
      source: 'grokRefiner_panel';
      type: 'requestState';
    }
  | {
      source: 'grokRefiner_panel';
      type: 'updateEdit';
      editId: string;
      changes: Partial<EditItem>;
    }
  | {
      source: 'grokRefiner_panel';
      type: 'deleteEdit';
      editId: string;
    }
  | {
      source: 'grokRefiner_panel';
      type: 'moveEdit';
      editId: string;
      direction: 'up' | 'down';
    }
  | {
      source: 'grokRefiner_panel';
      type: 'copySingle';
      editId: string;
    }
  | {
      source: 'grokRefiner_panel';
      type: 'setActiveEdit';
      editId: string | null;
    };

type ParentToPanelMessage = {
  source: 'grokRefiner_content';
  type: 'state';
  state: StoredState;
  activeEditId: string | null;
};

let adapter: ChatPlatformAdapter | null = null;
let activePlatform: 'grok' | 'claude' = 'grok';

let state: StoredState = {
  edits: [],
  presets: [],
  lastUsedPlatform: 'grok',
  collapsed: false,
};

let activeEditId: string | null = null;

function setupPanelIframe() {
  const wrapper = document.createElement('div');
  wrapper.id = 'grok-refiner-panel-wrapper';

  const handle = document.createElement('div');
  handle.id = 'grok-refiner-panel-handle';
  handle.textContent = 'GR';

  const iframe = document.createElement('iframe');
  iframe.id = 'grok-refiner-panel-iframe';
  iframe.src = chrome.runtime.getURL('panel.html');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

  wrapper.appendChild(handle);
  wrapper.appendChild(iframe);

  const style = document.createElement('style');
  style.textContent = `
    #grok-refiner-panel-wrapper {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      z-index: 2147483647;
      pointer-events: none;
      transition: transform 0.2s ease-out;
    }

    #grok-refiner-panel-wrapper.collapsed {
      transform: translateX(320px);
    }

    #grok-refiner-panel-handle {
      position: absolute;
      left: -32px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 80px;
      background: #1c2331;
      border: 1px solid #2b2f3a;
      border-right: none;
      border-radius: 6px 0 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #f5f5f5;
      cursor: pointer;
      pointer-events: auto;
      user-select: none;
      transition: background 0.15s ease;
    }

    #grok-refiner-panel-handle:hover {
      background: #242b3a;
    }

    #grok-refiner-panel-iframe {
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: auto;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(wrapper);

  handle.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(!isCollapsed());
  });

  applyLayout();

  iframe.addEventListener('load', () => {
    sendStateToPanel();
  });
}

function isCollapsed(): boolean {
  return state.collapsed ?? false;
}

function setCollapsed(val: boolean) {
  state.collapsed = val;
  saveState(state);
  applyLayout();
}

function applyLayout() {
  const wrapper = document.getElementById('grok-refiner-panel-wrapper');
  if (!wrapper) return;

  if (isCollapsed()) {
    wrapper.classList.add('collapsed');
  } else {
    wrapper.classList.remove('collapsed');
  }
}

function sendStateToPanel() {
  const iframe = document.getElementById(
    'grok-refiner-panel-iframe'
  ) as HTMLIFrameElement | null;
  if (!iframe || !iframe.contentWindow) return;

  const msg: ParentToPanelMessage = {
    source: 'grokRefiner_content',
    type: 'state',
    state,
    activeEditId,
  };

  try {
    iframe.contentWindow.postMessage(msg, '*');
  } catch (e) {
    console.warn('grokRefiner: postMessage to panel iframe failed', e);
  }
}

function rerenderPanel() {
  sendStateToPanel();
}

function createFloatingButton(): HTMLElement {
  const shadowHost = document.createElement('div');
  shadowHost.id = 'grok-refiner-floating-button-host';

  const shadow = shadowHost.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
    }
    .button-wrapper {
      position: absolute;
      z-index: 2147483646;
      pointer-events: auto;
    }
    .button {
      padding: 6px 10px;
      background: #1c2331;
      color: #f5f5f5;
      border: 1px solid #3b4250;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    .button:hover {
      background: #242b3a;
    }
  `;

  const wrapper = document.createElement('div');
  wrapper.className = 'button-wrapper';
  const btn = document.createElement('button');
  btn.className = 'button';
  btn.textContent = 'Add Edit';
  wrapper.appendChild(btn);

  shadow.appendChild(style);
  shadow.appendChild(wrapper);

  return shadowHost;
}

window.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as PanelFromIframeMessage | undefined;
  if (!data || typeof data !== 'object' || !('source' in data) || data.source !== 'grokRefiner_panel') return;

  switch (data.type) {
    case 'requestState':
      sendStateToPanel();
      break;

    case 'updateEdit': {
      const edit = state.edits.find((e) => e.id === data.editId);
      if (edit) {
        Object.assign(edit, data.changes);
        saveState(state);
        // Мы не вызываем rerenderPanel для updateEdit, чтобы сохранить фокус в iframe
      }
      break;
    }

    case 'deleteEdit':
      state.edits = state.edits.filter((e) => e.id !== data.editId);
      if (activeEditId === data.editId) {
        activeEditId = null;
      }
      saveState(state);
      rerenderPanel();
      break;

    case 'moveEdit': {
      const idx = state.edits.findIndex((e) => e.id === data.editId);
      if (idx !== -1) {
        const newIdx = data.direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx >= 0 && newIdx < state.edits.length) {
          const tmp = state.edits[idx];
          state.edits[idx] = state.edits[newIdx];
          state.edits[newIdx] = tmp;
          saveState(state);
          rerenderPanel();
        }
      }
      break;
    }

    case 'copySingle':
      handleCopySingle(data.editId);
      break;

    case 'setActiveEdit':
      activeEditId = data.editId;
      break;
  }
});

let floatingButtonHost: HTMLElement | null = null;
let currentSelection: { snippet: string; range: Range } | null = null;

function showFloatingButton(snippet: string, range: Range) {
  currentSelection = { snippet, range };

  if (!floatingButtonHost) {
    floatingButtonHost = createFloatingButton();
    document.body.appendChild(floatingButtonHost);

    const shadow = floatingButtonHost.shadowRoot!;
    const btn = shadow.querySelector('.button') as HTMLElement;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAddEdit();
    });
  }

  const rect = range.getBoundingClientRect();
  const wrapper = floatingButtonHost.shadowRoot!.querySelector(
    '.button-wrapper'
  ) as HTMLElement;

  wrapper.style.top = `${window.scrollY + rect.bottom + 8}px`;
  wrapper.style.left = `${window.scrollX + rect.left}px`;

  floatingButtonHost.style.display = 'block';
}

function hideFloatingButton() {
  if (floatingButtonHost) {
    floatingButtonHost.style.display = 'none';
  }
  currentSelection = null;
}

function handleAddEdit() {
  if (!currentSelection || !adapter) return;

  const snippet = currentSelection.snippet;

  const newEdit: EditItem = {
    id: Date.now().toString(),
    sourcePlatform: adapter.id as 'grok' | 'claude',
    snippet,
    comment: '',
    createdAt: Date.now(),
  };

  state.edits.push(newEdit);
  saveState(state);
  rerenderPanel();

  hideFloatingButton();

  window.getSelection()?.removeAllRanges();
}

function handleCopySingle(editId: string) {
  const edit = state.edits.find((e) => e.id === editId);
  if (!edit) return;

  const text = buildChatText([edit], activePlatform);
  if (!text) return;

  if (!adapter) return;

  const input = adapter.getInputElement();
  if (!input) return;

  if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
    const current = input.value ?? '';
    const combined = current ? `${current}\n\n\n${text}` : text;

    input.value = combined;

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    input.focus();
    return;
  }

  if (input.tagName.toLowerCase() === 'textbox') {
    input.focus();

    const currentText = input.textContent || '';
    const textToInsert = currentText.trim() ? `${currentText}\n\n\n${text}` : text;

    input.textContent = textToInsert;

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    return;
  }

  if (input.getAttribute('contenteditable') === 'true') {
    input.focus();

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    const textToInsert = input.textContent?.trim() ? `\n\n\n${text}` : text;

    try {
      const ok = document.execCommand('insertText', false, textToInsert);
      if (!ok) {
        input.textContent = (input.textContent || '') + textToInsert;
      }
    } catch (err) {
      console.warn('grokRefiner: execCommand insertText error', err);
      input.textContent = (input.textContent || '') + textToInsert;
    }

    return;
  }

  console.warn('grokRefiner: unknown input element type for chat insert');
}

function observeSelection() {
  document.addEventListener('mouseup', (e) => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        hideFloatingButton();
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();

      if (!text || text.length < 3) {
        hideFloatingButton();
        return;
      }

      if (!adapter) {
        hideFloatingButton();
        return;
      }

      showFloatingButton(text, range);
    }, 50);
  });

  document.addEventListener('mousedown', (e) => {
    if (!floatingButtonHost) return;

    const shadow = floatingButtonHost.shadowRoot;
    if (!shadow) return;

    const path = e.composedPath();
    const btn = shadow.querySelector('.button');
    
    if (btn && path.includes(btn)) {
      return;
    }

    hideFloatingButton();
  });
}

async function init() {
  try {
    adapter = detectPlatform(window.location, document);
    if (!adapter) return;

    activePlatform = adapter.id as 'grok' | 'claude';

    state = await loadState();

    setupPanelIframe();
    observeSelection();

    if (adapter.observeNewMessages) {
      adapter.observeNewMessages(() => {
      });
    }
  } catch (err) {
    console.error('grokRefiner: init error', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}