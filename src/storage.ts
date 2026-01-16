// src/storage.ts
import type { StoredState, PresetItem } from './types';

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
    if (!chrome?.storage?.local) {
      resolve({ ...DEFAULT_STATE });
      return;
    }

    try {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.warn('grokRefiner: storage get error', chrome.runtime.lastError);
          resolve({ ...DEFAULT_STATE });
          return;
        }

        const stored = result[STORAGE_KEY] as Record<string, any> | undefined;
        if (!stored) {
          resolve({ ...DEFAULT_STATE });
          return;
        }

        resolve({
          edits: Array.isArray(stored.edits) ? (stored.edits as EditItem[]) : [],
          presets: Array.isArray(stored.presets) ? (stored.presets as PresetItem[]) : DEFAULT_PRESETS,
          lastUsedPlatform: (stored.lastUsedPlatform as any) === 'claude' ? 'claude' : 'grok',
          collapsed: !!stored.collapsed,
        });
      });
    } catch (err) {
      console.warn('grokRefiner: storage get exception', err);
      resolve({ ...DEFAULT_STATE });
    }
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