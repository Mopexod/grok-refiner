// src/storage.ts
import type { StoredState, PresetItem, EditItem } from './types';

const STORAGE_KEY = 'grokRefinerState';

const DEFAULT_PRESETS: PresetItem[] = [
  { id: '1', label: 'Grok Preset 1', text: 'Sample preset for Grok' },
];

const DEFAULT_STATE: StoredState = {
  edits: [],
  presets: DEFAULT_PRESETS,
  lastUsedPlatform: 'grok',
  collapsed: false,
};

export async function loadState(): Promise<StoredState> {
  return new Promise((resolve) => {
    // Проверка существования API более надежным способом
    const storage = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null;

    if (!storage) {
      resolve({ ...DEFAULT_STATE });
      return;
    }

    storage.get([STORAGE_KEY], (result: Record<string, any>) => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) {
        console.warn('grokRefiner: storage get error', chrome.runtime.lastError);
        resolve({ ...DEFAULT_STATE });
        return;
      }

      const stored = result[STORAGE_KEY];
      if (!stored || typeof stored !== 'object') {
        resolve({ ...DEFAULT_STATE });
        return;
      }

      // Используем безопасное извлечение с дефолтными значениями
      const edits = Array.isArray(stored.edits) ? (stored.edits as EditItem[]) : [];
      const presets = Array.isArray(stored.presets) ? (stored.presets as PresetItem[]) : DEFAULT_PRESETS;
      const lastUsedPlatform = (stored.lastUsedPlatform === 'claude' || stored.lastUsedPlatform === 'grok') 
        ? (stored.lastUsedPlatform as 'grok' | 'claude') 
        : 'grok';
      const collapsed = typeof stored.collapsed === 'boolean' ? stored.collapsed : false;

      resolve({
        edits,
        presets,
        lastUsedPlatform,
        collapsed,
      });
    });
  });
}

export function saveState(state: StoredState): void {
  if (!chrome?.storage?.local) return;

  try {
    chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        console.warn('grokRefiner: storage set error', chrome.runtime.lastError);
      }
    });
  } catch (err) {
    console.warn('grokRefiner: storage set exception', err);
  }
}