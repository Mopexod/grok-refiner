"use strict";
(() => {
  // src/adapters/grokAdapter.ts
  var GrokAdapter = {
    id: "grok",
    isMatch(location, _document) {
      return location.hostname === "grok.com" || location.hostname.endsWith(".grok.com") || location.hostname === "x.ai" || location.hostname.endsWith(".x.ai") || location.hostname === "x.com" && location.pathname.startsWith("/i/grok") || location.hostname.endsWith(".x.com") && location.pathname.startsWith("/i/grok");
    },
    getMessageContainers(root) {
      const result = [];
      const selector = '[data-role="ai-message"], .ai-message, .grok-message';
      root.querySelectorAll(selector).forEach((el) => {
        result.push(el);
      });
      return result;
    },
    getInputElement() {
      const el1 = document.querySelector('div.tiptap.ProseMirror[contenteditable="true"]');
      const el2 = document.querySelector('[contenteditable="true"]');
      const el3 = document.querySelector('textarea[placeholder*="Ask"]');
      return el1 || el2 || el3 || null;
    },
    observeNewMessages(callback) {
      const root = document.body;
      if (!root)
        return;
      const observer = new MutationObserver((mutations) => {
        for (const mut of mutations) {
          mut.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement))
              return;
            const selector = '[data-role="ai-message"], .ai-message, .grok-message';
            const containers = node.querySelectorAll(selector);
            containers.forEach((c) => callback(c));
            if (node.matches(selector)) {
              callback(node);
            }
          });
        }
      });
      observer.observe(root, {
        childList: true,
        subtree: true
      });
    }
  };

  // src/adapters/index.ts
  var ALL_ADAPTERS = [GrokAdapter];
  function detectPlatform(location, document2) {
    for (const adapter2 of ALL_ADAPTERS) {
      try {
        if (adapter2.isMatch(location, document2)) {
          return adapter2;
        }
      } catch (e) {
        console.warn("grokRefiner: adapter isMatch error", adapter2.id, e);
      }
    }
    return null;
  }

  // src/storage.ts
  var STORAGE_KEY = "grokRefinerState";
  var DEFAULT_PRESETS = [
    { id: "1", label: "Grok Preset 1", text: "Sample preset for Grok" }
  ];
  var DEFAULT_STATE = {
    edits: [],
    presets: DEFAULT_PRESETS,
    lastUsedPlatform: "grok",
    collapsed: false
  };
  async function loadState() {
    return new Promise((resolve) => {
      const storage = typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null;
      if (!storage) {
        resolve({ ...DEFAULT_STATE });
        return;
      }
      storage.get([STORAGE_KEY], (result) => {
        if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
          console.warn("grokRefiner: storage get error", chrome.runtime.lastError);
          resolve({ ...DEFAULT_STATE });
          return;
        }
        const stored = result[STORAGE_KEY];
        if (!stored || typeof stored !== "object") {
          resolve({ ...DEFAULT_STATE });
          return;
        }
        const edits = Array.isArray(stored.edits) ? stored.edits : [];
        const presets = Array.isArray(stored.presets) ? stored.presets : DEFAULT_PRESETS;
        const lastUsedPlatform = stored.lastUsedPlatform === "claude" || stored.lastUsedPlatform === "grok" ? stored.lastUsedPlatform : "grok";
        const collapsed = typeof stored.collapsed === "boolean" ? stored.collapsed : false;
        resolve({
          edits,
          presets,
          lastUsedPlatform,
          collapsed
        });
      });
    });
  }
  function saveState(state2) {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local)
      return;
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: state2 }, () => {
        const lastError = typeof chrome !== "undefined" && chrome.runtime?.lastError;
        if (lastError) {
          if (lastError.message?.includes("context invalidated"))
            return;
          console.warn("grokRefiner: storage set error", lastError);
        }
      });
    } catch (err) {
      if (err?.message?.includes("context invalidated"))
        return;
      console.warn("grokRefiner: storage set exception", err);
    }
  }

  // src/buildChatText.ts
  function buildChatText(edits, platform) {
    const blocks = [];
    edits.forEach((edit) => {
      const comment = (edit.comment || "").trim();
      const rawSnippet = (edit.snippet || "").trim();
      const singleLineSnippet = rawSnippet.replace(/\s*\n\s*/g, " ");
      const lines = [];
      lines.push(`"${singleLineSnippet}"`);
      if (comment) {
        lines.push(comment);
      }
      blocks.push(lines.join("\n"));
    });
    return blocks.join("\n\n");
  }

  // src/content-script.ts
  var adapter = null;
  var activePlatform = "grok";
  var state = {
    edits: [],
    presets: [],
    lastUsedPlatform: "grok",
    collapsed: false
  };
  var activeEditId = null;
  function setupPanelIframe() {
    const wrapper = document.createElement("div");
    wrapper.id = "grok-refiner-panel-wrapper";
    const handle = document.createElement("div");
    handle.id = "grok-refiner-panel-handle";
    handle.textContent = "R4G";
    const iframe = document.createElement("iframe");
    iframe.id = "grok-refiner-panel-iframe";
    iframe.src = chrome.runtime.getURL("panel.html");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    wrapper.appendChild(handle);
    wrapper.appendChild(iframe);
    const style = document.createElement("style");
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
    handle.addEventListener("click", (e) => {
      e.stopPropagation();
      setCollapsed(!isCollapsed());
    });
    applyLayout();
    iframe.addEventListener("load", () => {
      sendStateToPanel();
    });
  }
  function isCollapsed() {
    return state.collapsed ?? false;
  }
  function setCollapsed(val) {
    state.collapsed = val;
    saveState(state);
    applyLayout();
  }
  function applyLayout() {
    const wrapper = document.getElementById("grok-refiner-panel-wrapper");
    if (!wrapper)
      return;
    if (isCollapsed()) {
      wrapper.classList.add("collapsed");
    } else {
      wrapper.classList.remove("collapsed");
    }
  }
  function sendStateToPanel() {
    const iframe = document.getElementById(
      "grok-refiner-panel-iframe"
    );
    if (!iframe || !iframe.contentWindow)
      return;
    const msg = {
      source: "grokRefiner_content",
      type: "state",
      state,
      activeEditId
    };
    try {
      iframe.contentWindow.postMessage(msg, "*");
    } catch (e) {
      console.warn("grokRefiner: postMessage to panel iframe failed", e);
    }
  }
  function rerenderPanel() {
    sendStateToPanel();
  }
  function createFloatingButton() {
    const shadowHost = document.createElement("div");
    shadowHost.id = "grok-refiner-floating-button-host";
    const shadow = shadowHost.attachShadow({ mode: "open" });
    const style = document.createElement("style");
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
    const wrapper = document.createElement("div");
    wrapper.className = "button-wrapper";
    const btn = document.createElement("button");
    btn.className = "button";
    btn.textContent = "Add Edit";
    wrapper.appendChild(btn);
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    return shadowHost;
  }
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object" || data.source !== "grokRefiner_panel") {
      return;
    }
    const msg = data;
    switch (msg.type) {
      case "requestState":
        sendStateToPanel();
        break;
      case "updateEdit": {
        const edit = state.edits.find((e) => e.id === msg.editId);
        if (edit) {
          Object.assign(edit, msg.changes);
          saveState(state);
        }
        break;
      }
      case "deleteEdit": {
        state.edits = state.edits.filter((e) => e.id !== msg.editId);
        if (activeEditId === msg.editId) {
          activeEditId = null;
        }
        saveState(state);
        rerenderPanel();
        break;
      }
      case "moveEdit": {
        const idx = state.edits.findIndex((e) => e.id === msg.editId);
        if (idx !== -1) {
          const newIdx = msg.direction === "up" ? idx - 1 : idx + 1;
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
      case "copySingle": {
        handleCopySingle(msg.editId);
        break;
      }
      case "setActiveEdit": {
        activeEditId = msg.editId;
        break;
      }
    }
  });
  var floatingButtonHost = null;
  var currentSelection = null;
  function showFloatingButton(snippet, range) {
    currentSelection = { snippet, range };
    if (!floatingButtonHost) {
      floatingButtonHost = createFloatingButton();
      document.body.appendChild(floatingButtonHost);
      const shadow = floatingButtonHost.shadowRoot;
      const btn = shadow.querySelector(".button");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleAddEdit();
      });
    }
    const rect = range.getBoundingClientRect();
    const wrapper = floatingButtonHost.shadowRoot.querySelector(
      ".button-wrapper"
    );
    wrapper.style.top = `${window.scrollY + rect.bottom + 8}px`;
    wrapper.style.left = `${window.scrollX + rect.left}px`;
    floatingButtonHost.style.display = "block";
  }
  function hideFloatingButton() {
    if (floatingButtonHost) {
      floatingButtonHost.style.display = "none";
    }
    currentSelection = null;
  }
  function handleAddEdit() {
    if (!currentSelection || !adapter)
      return;
    const snippet = currentSelection.snippet;
    const newEdit = {
      id: Date.now().toString(),
      sourcePlatform: adapter.id,
      snippet,
      comment: "",
      createdAt: Date.now()
    };
    state.edits.push(newEdit);
    saveState(state);
    rerenderPanel();
    hideFloatingButton();
    window.getSelection()?.removeAllRanges();
  }
  function handleCopySingle(editId) {
    const edit = state.edits.find((e) => e.id === editId);
    if (!edit)
      return;
    const text = buildChatText([edit], activePlatform);
    if (!text)
      return;
    if (!adapter)
      return;
    const input = adapter.getInputElement();
    if (!input)
      return;
    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
      const current = (input.value ?? "").trimEnd();
      const combined = current ? `${current}

${text}` : text;
      input.value = combined;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
      return;
    }
    if (input.tagName.toLowerCase() === "textbox") {
      input.focus();
      const currentText = (input.textContent || "").trimEnd();
      const textToInsert = currentText ? `${currentText}

${text}` : text;
      input.textContent = textToInsert;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    if (input.getAttribute("contenteditable") === "true") {
      input.focus();
      const selection = window.getSelection();
      if (!selection)
        return;
      const range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      const currentText = (input.textContent || "").trimEnd();
      const textToInsert = currentText ? `

${text}` : text;
      try {
        const ok = document.execCommand("insertText", false, textToInsert);
        if (!ok) {
          input.textContent = (input.textContent || "") + textToInsert;
        }
      } catch (err) {
        console.warn("grokRefiner: execCommand insertText error", err);
        input.textContent = (input.textContent || "") + textToInsert;
      }
      return;
    }
    console.warn("grokRefiner: unknown input element type for chat insert");
  }
  function observeSelection() {
    document.addEventListener("mouseup", (e) => {
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
    document.addEventListener("mousedown", (e) => {
      if (!floatingButtonHost)
        return;
      const shadow = floatingButtonHost.shadowRoot;
      if (!shadow)
        return;
      const path = e.composedPath();
      const btn = shadow.querySelector(".button");
      if (btn && path.includes(btn)) {
        return;
      }
      hideFloatingButton();
    });
  }
  async function init() {
    try {
      adapter = detectPlatform(window.location, document);
      if (!adapter)
        return;
      activePlatform = adapter.id;
      state = await loadState();
      setupPanelIframe();
      observeSelection();
      if (adapter.observeNewMessages) {
        adapter.observeNewMessages(() => {
        });
      }
    } catch (err) {
      console.error("grokRefiner: init error", err);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
