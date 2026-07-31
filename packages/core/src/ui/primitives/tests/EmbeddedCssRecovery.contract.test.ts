import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { TOAST_KEYFRAMES } from '../feedback/Toast/runtime/animation';

const srcRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const readSource = (path: string) => readFileSync(resolve(srcRoot, path), 'utf8');
const readSkin = (name: string) => readSource(`foundation/tokens/css/presentation/components/skin/${name}`);
/**
 * The engine-scoped owner. A later lane re-homed the modern half of two
 * recovered families out of the shared `presentation/components/skin` bucket
 * and into `runtime/engines/modern/skin`, where the rules are scoped to the
 * engine's own class pair plus `data-part`. The recovered payload did not
 * shrink — it moved — so this contract follows it instead of asserting that
 * the shared file still owns paint it deliberately gave up.
 */
const readEngineSkin = (name: string) =>
  readSource(`foundation/tokens/css/runtime/engines/modern/skin/${name}`);

const SKIN_HASHES = {
  'data-table-interactions.css': '607ed897c5f551cee44ade05cfed795e7fcf5966b2f7a2484409088942c4d615',
  'form-placeholders.css': 'c26b0d68812a0b668f5992cfa868ce8ee1c9b9047c7e7cbfe91b110d82ab2a8f',
  'navigation-static.css': 'a35d19035d60d802a89771759fe3a584deea6e982ac4fba08bfd6a52f5884d12',
  'primitive-motion.css': '6b88cc713c2552a668c6c056bbf8ba1dae05d44a827078a0e942b74a7d847e7a',
  'scroll-area.css': '70fbd93d168e046b039a0e68995fbc98f94e8d9e032ca1c1ee7ef20a06692e93',
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
      const normalizedValue = value
        .replace(/\s+/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .trim();
      return [prop, important ? `${normalizedValue} !important` : normalizedValue];
    })
  );
}

function ruleContracts(
  css: string,
  selector: string,
  rootOnly = true,
): Array<Record<string, string>> {
  const matches: Array<Record<string, string>> = [];
  const normalizedSelector = selector.replace(/\s+/g, ' ').trim();
  postcss.parse(css).walkRules((rule) => {
    if (
      (rootOnly && rule.parent?.type !== 'root') ||
      !rule.selectors.some((candidate) => candidate.replace(/\s+/g, ' ').trim() === normalizedSelector)
    ) return;
    matches.push(declarationMap(rule.nodes.filter((node) => node.type === 'decl')));
  });
  return matches;
}

function ruleContract(css: string, selector: string, rootOnly = true): Record<string, string> {
  const matches = ruleContracts(css, selector, rootOnly);
  expect(matches, `selector ${selector}`).toHaveLength(1);
  return matches[0];
}

