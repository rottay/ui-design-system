import { describe, expect, it, vi } from 'vitest';

import { createUploadFile, removeUploadFile, resolveAcceptedUploadFiles } from '../shared';
import type { UploadFile } from '../types';

function makeFile(name: string, type = 'text/plain') {
  return new File([`contents:${name}`], name, { type });
}

describe('Upload shared helpers', () => {
  it('creates normalized upload file metadata', () => {
    const file = makeFile('resume.txt');
    const uploadFile = createUploadFile(file);

    expect(uploadFile.name).toBe('resume.txt');
    expect(uploadFile.type).toBe('text/plain');
    expect(uploadFile.originFileObj).toBe(file);
    expect(uploadFile.status).toBe('done');
    expect(uploadFile.uid).toContain('-');
  });

  it('respects maxCount within the same selection burst', async () => {
    const files = [makeFile('one.txt'), makeFile('two.txt')];

    const result = await resolveAcceptedUploadFiles([], files, 1, undefined);

    expect(result.acceptedFiles).toHaveLength(1);
    expect(result.nextFileList).toHaveLength(1);
    expect(result.nextFileList[0]?.name).toBe('one.txt');
  });

  it('supports beforeUpload blocking and file replacement', async () => {
    const beforeUpload = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(makeFile('replaced.txt'));

    const result = await resolveAcceptedUploadFiles(
      [],
      [makeFile('blocked.txt'), makeFile('original.txt')],
      undefined,
      beforeUpload
    );

    expect(beforeUpload).toHaveBeenCalledTimes(2);
    expect(result.acceptedFiles).toHaveLength(1);
    expect(result.acceptedFiles[0]?.name).toBe('replaced.txt');
    expect(result.acceptedFiles[0]?.originFileObj?.name).toBe('original.txt');
  });

  it('removes files by uid', () => {
    const fileList: UploadFile[] = [
      { uid: 'a', name: 'a.txt' },
      { uid: 'b', name: 'b.txt' },
    ];

    const result = removeUploadFile(fileList, { uid: 'a', name: 'a.txt' });

    expect(result).toEqual([{ uid: 'b', name: 'b.txt' }]);
  });
});
