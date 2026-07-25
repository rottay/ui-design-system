import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const modernSkin = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/dropdown.css',
  ),
  'utf8',
);

describe('Dropdown modern visual contract', () => {
  it('keeps complete action labels readable instead of truncating them', () => {
    const labelRule = modernSkin.match(
      /\[data-part='label'\]\s*\{(?<body>[\s\S]*?)\n\}/,
    )?.groups?.body;

    expect(labelRule).toBeDefined();
    expect(labelRule).toContain('overflow-wrap: anywhere');
    expect(labelRule).toContain('text-overflow: clip');
    expect(labelRule).toContain('white-space: normal');
    expect(labelRule).not.toContain('text-overflow: ellipsis');
  });

  it('allocates stable tracks for icon and iconless action anatomy', () => {
    expect(modernSkin).toContain("[data-part='selection-indicator'] + [data-part='label']");
    expect(modernSkin).toContain('grid-column: 2 / 4');
    expect(modernSkin).toContain("[data-part='submenu-indicator']");
    expect(modernSkin).toContain('grid-column: 4');
  });
});
