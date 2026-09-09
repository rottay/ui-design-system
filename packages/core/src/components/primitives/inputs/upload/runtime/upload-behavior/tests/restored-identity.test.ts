import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UploadFile } from '../../../contracts';

const ALLOCATOR_KEY = Symbol.for('rottay.design-system.upload.uids');

/** A module instance created after a page reload: no runtime state survives. */
async function newSession() {
  delete (globalThis as Record<symbol, unknown>)[ALLOCATOR_KEY];
  vi.resetModules();
  return import('../index');
}

/** A second copy of the module inside the SAME runtime (SSR + client chunk). */
async function newModuleInstance() {
  vi.resetModules();
  return import('../index');
}

function makeFile(name: string, type = 'text/plain') {
  return new File([`contents:${name}`], name, { type });
}

describe('upload descriptor identity across module lifetimes', () => {
  beforeEach(() => {
    delete (globalThis as Record<symbol, unknown>)[ALLOCATOR_KEY];
    vi.resetModules();
  });

  it('never reissues a uid carried by a restored file list', async () => {
    const restored: UploadFile[] = [
      { uid: 'upload-1', name: 'persisted.txt' },
      { uid: 'upload-2', name: 'also-persisted.txt' },
    ];

    const { createUploadFile } = await newSession();
    const added = createUploadFile(makeFile('new.txt'), makeFile('new.txt'), restored);

    expect(added.uid).toBe('upload-3');
    expect(restored.some((file) => file.uid === added.uid)).toBe(false);
  });

  it('does not restart the sequence when a second module instance loads', async () => {
    const first = await newSession();
    const firstUid = first.createUploadFile(makeFile('a.txt')).uid;

    const second = await newModuleInstance();
    const secondUid = second.createUploadFile(makeFile('b.txt')).uid;

    expect(firstUid).toBe('upload-1');
    expect(secondUid).toBe('upload-2');
    expect(secondUid).not.toBe(firstUid);
  });

  it('restores files, accepts another one, then removes exactly one', async () => {
    const previousSession = await newSession();
    const persisted = previousSession.createUploadFile(makeFile('persisted.txt'));

    // The saved list comes back as `fileList` in a new session.
    const restored: UploadFile[] = [{ ...persisted, originFileObj: undefined }];

    const currentSession = await newSession();
    const { nextFileList, acceptedFiles } = await currentSession.resolveAcceptedUploadFiles(
      restored,
      [makeFile('new.txt')],
      undefined,
      undefined
    );

    const added = acceptedFiles[0]!;
    expect(added.uid).not.toBe(persisted.uid);
    expect(nextFileList.map((file) => file.uid)).toEqual([persisted.uid, added.uid]);

    const remaining = currentSession.removeUploadFile(nextFileList, added);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.uid).toBe(persisted.uid);
    expect(remaining[0]?.name).toBe('persisted.txt');
  });
});

describe('removeUploadFile deletes a single descriptor', () => {
  beforeEach(() => {
    delete (globalThis as Record<symbol, unknown>)[ALLOCATOR_KEY];
    vi.resetModules();
  });

  it('drops the exact instance when a legacy list already duplicates a uid', async () => {
    const { removeUploadFile } = await newSession();
    const restoredRow: UploadFile = { uid: 'upload-1', name: 'persisted.txt' };
    const newRow: UploadFile = { uid: 'upload-1', name: 'new.txt' };

    const remaining = removeUploadFile([restoredRow, newRow], newRow);

    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toBe(restoredRow);
  });

  it('returns an unchanged copy when the descriptor is absent', async () => {
    const { removeUploadFile } = await newSession();
    const fileList: UploadFile[] = [{ uid: 'upload-1', name: 'persisted.txt' }];

    const remaining = removeUploadFile(fileList, { uid: 'upload-9', name: 'other.txt' });

    expect(remaining).toEqual(fileList);
    expect(remaining).not.toBe(fileList);
  });
});
