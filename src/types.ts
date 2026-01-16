// src/types.ts
export type PlatformId = 'grok' | 'claude';

export type PanelFromIframeMessage =
  | { source: 'grokRefiner_panel'; type: 'requestState' }
  | { source: 'grokRefiner_panel'; type: 'updateEdit'; editId: string; changes: Partial<EditItem> }
  | { source: 'grokRefiner_panel'; type: 'deleteEdit'; editId: string }
  | { source: 'grokRefiner_panel'; type: 'moveEdit'; editId: string; direction: 'up' | 'down' }
  | { source: 'grokRefiner_panel'; type: 'copySingle'; editId: string }
  | { source: 'grokRefiner_panel'; type: 'setActiveEdit'; editId: string | null };

export interface EditItem {
  id: string;
  sourcePlatform: PlatformId;
  messageId?: string;
  snippet: string;
  comment: string;
  createdAt: number;
}

export interface PresetItem {
  id: string;
  label: string;
  text: string;
}

export interface StoredState {
  edits: EditItem[];
  presets: PresetItem[];
  lastUsedPlatform?: PlatformId;
  collapsed?: boolean;
}

export interface ChatPlatformAdapter {
  id: PlatformId;
  isMatch(location: Location, document: Document): boolean;
  getMessageContainers(root: Document | ShadowRoot): HTMLElement[];
  getInputElement(): HTMLElement | null;
  observeNewMessages(callback: (messageEl: HTMLElement) => void): void;
}