// src/panel-main.ts
import type { StoredState, EditItem } from './types';
import { createPanel, PanelCallbacks } from './ui/panel';

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

let currentState: StoredState = {
  edits: [],
  presets: [],
  lastUsedPlatform: 'grok',
  collapsed: false,
};
let activeEditId: string | null = null;

let panelHostEl: HTMLElement | null = null;

const callbacks: PanelCallbacks = {
  getState: () => currentState,
  getActiveEditId: () => activeEditId,
  setActiveEditId: (id) => {
    activeEditId = id;
    sendToParent({
      source: 'grokRefiner_panel',
      type: 'setActiveEdit',
      editId: id,
    });
    rerenderPanel();
  },

  updateEdit: (editId, changes) => {
    // Обновление комментария: только сообщаем родителю,
    // он сохранит в storage, но не будет пересобирать панель на каждый символ.
    sendToParent({
      source: 'grokRefiner_panel',
      type: 'updateEdit',
      editId,
      changes,
    });
  },

  deleteEdit: (editId) => {
    sendToParent({
      source: 'grokRefiner_panel',
      type: 'deleteEdit',
      editId,
    });
  },

  moveEdit: (editId, direction) => {
    sendToParent({
      source: 'grokRefiner_panel',
      type: 'moveEdit',
      editId,
      direction,
    });
  },

  handleCopySingle: (editId) => {
    sendToParent({
      source: 'grokRefiner_panel',
      type: 'copySingle',
      editId,
    });
  },
};

function sendToParent(msg: PanelFromIframeMessage) {
  window.parent.postMessage(msg, '*');
}

function rerenderPanel() {
  if (!panelHostEl || !panelHostEl.parentElement) {
    const panel = createPanel(callbacks);
    panelHostEl = panel;
    document.body.appendChild(panelHostEl);
    return;
  }

  const parent = panelHostEl.parentElement;
  parent.removeChild(panelHostEl);

  const newPanel = createPanel(callbacks);
  panelHostEl = newPanel;
  parent.appendChild(panelHostEl);
}

window.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as ParentToPanelMessage | undefined;
  if (!data || data.source !== 'grokRefiner_content') return;

  if (data.type === 'state') {
    currentState = data.state;
    activeEditId = data.activeEditId;
    rerenderPanel();
  }
});

// При инициализации просим состояние у родителя
sendToParent({ source: 'grokRefiner_panel', type: 'requestState' });
