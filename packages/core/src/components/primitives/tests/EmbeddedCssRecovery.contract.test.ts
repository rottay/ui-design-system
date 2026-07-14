import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { TOAST_KEYFRAMES } from '../feedback/Toast/utils/animations';

const srcRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const readSource = (path: string) => readFileSync(resolve(srcRoot, path), 'utf8');
const readSkin = (name: string) => readSource(`tokens/css/components/skin/${name}`);

const SKIN_HASHES = {
  'data-table-interactions.css': 'ed433b6802e97d7dcc5415c4821756cf2b17e3d655af03087c35c1fbf691a016',
  'form-placeholders.css': 'c26b0d68812a0b668f5992cfa868ce8ee1c9b9047c7e7cbfe91b110d82ab2a8f',
  'navigation-static.css': '27dd6e831cc8e09c7cb07ee078e4a8f28aab4572f572a1bae74893bce9784f05',
  'primitive-motion.css': '6b88cc713c2552a668c6c056bbf8ba1dae05d44a827078a0e942b74a7d847e7a',
  'scroll-area.css': '060d4fab16df50659d75c29d41943e8348b25a3d7b249d3ad13d1f43b40714c1',
  'toast-animation-keyframes.css': 'a18d974060652fda28e40aa14d46173de1f766ac067cec4a689b43124c33c62a',
} as const;

const PAINT_PROPERTIES = new Set([
  'accent-color',
  'backdrop-filter',
  'box-shadow',
  'color',
  'fill',
  'filter',
  'stroke',
  'text-shadow',
  'transform',
  '-webkit-backdrop-filter',
]);

function isPaintProperty(property: string): boolean {
  const normalized = property.toLowerCase();
  if (normalized.startsWith('--') || normalized === 'border-collapse' || normalized === 'border-spacing') {
    return false;
  }
  return (
    PAINT_PROPERTIES.has(normalized) ||
    normalized.startsWith('background') ||
    normalized.startsWith('border') ||
    normalized.startsWith('outline')
  );
}

function paintCount(css: string): number {
  let count = 0;
  postcss.parse(css).walkDecls((declaration) => {
    if (isPaintProperty(declaration.prop)) count += 1;
  });
  return count;
}

function declarationMap(
  declarations: Array<{ prop: string; value: string; important?: boolean }>
): Record<string, string> {
  return Object.fromEntries(
    declarations.map(({ prop, value, important }) => {
      const normalizedValue = value.replace(/\s+/g, ' ').trim();
      return [prop, important ? `${normalizedValue} !important` : normalizedValue];
    })
  );
}

function ruleContracts(css: string, selector: string): Array<Record<string, string>> {
  const matches: Array<Record<string, string>> = [];
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type !== 'root' || !rule.selectors.includes(selector)) return;
    matches.push(declarationMap(rule.nodes.filter((node) => node.type === 'decl')));
  });
  return matches;
}

function ruleContract(css: string, selector: string): Record<string, string> {
  const matches = ruleContracts(css, selector);
  expect(matches, `selector ${selector}`).toHaveLength(1);
  return matches[0];
}

function keyframeContract(css: string, name: string): Record<string, Record<string, string>> {
  const matches: Array<Record<string, Record<string, string>>> = [];
  postcss.parse(css).walkAtRules('keyframes', (atRule) => {
    if (atRule.params !== name) return;
    const frames: Record<string, Record<string, string>> = {};
    atRule.walkRules((rule) => {
      frames[rule.selector] = declarationMap(rule.nodes.filter((node) => node.type === 'decl'));
    });
    matches.push(frames);
  });
  expect(matches, `@keyframes ${name}`).toHaveLength(1);
  return matches[0];
}

function expectKeyframeContracts(css: string, expected: Record<string, Record<string, Record<string, string>>>): void {
  for (const [name, frames] of Object.entries(expected)) {
    expect(keyframeContract(css, name), `@keyframes ${name} body`).toEqual(frames);
  }
}

