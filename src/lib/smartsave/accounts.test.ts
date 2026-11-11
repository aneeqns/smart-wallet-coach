import { describe, expect, test } from 'vitest';
import { remember, chooseCloudState, cloudDirectory, mergeDirectory } from './accounts';
import { initialState } from './data';

describe('remembered accounts', () => {
  test('a new device restores B first and A second without duplicates', () => {
    const directory = [{ id: 'B', name: 'B', cloud: true, lastUsedAt: '2026-11-11' }, { id: 'A', name: 'A', cloud: true, lastUsedAt: '2026-11-10' }];
    expect(mergeDirectory([], directory).map(a => a.id)).toEqual(['B', 'A']);
    expect(mergeDirectory(directory, directory).length).toBe(2);
  });
  test('device removal remains local and is not restored by Cloud', () => {
    const remote = [{ id: 'A', name: 'A', cloud: true }, { id: 'B', name: 'B', cloud: true }];
    expect(mergeDirectory([], remote, ['A']).map(a => a.id)).toEqual(['B']);
    expect(remote.length).toBe(2);
  });
  test('only Cloud display fields are saved to the directory', () => {
    const account = { id: 'A', name: 'A', cloud: true, password: 'must-not-copy', token: 'must-not-copy' };
    expect(cloudDirectory([account, { id: 'local', name: 'Local' }])).toEqual([{ id: 'A', name: 'A', email: '', avatar: '', cloud: true, lastUsedAt: undefined }]);
  });
  test('Account B does not replace Account A', () => {
    expect(remember([{ id: 'A', name: 'Account A' }], { id: 'B', name: 'Account B' }).map(a => a.id)).toEqual(['B', 'A']);
  });
  test('Account A login again keeps one A and retains B', () => {
    expect(remember([{ id: 'B', name: 'Account B' }, { id: 'A', name: 'Account A' }], { id: 'A', name: 'Account A' }).map(a => a.id)).toEqual(['A', 'B']);
  });
  test('an existing Cloud save is never overwritten by a local import', () => {
    const cloud = { ...initialState(), xp: 140, name: 'Cloud' };
    expect(chooseCloudState(cloud, { ...initialState(), xp: 20 }, initialState()).xp).toBe(140);
  });
  test('explicit local import retains goals expenses and progress', () => {
    const local = { ...initialState(), xp: 75, goals: [{ id: 'g', name: 'Laptop', emoji: '💻', target: 800, saved: 50, targetDate: '2027-01-01' }], expenses: [{ id: 'e', amount: 20, category: 'food' as const, date: '2026-11-10', description: 'Lunch', necessity: 'need' as const }] };
    const result = chooseCloudState(null, local, initialState());
    expect(result.goals[0]?.saved).toBe(50);
    expect(result.expenses[0]?.amount).toBe(20);
    expect(result.xp).toBe(75);
  });
});