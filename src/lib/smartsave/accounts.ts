import type { SavedAccount, SmartSaveState } from './types';

export function remember(list: SavedAccount[], account: SavedAccount): SavedAccount[] {
  return [{ ...list.find((a) => a.id === account.id), ...account }, ...list.filter((a) => a.id !== account.id)];
}

export function chooseCloudState(cloud: SmartSaveState | null, selectedLocal: SmartSaveState | null, fresh: SmartSaveState): SmartSaveState {
  return cloud ?? selectedLocal ?? fresh;
}

/** Only display metadata may cross devices; never copy sessions or simulation rows. */
export function cloudDirectory(list: SavedAccount[]): SavedAccount[] {
  return list.filter(a => a.cloud).map(a => ({ id: a.id, name: a.name, email: a.email ?? '', avatar: a.avatar ?? '', cloud: true, lastUsedAt: a.lastUsedAt }));
}

export function mergeDirectory(local: SavedAccount[], remote: SavedAccount[], hidden: string[] = []): SavedAccount[] {
  const byId = new Map<string, SavedAccount>();
  for (const a of [...remote, ...local]) {
    if (!a || typeof a.id !== 'string' || hidden.includes(a.id)) continue;
    const previous = byId.get(a.id);
    if (!previous || (a.lastUsedAt ?? '') >= (previous.lastUsedAt ?? '')) byId.set(a.id, a);
  }
  return [...byId.values()].sort((a, b) => (b.lastUsedAt ?? '').localeCompare(a.lastUsedAt ?? ''));
}