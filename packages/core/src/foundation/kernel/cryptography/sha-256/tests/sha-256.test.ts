import { describe, expect, it } from 'vitest';
import { sha256Utf8 } from '..';
import { sha256TenantThemeValue } from '@/infrastructure/compilers/composition/tenant-theme';

describe('sha256Utf8', () => {
  it.each([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
    [
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    ],
    [
      'The quick brown fox jumps over the lazy dog',
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    ],
  ])('matches the NIST vector for %p', (input, expected) => {
    expect(sha256Utf8(input)).toBe(expected);
  });

  it('is byte-identical to the compiler alias', () => {
    const sample = JSON.stringify({ schemaVersion: 1, slug: 'themanagement' });
    expect(sha256TenantThemeValue(sample)).toBe(sha256Utf8(sample));
    expect(sha256TenantThemeValue).toBe(sha256Utf8);
  });
});
