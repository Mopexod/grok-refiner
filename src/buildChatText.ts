// src/buildChatText.ts
import type { EditItem, PlatformId } from './types';

export function buildChatText(
  edits: EditItem[],
  platform: PlatformId
): string {
  const blocks: string[] = [];

  edits.forEach((edit) => {
    const comment = (edit.comment || '').trim();
    const rawSnippet = (edit.snippet || '').trim();
    const singleLineSnippet = rawSnippet.replace(/\s*\n\s*/g, ' ');

    const lines: string[] = [];
    lines.push(`"${singleLineSnippet}"`);
    if (comment) {
      lines.push(comment);
      lines.push('');
    }

    blocks.push(lines.join('\n'));
  });

  return blocks.join('\n');
}