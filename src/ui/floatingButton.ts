// src/ui/floatingButton.ts
export interface FloatingButtonCallbacks {
  onAddEdit(): void;
}

export interface FloatingButton {
  element: HTMLElement;
  showAt(rect: DOMRect): void;
  hide(): void;
}

export function createFloatingButton(
  callbacks: FloatingButtonCallbacks
): FloatingButton {
  const container = document.createElement('div');
  container.id = 'sheet-editor-floating-button';

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .floating-btn {
      position: fixed;
      z-index: 999999;
    }

    button {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #3b4250;
      background: #1c2331;
      color: #f5f5f5;
      cursor: pointer;
      white-space: nowrap;
    }

    button:hover {
      background: #242b3a;
    }
  `;
  shadow.appendChild(style);

  const root = document.createElement('div');
  root.className = 'floating-btn';
  root.style.display = 'none';

  const btn = document.createElement('button');
  btn.textContent = 'Add Edit';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    callbacks.onAddEdit();
  });

  root.appendChild(btn);
  shadow.appendChild(root);

  function showAt(rect: DOMRect) {
    const top = rect.bottom + 4;
    const left = rect.left;

    root.style.top = `${Math.max(0, top)}px`;
    root.style.left = `${Math.max(0, left)}px`;
    root.style.display = 'block';
  }

  function hide() {
    root.style.display = 'none';
  }

  return {
    element: container,
    showAt,
    hide,
  };
}