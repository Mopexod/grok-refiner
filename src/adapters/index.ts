// src/adapters/index.ts
import { GrokAdapter } from './grokAdapter';
import type { ChatPlatformAdapter, PlatformId } from '../types';

const ALL_ADAPTERS: ChatPlatformAdapter[] = [GrokAdapter];

export function detectPlatform(
  location: Location,
  document: Document
): ChatPlatformAdapter | null {
  for (const adapter of ALL_ADAPTERS) {
    try {
      if (adapter.isMatch(location, document)) {
        return adapter;
      }
    } catch (e) {
      console.warn('grokRefiner: adapter isMatch error', adapter.id, e);
    }
  }
  return null;
}

export function getAdapterById(id: PlatformId): ChatPlatformAdapter | null {
  return ALL_ADAPTERS.find((a) => a.id === id) || null;
}