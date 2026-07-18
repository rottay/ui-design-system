import { describe, expect, it } from 'vitest';

import { sanitizeHref } from '../index';

const TAB = String.fromCharCode(9);
const NEWLINE = String.fromCharCode(10);
const NUL = String.fromCharCode(0);

describe('sanitizeHref -- allowed destinations', () => {
  it('permits http/https/mailto', () => {
    expect(sanitizeHref('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
    expect(sanitizeHref('http://example.com')).toBe('http://example.com');
    expect(sanitizeHref('mailto:hi@example.com')).toBe('mailto:hi@example.com');
  });

  it('permits relative and fragment destinations', () => {
    expect(sanitizeHref('/docs/getting-started')).toBe('/docs/getting-started');
    expect(sanitizeHref('#section')).toBe('#section');
    expect(sanitizeHref('./relative')).toBe('./relative');
    expect(sanitizeHref('../up')).toBe('../up');
    expect(sanitizeHref('page')).toBe('page');
  });

  it('is case-insensitive for allowed schemes', () => {
    expect(sanitizeHref('HTTPS://example.com')).toBe('HTTPS://example.com');
    expect(sanitizeHref('MailTo:hi@example.com')).toBe('MailTo:hi@example.com');
  });

  it('honors a custom allowlist', () => {
    expect(sanitizeHref('https://x', ['mailto'])).toBeNull();
    expect(sanitizeHref('mailto:x', ['mailto'])).toBe('mailto:x');
  });
});

describe('sanitizeHref -- the injection corpus (must all be rejected)', () => {
  const hostile: Array<[string, string]> = [
    ['plain javascript', 'javascript:alert(1)'],
    ['mixed-case scheme', 'JaVaScRiPt:alert(1)'],
    ['leading whitespace', '   javascript:alert(1)'],
    ['tab inside scheme', `java${TAB}script:alert(1)`],
    ['newline inside scheme', `java${NEWLINE}script:alert(1)`],
    ['NUL inside scheme', `java${NUL}script:alert(1)`],
    ['data html', 'data:text/html;base64,PHNjcmlwdD4='],
    ['vbscript', 'vbscript:msgbox(1)'],
    ['file', 'file:///etc/passwd'],
    ['about', 'about:blank'],
    ['numeric entity j', '&#106;avascript:alert(1)'],
    ['hex entity j', '&#x6a;avascript:alert(1)'],
    ['padded hex entity', '&#x0006a;avascript:alert(1)'],
    ['named colon entity', 'javascript&colon;alert(1)'],
    ['tab entity in scheme', `java&Tab;script:alert(1)`],
    ['double-encoded entity', '&amp;#x6a;avascript:alert(1)'],
    ['protocol-relative', '//evil.example.com/x'],
  ];

  it.each(hostile)('rejects %s', (_label, input) => {
    expect(sanitizeHref(input)).toBeNull();
  });
});

describe('sanitizeHref -- degenerate inputs', () => {
  it('rejects empty and whitespace-only destinations', () => {
    expect(sanitizeHref('')).toBeNull();
    expect(sanitizeHref('   ')).toBeNull();
    expect(sanitizeHref(`${TAB}${NEWLINE}`)).toBeNull();
  });

  it('rejects non-string input defensively', () => {
    expect(sanitizeHref(undefined as unknown as string)).toBeNull();
    expect(sanitizeHref(null as unknown as string)).toBeNull();
  });

  it('decodes benign entities in an otherwise-safe url', () => {
    // &amp; is decoded so the emitted href is the resolved query string.
    expect(sanitizeHref('https://x.com/?a=1&amp;b=2')).toBe('https://x.com/?a=1&b=2');
  });
});
