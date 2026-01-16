// src/ui/panel.ts
import type {
  StoredState,
  EditItem,
} from '../types';

export interface PanelCallbacks {
  getState(): StoredState;
  getActiveEditId(): string | null;
  setActiveEditId(id: string | null): void;

  updateEdit(editId: string, changes: Partial<EditItem>): void;
  deleteEdit(editId: string): void;
  moveEdit(editId: string, direction: 'up' | 'down'): void;

  handleCopySingle(editId: string): void;
}

export function createPanel(callbacks: PanelCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.id = 'sheet-editor-panel';

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      box-sizing: border-box;
      background: #111820;
      color: #f5f5f5;
      border-left: 1px solid #2b2f3a;
      display: flex;
      flex-direction: column;
      z-index: 999999;
      font-size: 13px;
    }

    .panel-header {
      padding: 8px 10px;
      border-bottom: 1px solid #2b2f3a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .panel-title {
      font-weight: 600;
      font-size: 13px;
    }

    button {
      font-size: 12px;
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid #3b4250;
      background: #1c2331;
      color: #f5f5f5;
      cursor: pointer;
    }

    button:hover {
      background: #242b3a;
    }

    button:disabled {
      opacity: 0.5;
      cursor: default;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 6px 8px 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .edit-item {
      border-radius: 4px;
      border: 1px solid #2b2f3a;
      padding: 6px;
      background: #151b26;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .edit-item.active {
      border-color: #4f9cff;
      box-shadow: 0 0 0 1px rgba(79, 156, 255, 0.4);
    }

    .edit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }

    .edit-index {
      font-weight: 600;
      font-size: 12px;
    }

    .edit-actions {
      display: flex;
      gap: 4px;
    }

    .edit-snippet {
      font-size: 12px;
      color: #d1d5db;
      max-height: 3.2em;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edit-snippet code {
      font-family: inherit;
      background: #111827;
      padding: 1px 3px;
      border-radius: 3px;
    }

    textarea.edit-comment {
      width: 100%;
      box-sizing: border-box;
      border-radius: 3px;
      border: 1px solid #374151;
      background: #0f172a;
      color: #e5e7eb;
      font-size: 12px;
      padding: 4px;
      resize: vertical;
      min-height: 40px;
      max-height: 120px;
      outline: none;
    }

    textarea.edit-comment:focus {
      border-color: #4f9cff;
      box-shadow: 0 0 0 1px rgba(79, 156, 255, 0.4);
    }

    .footer {
      padding: 6px 8px;
      border-top: 1px solid #2b2f3a;
      font-size: 11px;
      color: #9ca3af;
    }

    .empty-state {
      font-size: 12px;
      color: #9ca3af;
    }
  `;
  shadow.appendChild(style);

  const root = document.createElement('div');
  root.className = 'panel';
  shadow.appendChild(root);

  let currentCommentTextarea: HTMLTextAreaElement | null = null;

  function render() {
    const state = callbacks.getState();
    const activeId = callbacks.getActiveEditId();
    const edits = state.edits;

    root.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-header';

    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'Grok Refiner';

    header.appendChild(title);
    root.appendChild(header);

    const content = document.createElement('div');
    content.className = 'content';

    if (edits.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No edits yet. Select text and click "Add Edit".';
      content.appendChild(empty);
    } else {
      edits.forEach((edit, index) => {
        const item = document.createElement('div');
        item.className = 'edit-item';
        if (edit.id === activeId) {
          item.classList.add('active');
        }

        item.addEventListener('click', () => {
          callbacks.setActiveEditId(edit.id);
          render();
        });

        const headerRow = document.createElement('div');
        headerRow.className = 'edit-header';

        const idxEl = document.createElement('div');
        idxEl.className = 'edit-index';
        idxEl.textContent = String(index + 1);

        const actions = document.createElement('div');
        actions.className = 'edit-actions';

        const toChatBtn = document.createElement('button');
        toChatBtn.textContent = 'To Chat';
        toChatBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          callbacks.handleCopySingle(edit.id);
        });

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.disabled = index === 0;
        upBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          callbacks.moveEdit(edit.id, 'up');
        });

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.disabled = index === edits.length - 1;
        downBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          callbacks.moveEdit(edit.id, 'down');
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          callbacks.deleteEdit(edit.id);
        });

        actions.appendChild(toChatBtn);
        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(delBtn);

        headerRow.appendChild(idxEl);
        headerRow.appendChild(actions);

        const snippet = document.createElement('div');
        snippet.className = 'edit-snippet';
        const code = document.createElement('code');
        const snippetOneLine = (edit.snippet || '').trim().replace(/\s*\n\s*/g, ' ');
        code.textContent = snippetOneLine;
        snippet.appendChild(code);

        const textarea = document.createElement('textarea');
        textarea.className = 'edit-comment';
        textarea.value = edit.comment || '';
        textarea.placeholder = 'Comment on this edit...';

        textarea.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          textarea.focus();
        }, true);

        textarea.addEventListener('mouseup', (e) => {
          e.stopPropagation();
        }, true);

        textarea.addEventListener('click', (e) => {
          e.stopPropagation();
        }, true);

        textarea.addEventListener('focus', () => {
          currentCommentTextarea = textarea;
        });

        textarea.addEventListener('blur', () => {
          currentCommentTextarea = null;
        });

        textarea.addEventListener('input', (e) => {
          const value = (e.target as HTMLTextAreaElement).value;
          callbacks.updateEdit(edit.id, { comment: value });
        });

        item.appendChild(headerRow);
        item.appendChild(snippet);
        item.appendChild(textarea);

        content.appendChild(item);
      });
    }

    root.appendChild(content);

    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.textContent =
      'Select a fragment → "Add Edit". "To Chat" button inserts the edit into chat.';
    root.appendChild(footer);
  }

  render();

  return container;
}