function keyframeContract(css: string, name: string): Record<string, Record<string, string>> {
  const matches: Array<Record<string, Record<string, string>>> = [];
  postcss.parse(css).walkAtRules('keyframes', (atRule) => {
    if (atRule.params !== name) return;
    const frames: Record<string, Record<string, string>> = {};
    atRule.walkRules((rule) => {
      frames[rule.selector.replace(/\s+/g, ' ').trim()] = declarationMap(
        rule.nodes.filter((node) => node.type === 'decl')
      );
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

/** New owners of the relocated modern payload. */
const RELOCATED = {
  scrollAreaModern: readEngineSkin('scroll-area.css'),
  tabsModern: readEngineSkin('tabs.css'),
  foundationKeyframes: readSource('foundation/tokens/css/foundation/animations/keyframes.css'),
};

/** Engine-scoped selector prefixes of the two families that moved. */
const MODERN_SCROLL_AREA = ".rottay-scroll-area.rottay-scroll-area--modern[data-part='root']";
const MODERN_TABS = ".rottay-tabs--modern[data-part='root']";

describe('WO-SKIN-06 embedded CSS recovery — exact static payload', () => {
  it('pins all six audited stylesheets byte-for-byte', () => {
    for (const [name, expectedHash] of Object.entries(SKIN_HASHES)) {
      const actualHash = createHash('sha256').update(readSkin(name)).digest('hex');
      expect(actualHash, name).toBe(expectedHash);
    }
  });

  it('accounts for every classified declaration across the audited and relocated owners', () => {
    // The audited six. `dataTable` grew when its paint was tokenized (one
    // literal became a token plus its fallback); `scrollArea` and `navigation`
    // shrank by exactly the modern rules that moved to the engine-scoped
    // owners asserted below. Nothing was dropped.
    expect({
      dataTable: paintCount(SKINS.dataTable),
      primitiveMotion: paintCount(SKINS.primitiveMotion),
      toast: paintCount(SKINS.toast),
      scrollArea: paintCount(SKINS.scrollArea),
      navigation: paintCount(SKINS.navigation),
      formPlaceholders: paintCount(SKINS.formPlaceholders),
    }).toEqual({
      dataTable: 32,
      primitiveMotion: 8,
      toast: 20,
      scrollArea: 18,
      navigation: 3,
      formPlaceholders: 2,
    });

    // The relocated modern ScrollArea payload, in its new single owner.
    expect(paintCount(RELOCATED.scrollAreaModern)).toBe(15);
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
      width: 'var(--ds-table-resize-bar-width-active, 0.1875rem)',
      height: 'var(--ds-table-resize-bar-height-active, 74%)',
      background: 'var(--ds-table-resize-bg-hover, var(--ds-color-primary))',
      'box-shadow': '0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 9%, transparent)',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) .ds-resize-handle:focus-visible')
    ).toEqual({
      outline: '2px solid var(--ds-color-primary)',
      'outline-offset': '-2px',
      'border-radius': 'var(--ds-table-control-radius, var(--ds-radius-md, 0.5rem))',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) th[data-col-key]:hover')
    ).toEqual({
      'background-color':
        'var(--ds-table-header-bg-hover, color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent))',
    });
    expect(
      ruleContract(
        SKINS.dataTable,
        '.ds-engine-modern:where(.ds-pattern-data-table) th[data-col-key][data-sortable="true"]:focus-visible'
      )
    ).toEqual({
      outline: '2px solid var(--ds-color-primary)',
      'outline-offset': '-2px',
      'border-radius': 'var(--ds-table-control-radius, var(--ds-radius-md, 0.5rem))',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) tr[data-row-index]:focus-visible')
    ).toEqual({
      outline: 'none',
      'box-shadow': 'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 48%, transparent)',
      'background-color':
        'var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 6%, transparent))',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) td[data-editable="true"]')
    ).toEqual({
      cursor: 'text',
      transition:
        'background-color var(--ds-motion-feedback, var(--ds-motion-fast)) var(--ds-motion-ease-move, ease), box-shadow var(--ds-motion-feedback, var(--ds-motion-fast)) var(--ds-motion-ease-move, ease), transform var(--ds-motion-feedback, var(--ds-motion-fast)) var(--ds-motion-ease-move, ease)',
    });
    expect(
      ruleContracts(
        SKINS.dataTable,
        '.ds-engine-modern:where(.ds-pattern-data-table) td[data-editable="true"]:hover::after'
      )
    ).toHaveLength(0);
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) td[data-editable="true"]:hover')
    ).toEqual({
      background: 'color-mix(in srgb, var(--ds-color-primary) 4%, transparent)',
      'box-shadow': 'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 16%, transparent)',
    });
    expect(
      ruleContract(SKINS.dataTable, '.ds-engine-modern:where(.ds-pattern-data-table) td[data-editing="true"]')
    ).toEqual({
      overflow: 'visible',
      padding: '4px 6px',
      background: 'color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card))',
      'box-shadow':
        'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 30%, transparent), 0 8px 18px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
      animation:
        'ds-inline-edit-enter var(--ds-motion-reveal, var(--ds-motion-normal)) var(--ds-motion-ease-enter, var(--ds-motion-ease-out))',
    });
    expect(
      ruleContract(
        SKINS.dataTable,
        '.ds-engine-modern:where(.ds-pattern-data-table) td[data-cell-dirty="true"]::before'
      )
    ).toEqual({
      content: '""',
      position: 'absolute',
      'inset-block-start': '5px',
      'inset-inline-end': '5px',
      width: '6px',
      height: '6px',
      border: '1px solid var(--ds-surface-card, var(--ds-color-bg-elevated))',
      'border-radius': '999px',
      background: 'var(--ds-color-warning)',
      'box-shadow': '0 0 0 2px color-mix(in srgb, var(--ds-color-warning) 16%, transparent)',
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
    expect(ruleContract(SKINS.navigation, ".rottay-menu--modern details[open] > summary > [data-part='arrow-icon']")).toEqual({
      transform: 'rotate(90deg)',
    });
    expect(ruleContract(SKINS.navigation, '.rottay-menu--modern summary::-webkit-details-marker')).toEqual({
      display: 'none',
      content: "''",
    });

    // The Tabs half moved to the engine-scoped owner, which re-expressed the
    // former `[data-tabs-id]` instance hook as the engine class pair plus
    // `data-part`. Same two rules, anchored to a scope class instead of a
    // generated per-mount identifier.
    expect(
      ruleContract(RELOCATED.tabsModern, `${MODERN_TABS} [data-part='tab-list']::-webkit-scrollbar`)
    ).toEqual({
      display: 'none',
    });
    expect(
      ruleContract(RELOCATED.tabsModern, `${MODERN_TABS} [data-part='tab-button']:focus-visible`)
    ).toEqual({
      outline: 'var(--ds-focus-ring-width, 2px) solid var(--ds-focus-ring-color)',
      'outline-offset': 'calc(-1 * var(--ds-focus-ring-offset, 2px))',
    });

    // `ds-tabs-fade-in` now lives in the foundation keyframes owner and is
    // consumed by the rustic engine; modern reveals its panel with
    // `ds-tabs-panel-reveal`, defined in the same engine skin that uses it.
    expectKeyframeContracts(RELOCATED.foundationKeyframes, {
      'ds-tabs-fade-in': {
        from: { opacity: '0', transform: 'translateY(2px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
    });
    expect(RELOCATED.tabsModern).toContain('@keyframes ds-tabs-panel-reveal');
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

    // The modern track/thumb/hover/hide quartet moved to the engine-scoped
    // owner and stopped reading DaisyUI's private `--color-base-*` vocabulary
    // directly: it now resolves canonical `--ds-scroll-area-*` tokens with the
    // same visual fallback. The shared file keeps the size enum plus the
    // classic and rustic paint asserted below.
    const modernThumb =
      'var(--ds-scroll-area-thumb-bg, color-mix(in srgb, var(--ds-color-text-primary) 28%, transparent))';

    expect(
      ruleContract(RELOCATED.scrollAreaModern, `${MODERN_SCROLL_AREA}::-webkit-scrollbar-track`)
    ).toEqual({
      background: 'var(--ds-scroll-area-track-bg, transparent)',
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
    });
    expect(
      ruleContract(RELOCATED.scrollAreaModern, `${MODERN_SCROLL_AREA}::-webkit-scrollbar-thumb`)
    ).toEqual({
      background: modernThumb,
      'border-radius': 'var(--ds-scroll-area-scrollbar-radius)',
    });
    expect(
      ruleContract(
        RELOCATED.scrollAreaModern,
        `${MODERN_SCROLL_AREA}::-webkit-scrollbar-thumb:hover`,
        false,
      )
    ).toEqual({
      background:
        'var(--ds-scroll-area-thumb-bg-hover, color-mix(in srgb, var(--ds-color-text-primary) 48%, transparent))',
    });
    expect(
      ruleContract(
        RELOCATED.scrollAreaModern,
        `${MODERN_SCROLL_AREA}[data-hide-scrollbar='true']::-webkit-scrollbar-thumb`
      )
    ).toEqual({
      background: 'transparent',
    });
    expect(
      ruleContract(
        RELOCATED.scrollAreaModern,
        `${MODERN_SCROLL_AREA}[data-hide-scrollbar='true']:hover::-webkit-scrollbar-thumb`,
        false,
      )
    ).toEqual({
      background: modernThumb,
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

    for (const engine of ['classic', 'rustic']) {
      expect(SKINS.scrollArea).toContain(`.rottay-scroll-area-${engine}[data-hide-scrollbar='true']`);
    }
    expect(RELOCATED.scrollAreaModern).toContain(
      `${MODERN_SCROLL_AREA}[data-hide-scrollbar='true']`
    );

    // The modern owner carries its own copy of the closed size enum, so the
    // relocated rules keep resolving the same three sizes.
    for (const [size, width, radius] of [
      ['thin', '4px', '2px'],
      ['normal', '8px', '4px'],
      ['wide', '12px', '6px'],
    ] as const) {
      expect(
        ruleContract(RELOCATED.scrollAreaModern, `${MODERN_SCROLL_AREA}[data-scrollbar-size='${size}']`)
      ).toEqual({
        '--ds-scroll-area-scrollbar-size': width,
        '--ds-scroll-area-scrollbar-radius': radius,
      });
    }
  });
});

describe('WO-SKIN-06 embedded CSS recovery — producer and hook contract', () => {
  const producerFreeSources = [
    'ui/patterns/data/data-table/engines/modern/index.tsx',
    'ui/patterns/data/data-table/engines/rustic/index.tsx',
    'ui/primitives/display/Timeline/engines/rustic/index.tsx',
    'ui/primitives/display/Tree/engines/modern/index.tsx',
    'ui/primitives/display/Tree/engines/rustic/index.tsx',
    'ui/primitives/layout/ScrollArea/engines/modern/index.tsx',
    'ui/primitives/layout/ScrollArea/engines/classic/index.tsx',
    'ui/primitives/layout/ScrollArea/engines/rustic/index.tsx',
    'ui/primitives/navigation/Menu/engines/modern/index.tsx',
  ];

  it.each(producerFreeSources)('%s no longer creates a stylesheet', (path) => {
    const source = readSource(path);
    expect(source).not.toMatch(/<style(?:\s|>)/);
    expect(source).not.toContain("createElement('style')");
    expect(source).not.toContain('createElement("style")');
  });

  it('keeps only certified responsive producers in Input, Select and Tabs', () => {
    const input = readSource('ui/primitives/inputs/Input/engines/modern/index.tsx');
    const select = readSource('ui/primitives/inputs/Select/engines/modern/index.tsx');
    const tabs = readSource('ui/primitives/navigation/Tabs/engines/modern/index.tsx');

    expect(input).not.toContain('ds-input-ph-');
    expect(input).not.toContain('::placeholder');
    expect(input.match(/<style/g)).toHaveLength(1);

    expect(select).not.toContain('ds-sel-search-');
    expect(select).not.toContain('searchPlaceholderCSS');
    expect(select.match(/<style/g)).toHaveLength(2);
    expect(select.match(/className="rottay-select__search-input"/g)).toHaveLength(1);

    expect(tabs).not.toContain('::webkit-scrollbar');
    expect(tabs).not.toContain('@keyframes ds-tabs-fade-in');
    expect(tabs.match(/<style/g)).toHaveLength(1);
  });

  it('stamps every ScrollArea engine with the closed state contract', () => {
    for (const engine of ['modern', 'classic', 'rustic']) {
      const source = readSource(`ui/primitives/layout/ScrollArea/engines/${engine}/index.tsx`);
      expect(source).toContain(`rottay-scroll-area-${engine}`);
      expect(source).toContain('data-scrollbar-size={scrollbarSize}');
      expect(source).toMatch(/data-hide-scrollbar=\{hideScrollbar \? ["']true["'] : ["']false["']\}/);
    }
  });

  it('keeps every extracted animation name connected to its component', () => {
    const SKIN_DIR = 'foundation/tokens/css/presentation/components/skin';

    // Each row is [stylesheet that defines the frames, the engine that plays
    // them, the names]. A keyframe may be defined by a shared owner, but it
    // must always stay reachable from a real consumer.
    const families = [
      [
        `${SKIN_DIR}/data-table-interactions.css`,
        'ui/patterns/data/data-table/engines/modern/index.tsx',
        ['ds-inline-edit-enter', 'ds-data-table-shimmer'],
      ],
      [
        `${SKIN_DIR}/data-table-interactions.css`,
        'ui/patterns/data/data-table/engines/rustic/index.tsx',
        ['ds-spin', 'ds-bulk-slide-down'],
      ],
      [
        `${SKIN_DIR}/primitive-motion.css`,
        'ui/primitives/display/Timeline/engines/rustic/index.tsx',
        ['rottay-timeline-pulse'],
      ],
      // Tree's modern paint moved to its engine skin, so the skin — not the
      // .tsx — is now what plays the frame. The component connection is
      // re-proved below through the part the skin targets.
      [
        `${SKIN_DIR}/primitive-motion.css`,
        'foundation/tokens/css/runtime/engines/modern/skin/tree.css',
        ['rottay-drop-indicator'],
      ],
      [
        `${SKIN_DIR}/primitive-motion.css`,
        'ui/primitives/display/Tree/engines/rustic/index.tsx',
        ['rottay-tree-spin', 'rottay-tree-drop-line-in'],
      ],
      // Relocated: the frames are foundation-owned and the surviving consumer
      // is the rustic engine.
      [
        'foundation/tokens/css/foundation/animations/keyframes.css',
        'ui/primitives/navigation/Tabs/engines/rustic/index.tsx',
        ['ds-tabs-fade-in'],
      ],
      // Modern's replacement frame is defined and consumed in one owner.
      [
        'foundation/tokens/css/runtime/engines/modern/skin/tabs.css',
        'ui/primitives/navigation/Tabs/engines/modern/index.tsx',
        ['ds-tabs-panel-reveal'],
      ],
    ] as const;

    for (const [stylesheetPath, sourcePath, names] of families) {
      const stylesheet = readSource(stylesheetPath);
      const source = readSource(sourcePath);
      for (const name of names) {
        expect(stylesheet, stylesheetPath).toContain(`@keyframes ${name}`);
        const styleSheetConsumer = stylesheet.replace(`@keyframes ${name}`, '');
        expect(source.includes(name) || styleSheetConsumer.includes(name), name).toBe(true);
      }
    }

    // Close the one chain that runs through a skin: the rule that plays
    // `rottay-drop-indicator` targets `[data-part='drop-indicator']`, and the
    // modern Tree engine is what renders that part. If either end moves, the
    // animation is orphaned and this fails.
    expect(readSource('foundation/tokens/css/runtime/engines/modern/skin/tree.css')).toMatch(
      /\[data-part='drop-indicator'\][^{]*\{[^}]*animation:\s*rottay-drop-indicator/
    );
    expect(readSource('ui/primitives/display/Tree/engines/modern/index.tsx')).toContain(
      'data-part="drop-indicator"'
    );
  });

  it('retains the legacy Toast injector as a document-mutation-free no-op', () => {
    const source = readSource('ui/primitives/feedback/Toast/runtime/animation/index.ts');
    const implementation = source.slice(source.indexOf('export function injectToastStyles'));
    expect(implementation).not.toContain('document.createElement');
    expect(implementation).not.toContain('appendChild');
  });
});