const SKINS = {
  dataTable: readSkin('data-table-interactions.css'),
  primitiveMotion: readSkin('primitive-motion.css'),
  toast: readSkin('toast-animation-keyframes.css'),
  scrollArea: readSkin('scroll-area.css'),
  navigation: readSkin('navigation-static.css'),
  formPlaceholders: readSkin('form-placeholders.css'),
};

describe('WO-SKIN-06 embedded CSS recovery — exact static payload', () => {
  it('pins all six audited stylesheets byte-for-byte', () => {
    for (const [name, expectedHash] of Object.entries(SKIN_HASHES)) {
      const actualHash = createHash('sha256').update(readSkin(name)).digest('hex');
      expect(actualHash, name).toBe(expectedHash);
    }
  });

  it('recovers all 85 classified declarations with the original family floors', () => {
    expect({
      dataTable: paintCount(SKINS.dataTable),
      primitiveMotion: paintCount(SKINS.primitiveMotion),
      toast: paintCount(SKINS.toast),
      scrollArea: paintCount(SKINS.scrollArea),
      navigation: paintCount(SKINS.navigation),
      formPlaceholders: paintCount(SKINS.formPlaceholders),
    }).toEqual({
      dataTable: 22,
      primitiveMotion: 8,
      toast: 20,
      scrollArea: 25,
      navigation: 8,
      formPlaceholders: 2,
    });
  });

  it('pins every DataTable interaction selector and animation body', () => {
    const modernSelectors: string[] = [];
    postcss.parse(SKINS.dataTable).walkRules((rule) => {
      if (rule.parent?.type === 'root') {
        modernSelectors.push(...rule.selectors.filter((selector) => selector.includes('.ds-engine-modern')));
      }
    });
    expect(modernSelectors.length).toBeGreaterThan(0);
    expect(
      modernSelectors.every((selector) => selector.startsWith('.ds-engine-modern:where(.ds-pattern-data-table)'))
    ).toBe(true);

    expect(
      ruleContract(
        SKINS.dataTable,
        '.ds-engine-modern:where(.ds-pattern-data-table) .ds-resize-handle:hover .ds-resize-handle__bar'
      )
    ).toEqual({
      width: '3px !important',
      background: 'var(--ds-color-primary) !important',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) .ds-resize-handle:focus-visible')
    ).toEqual({
      outline: '2px solid var(--ds-color-primary)',
      'outline-offset': '-2px',
      'border-radius': '2px',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) th[data-col-key]:hover')
    ).toEqual({
      'background-color': 'color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)',
    });
    expect(
      ruleContract(
        SKINS.dataTable,
        ".ds-engine-modern:where(.ds-pattern-data-table) th[data-col-key][data-sortable='true']:focus-visible"
      )
    ).toEqual({
      outline: '2px solid var(--ds-color-primary)',
      'outline-offset': '-2px',
      'border-radius': '2px',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) tr[data-row-index]:focus-visible')
    ).toEqual({
      outline: 'none',
      'box-shadow': 'inset 3px 0 0 0 var(--ds-color-primary)',
      'background-color': 'color-mix(in srgb, var(--ds-color-primary) 6%, transparent) !important',
    });
    expect(
      ruleContract(SKINS.dataTable, ".ds-engine-modern:where(.ds-pattern-data-table) td[data-editable='true']")
    ).toEqual({
      cursor: 'text',
      transition:
        'background-color var(--ds-motion-fast) ease, box-shadow var(--ds-motion-fast) ease, transform var(--ds-motion-fast) ease',
    });
    expect(
      ruleContract(
        SKINS.dataTable,
        ".ds-engine-modern:where(.ds-pattern-data-table) td[data-editable='true']:hover::after"
      )
    ).toEqual({
      content: "''",
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: '2px',
      background: 'var(--ds-color-primary)',
      opacity: '0.4',
      'pointer-events': 'none',
    });
    expect(
      ruleContract(SKINS.dataTable, ".ds-engine-modern:where(.ds-pattern-data-table) td[data-editable='true']:hover")
    ).toEqual({
      background: 'color-mix(in srgb, var(--ds-color-primary) 4%, transparent)',
      'box-shadow': 'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 16%, transparent)',
    });
    expect(
      ruleContract(SKINS.dataTable, ".ds-engine-modern:where(.ds-pattern-data-table) td[data-editing='true']")
    ).toEqual({
      overflow: 'visible !important',
      padding: '4px 6px !important',
      background: 'color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)) !important',
      'box-shadow':
        'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 30%, transparent), 0 8px 18px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
      animation: 'ds-inline-edit-enter var(--ds-motion-normal) var(--ds-motion-ease-out)',
    });
    expect(
      ruleContract(
        SKINS.dataTable,
        ".ds-engine-modern:where(.ds-pattern-data-table) td[data-cell-dirty='true']::before"
      )
    ).toEqual({
      content: "''",
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: '3px',
      background: 'var(--ds-color-warning)',
      'pointer-events': 'none',
    });

    expectKeyframeContracts(SKINS.dataTable, {
      'ds-inline-edit-enter': {
        from: { transform: 'scale(0.985)', opacity: '0.78' },
        to: { transform: 'scale(1)', opacity: '1' },
      },
      'ds-data-table-shimmer': {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.35' },
      },
      'ds-spin': {
        to: { transform: 'rotate(360deg)' },
      },
      'ds-bulk-slide-down': {
        from: { opacity: '0', transform: 'translateY(-8px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
    });
  });

  it('pins every Timeline and Tree motion frame body', () => {
    expectKeyframeContracts(SKINS.primitiveMotion, {
      'rottay-timeline-pulse': {
        '0%, 100%': { opacity: '1', transform: 'scale(1)' },
        '50%': { opacity: '0.5', transform: 'scale(0.9)' },
      },
      'rottay-drop-indicator': {
        from: { opacity: '0', transform: 'scaleX(0.3)' },
        to: { opacity: '1', transform: 'scaleX(1)' },
      },
      'rottay-tree-spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      'rottay-tree-drop-line-in': {
        from: { opacity: '0', transform: 'scaleX(0.5)' },
        to: { opacity: '1', transform: 'scaleX(1)' },
      },
    });
  });

  it('pins the independent Input and Select placeholder contracts', () => {
    expect(ruleContract(SKINS.formPlaceholders, '.rottay-input--modern::placeholder')).toEqual({
      color: 'var(--ds-input-color-placeholder, var(--ds-color-text-muted))',
      opacity: '1',
    });
    expect(ruleContract(SKINS.formPlaceholders, '.rottay-select__search-input::placeholder')).toEqual({
      color: 'var(--ds-color-text-muted)',
      opacity: '1',
    });
  });

  it('pins every Menu and Tabs selector plus the Tabs frame body', () => {
    expect(ruleContract(SKINS.navigation, '.rottay-menu--modern a:focus-visible')).toEqual({
      outline: '2px solid var(--ds-color-primary) !important',
      'outline-offset': '-2px !important',
    });
    expect(ruleContract(SKINS.navigation, '.rottay-menu--modern details[open] > summary > span:last-child')).toEqual({
      transform: 'rotate(90deg)',
    });
    expect(ruleContract(SKINS.navigation, '.rottay-menu--modern summary::-webkit-details-marker')).toEqual({
      display: 'none',
      content: "''",
    });
    expect(ruleContract(SKINS.navigation, '[data-tabs-id]::-webkit-scrollbar')).toEqual({
      display: 'none',
    });
    expect(ruleContract(SKINS.navigation, "[data-tabs-id] [role='tab']:focus-visible")).toEqual({
      outline: 'var(--ds-focus-ring-width, 2px) solid var(--ds-focus-ring-color) !important',
      'outline-offset': 'calc(-1 * var(--ds-focus-ring-offset, 2px)) !important',
      'border-radius': 'var(--ds-radius-sm)',
    });
    expectKeyframeContracts(SKINS.navigation, {
      'rottay-tabs-fade-in': {
        from: { opacity: '0', transform: 'translateY(2px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
    });
  });

  it('pins every Toast transition frame body independently of the public export', () => {
    expectKeyframeContracts(SKINS.toast, {
      'toast-slide-in-right': {
        from: { transform: 'translateX(100%)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
      },
      'toast-slide-out-right': {
        from: { transform: 'translateX(0)', opacity: '1' },
        to: { transform: 'translateX(100%)', opacity: '0' },
      },
      'toast-slide-in-left': {
        from: { transform: 'translateX(-100%)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
      },
      'toast-slide-out-left': {
        from: { transform: 'translateX(0)', opacity: '1' },
        to: { transform: 'translateX(-100%)', opacity: '0' },
      },
      'toast-slide-in-top': {
        from: { transform: 'translateY(-100%)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      'toast-slide-out-top': {
        from: { transform: 'translateY(0)', opacity: '1' },
        to: { transform: 'translateY(-100%)', opacity: '0' },
      },
      'toast-slide-in-bottom': {
        from: { transform: 'translateY(100%)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      'toast-slide-out-bottom': {
        from: { transform: 'translateY(0)', opacity: '1' },
        to: { transform: 'translateY(100%)', opacity: '0' },
      },
      'toast-fade-in': {
        from: { opacity: '0', transform: 'scale(0.95)' },
        to: { opacity: '1', transform: 'scale(1)' },
      },
      'toast-fade-out': {
        from: { opacity: '1', transform: 'scale(1)' },
        to: { opacity: '0', transform: 'scale(0.95)' },
      },
      'toast-progress': {
        from: { width: '100%' },
        to: { width: '0%' },
      },
    });
  });

  it('keeps the public Toast keyframe export byte-identical to the canonical CSS payload', () => {
    const canonicalPayload = SKINS.toast.replace(/^\/\*\*[^]*?\*\/\s*/, '').trim();
    expect(canonicalPayload).toBe(TOAST_KEYFRAMES.trim());
  });

  it('pins every ScrollArea selector, value and closed state', () => {
    expect(ruleContract(SKINS.scrollArea, ".rottay-scroll-area-modern[data-scrollbar-size='thin']")).toEqual({
      '--ds-scroll-area-scrollbar-size': '4px',
      '--ds-scroll-area-scrollbar-radius': '2px',
    });
    expect(ruleContract(SKINS.scrollArea, ".rottay-scroll-area-modern[data-scrollbar-size='normal']")).toEqual({
      '--ds-scroll-area-scrollbar-size': '8px',
      '--ds-scroll-area-scrollbar-radius': '4px',
    });
    expect(ruleContract(SKINS.scrollArea, ".rottay-scroll-area-modern[data-scrollbar-size='wide']")).toEqual({
      '--ds-scroll-area-scrollbar-size': '12px',
      '--ds-scroll-area-scrollbar-radius': '6px',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-modern::-webkit-scrollbar')).toEqual({
      width: 'var(--ds-scroll-area-scrollbar-size)',
      height: 'var(--ds-scroll-area-scrollbar-size)',
    });

    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-modern::-webkit-scrollbar-track')).toEqual({
      background: 'var(--color-base-200, oklch(0.93 0.01 240))',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-modern::-webkit-scrollbar-thumb')).toEqual({
      background: 'oklch(var(--color-base-content, 0.27 0.01 240) / 0.3)',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-modern::-webkit-scrollbar-thumb:hover')).toEqual({
      background: 'oklch(var(--color-base-content, 0.27 0.01 240) / 0.5)',
    });
    expect(
      ruleContract(SKINS.scrollArea, ".rottay-scroll-area-modern[data-hide-scrollbar='true']::-webkit-scrollbar-thumb")
    ).toEqual({
      background: 'transparent',
    });
    expect(
      ruleContract(
        SKINS.scrollArea,
        ".rottay-scroll-area-modern[data-hide-scrollbar='true']:hover::-webkit-scrollbar-thumb"
      )
    ).toEqual({
      background: 'oklch(var(--color-base-content, 0.27 0.01 240) / 0.3)',
    });

    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-classic::-webkit-scrollbar-track')).toEqual({
      background: 'var(--ds-color-neutral-100, #f5f5f5)',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-classic::-webkit-scrollbar-thumb')).toEqual({
      background: 'var(--ds-color-neutral-400, #bfbfbf)',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
      transition: 'background 0.2s ease',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-classic::-webkit-scrollbar-thumb:hover')).toEqual({
      background: 'var(--ds-color-neutral-500, #8c8c8c)',
    });
    expect(
      ruleContract(SKINS.scrollArea, ".rottay-scroll-area-classic[data-hide-scrollbar='true']::-webkit-scrollbar-thumb")
    ).toEqual({
      background: 'transparent',
    });
    expect(
      ruleContract(
        SKINS.scrollArea,
        ".rottay-scroll-area-classic[data-hide-scrollbar='true']:hover::-webkit-scrollbar-thumb"
      )
    ).toEqual({
      background: 'var(--ds-color-neutral-400, #bfbfbf)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-classic')).toEqual({
      'scrollbar-width': 'auto',
      'scrollbar-color': 'var(--ds-color-neutral-400, #bfbfbf) var(--ds-color-neutral-100, #f5f5f5)',
    });
    expect(ruleContracts(SKINS.scrollArea, ".rottay-scroll-area-classic[data-scrollbar-size='thin']")).toEqual([
      {
        '--ds-scroll-area-scrollbar-size': '4px',
        '--ds-scroll-area-scrollbar-radius': '2px',
      },
      {
        'scrollbar-width': 'thin',
      },
    ]);

    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-rustic::-webkit-scrollbar-track')).toEqual({
      background: 'var(--ds-color-neutral-100, #f5f5f5)',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-rustic::-webkit-scrollbar-thumb')).toEqual({
      background: 'var(--ds-color-neutral-400, #bfbfbf)',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
      border: '1px solid var(--ds-color-neutral-100, #f5f5f5)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-rustic::-webkit-scrollbar-thumb:hover')).toEqual({
      background: 'var(--ds-color-neutral-500, #8c8c8c)',
    });
    expect(ruleContract(SKINS.scrollArea, '.rottay-scroll-area-rustic::-webkit-scrollbar-corner')).toEqual({
      background: 'var(--ds-color-neutral-100, #f5f5f5)',
    });
    expect(
      ruleContract(SKINS.scrollArea, ".rottay-scroll-area-rustic[data-hide-scrollbar='true']::-webkit-scrollbar-thumb")
    ).toEqual({
      background: 'transparent',
      'border-color': 'transparent',
    });
    expect(
      ruleContract(
        SKINS.scrollArea,
        ".rottay-scroll-area-rustic[data-hide-scrollbar='true']:hover::-webkit-scrollbar-thumb"
      )
    ).toEqual({
      background: 'var(--ds-color-neutral-400, #bfbfbf)',
      'border-color': 'var(--ds-color-neutral-100, #f5f5f5)',
    });
  });

  it('preserves the ScrollArea size and hidden-thumb state matrix', () => {
    for (const [size, width, radius] of [
      ['thin', '4px', '2px'],
      ['normal', '8px', '4px'],
      ['wide', '12px', '6px'],
    ] as const) {
      const block = new RegExp(
        `\\[data-scrollbar-size='${size}'\\][^{]*\\{[^}]*--ds-scroll-area-scrollbar-size:\\s*${width};[^}]*--ds-scroll-area-scrollbar-radius:\\s*${radius};`
      );
      expect(SKINS.scrollArea).toMatch(block);
    }

    for (const engine of ['modern', 'classic', 'rustic']) {
      expect(SKINS.scrollArea).toContain(`.rottay-scroll-area-${engine}[data-hide-scrollbar='true']`);
    }
  });
});

describe('WO-SKIN-06 embedded CSS recovery — producer and hook contract', () => {
  const producerFreeSources = [
    'components/patterns/data/data-table/engines/modern.tsx',
    'components/patterns/data/data-table/engines/rustic.tsx',
    'components/primitives/display/Timeline/engines/rustic.tsx',
    'components/primitives/display/Tree/engines/modern.tsx',
    'components/primitives/display/Tree/engines/rustic.tsx',
    'components/primitives/layout/ScrollArea/engines/modern.tsx',
    'components/primitives/layout/ScrollArea/engines/classic.tsx',
    'components/primitives/layout/ScrollArea/engines/rustic.tsx',
    'components/primitives/navigation/Menu/engines/modern.tsx',
  ];

  it.each(producerFreeSources)('%s no longer creates a stylesheet', (path) => {
    const source = readSource(path);
    expect(source).not.toMatch(/<style(?:\s|>)/);
    expect(source).not.toContain("createElement('style')");
    expect(source).not.toContain('createElement("style")');
  });

  it('keeps only certified responsive producers in Input, Select and Tabs', () => {
    const input = readSource('components/primitives/inputs/Input/engines/modern.tsx');
    const select = readSource('components/primitives/inputs/Select/engines/modern.tsx');
    const tabs = readSource('components/primitives/navigation/Tabs/engines/modern.tsx');

    expect(input).not.toContain('ds-input-ph-');
    expect(input).not.toContain('::placeholder');
    expect(input.match(/<style/g)).toHaveLength(1);

    expect(select).not.toContain('ds-sel-search-');
    expect(select).not.toContain('searchPlaceholderCSS');
    expect(select.match(/<style/g)).toHaveLength(2);
    expect(select.match(/className="rottay-select__search-input"/g)).toHaveLength(2);

    expect(tabs).not.toContain('::webkit-scrollbar');
    expect(tabs).not.toContain('@keyframes rottay-tabs-fade-in');
    expect(tabs.match(/<style/g)).toHaveLength(1);
  });

  it('stamps every ScrollArea engine with the closed state contract', () => {
    for (const engine of ['modern', 'classic', 'rustic']) {
      const source = readSource(`components/primitives/layout/ScrollArea/engines/${engine}.tsx`);
      expect(source).toContain(`rottay-scroll-area-${engine}`);
      expect(source).toContain('data-scrollbar-size={scrollbarSize}');
      expect(source).toMatch(/data-hide-scrollbar=\{hideScrollbar \? ["']true["'] : ["']false["']\}/);
    }
  });

  it('keeps every extracted animation name connected to its component', () => {
    const families = [
      [
        'data-table-interactions.css',
        'components/patterns/data/data-table/engines/modern.tsx',
        ['ds-inline-edit-enter', 'ds-data-table-shimmer'],
      ],
      [
        'data-table-interactions.css',
        'components/patterns/data/data-table/engines/rustic.tsx',
        ['ds-spin', 'ds-bulk-slide-down'],
      ],
      ['primitive-motion.css', 'components/primitives/display/Timeline/engines/rustic.tsx', ['rottay-timeline-pulse']],
      ['primitive-motion.css', 'components/primitives/display/Tree/engines/modern.tsx', ['rottay-drop-indicator']],
      [
        'primitive-motion.css',
        'components/primitives/display/Tree/engines/rustic.tsx',
        ['rottay-tree-spin', 'rottay-tree-drop-line-in'],
      ],
      ['navigation-static.css', 'components/primitives/navigation/Tabs/engines/modern.tsx', ['rottay-tabs-fade-in']],
    ] as const;

    for (const [skinName, sourcePath, names] of families) {
      const skin = readSkin(skinName);
      const source = readSource(sourcePath);
      for (const name of names) {
        expect(skin).toContain(`@keyframes ${name}`);
        const skinConsumer = skin.replace(`@keyframes ${name}`, '');
        expect(source.includes(name) || skinConsumer.includes(name)).toBe(true);
      }
    }
  });

  it('retains the legacy Toast injector as a document-mutation-free no-op', () => {
    const source = readSource('components/primitives/feedback/Toast/utils/animations.ts');
    const implementation = source.slice(source.indexOf('export function injectToastStyles'));
    expect(implementation).not.toContain('document.createElement');
    expect(implementation).not.toContain('appendChild');
  });
});
