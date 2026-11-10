import type { SavedAccount, SmartSaveState } from './types';

export function remember(list: SavedAccount[], account: SavedAccount): SavedAccount[] {
  return [{ ...list.find((a) => a.id === account.id), ...account }, ...list.filter((a) => a.id !== account.id)];
}

export function chooseCloudState(cloud: SmartSaveState | null, selectedLocal: SmartSaveState | null, fresh: SmartSaveState): SmartSaveState {
  return cloud ?? selectedLocal ?? fresh;
}