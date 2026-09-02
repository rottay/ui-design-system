/**
 * WO-CRA-23 primitives census — read-only render harness.
 *
 * TO RUN, copy this file into `src/ui/primitives/tests/` and delete it after:
 *
 *   cp test-artifacts/quality-evidence/wo-cra-23/harness/primitives/render-census.test.tsx \
 *      src/ui/primitives/tests/
 *   npx vitest run --project unit src/ui/primitives/tests/render-census.test.tsx
 *   rm src/ui/primitives/tests/render-census.test.tsx
 *
 * It must live under `src/` because the vitest `unit` project includes
 * `src/**` only, and because the `import.meta.glob` specifiers below are
 * relative to `src/ui/primitives/tests/`. It writes its output back into the
 * harness directory, so the JSON beside this file is always the last run.
 *
 * Renders every engine implementation twice — once bare, once with a caller
 * `data-part` — plus a third time with a probe `style` and `className`.
 * Nothing here asserts a product invariant; every assertion is on the HARNESS,
 * because a render census that renders nothing passes everything. Two of those
 * assertions have already earned their place: one caught the walk passing
 * `engine=` to a provider whose prop is `defaultEngine` (rendering the default
 * engine three times and reading it as three engines agreeing), and one caught
 * a style probe that could not discriminate.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { writeFileSync } from 'node:fs';
import React from 'react';
import { I18nProvider } from '@/infrastructure/runtime/i18n/runtime/context/provider';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

/**
 * Minimum props for the primitives whose render throws on an empty prop bag.
 * Without these the census silently under-reports exactly the collection-shaped
 * primitives (Steps, Tabs, Breadcrumb, Segmented, Transfer) that carry the most
 * chrome.
 */
const MIN_PROPS: Record<string, Record<string, unknown>> = {
  'navigation/Breadcrumb': { items: [{ title: 'a' }, { title: 'b' }] },
  'navigation/Segmented': { options: ['a', 'b'], value: 'a' },
  'navigation/Steps': { items: [{ title: 'a' }, { title: 'b' }], current: 0 },
  'navigation/Stepper': { steps: [{ id: 'a', title: 'a' }, { id: 'b', title: 'b' }], current: 0 },
  'navigation/Tabs': { items: [{ key: 'a', label: 'a', children: 'a' }], activeKey: 'a' },
  'navigation/Menu': { items: [{ key: 'a', label: 'a' }] },
  'inputs/Transfer': { dataSource: [], targetKeys: [] },
  'inputs/Cascader': { options: [] },
  'inputs/Select': { options: [{ label: 'a', value: 'a' }] },
  'inputs/TreeSelect': { treeData: [] },
  'overlay/Tour': { steps: [{ title: 'a', description: 'a' }], open: false },
  'overlay/ContextMenu': { items: [{ key: 'a', label: 'a' }] },
  'overlay/Dropdown': { items: [{ key: 'a', label: 'a' }] },
  'display/Table': { columns: [], dataSource: [] },
  'display/Tree': { treeData: [] },
  'display/Timeline': { items: [{ children: 'a' }] },
  'display/List': { dataSource: ['a'] },
  'display/Descriptions': { items: [{ key: 'a', label: 'a', children: 'a' }] },
  'display/Carousel': { items: [] },
  'display/Calendar': {},
  'inputs/Form': { fields: [] },
  'patterns/x': {},
};

const PROBE = 'caller-probe-part';
// vitest runs with cwd = packages/core, so this reaches the harness directory
// from wherever under src/ the file has been copied.
const OUT = 'test-artifacts/quality-evidence/wo-cra-23/harness/primitives/render-census.json';

const modules = import.meta.glob('../*/*/engines/*/index.tsx');
// The composed layer is what product code imports: call sites resolve
// `Typography/compound/Text`, never `Typography/engines/modern`. A census of the
// engine modules alone measures a layer no caller touches directly.
const compounds = import.meta.glob('../*/*/compound/*/index.tsx');

type Row = {
  primitive: string;
  engine: string;
  exportName: string;
  ok: boolean;
  error?: string;
  rootTag?: string;
  rootClasses?: string[];
  rootPart?: string | null;
  rootPartWithCaller?: string | null;
  callerPartReaches?: boolean;
  callerPartOnRoot?: boolean;
  partsInTree?: string[];
  partsInTreeWithCaller?: string[];
  style?: Record<string, unknown>;
};

function componentsOf(mod: Record<string, unknown>): [string, unknown][] {
  const out: [string, unknown][] = [];
  for (const [k, v] of Object.entries(mod)) {
    if (!v) continue;
    const t = typeof v;
    const isComp = t === 'function' ||
      (t === 'object' && ((v as any).$$typeof || (v as any).render));
    // A lowercase-named function export is a helper (resolveX, useY), not a
    // component; rendering it produces noise rows, not measurements.
    if (isComp && (k === 'default' || /^[A-Z]/.test(k))) out.push([k, v]);
  }
  // The default export leads: it is the engine's root component.
  out.sort((a, b) => (a[0] === 'default' ? -1 : b[0] === 'default' ? 1 : 0));
  return out.slice(0, 8);
}

function partsIn(el: Element): string[] {
  return Array.from(el.querySelectorAll('[data-part]'))
    .map((n) => n.getAttribute('data-part') as string);
}

describe('WO-CRA-23 primitive render census', () => {
  it('renders every engine implementation and records its part anatomy', async () => {
    const rows: Row[] = [];

    for (const [path, load] of Object.entries(modules)) {
      const m = path.match(/\.\.\/([^/]+)\/([^/]+)\/engines\/([^/]+)\/index\.tsx$/);
      if (!m) continue;
      const [, category, name, engine] = m;
      const primitive = `${category}/${name}`;

      let mod: Record<string, unknown>;
      try {
        mod = (await load()) as Record<string, unknown>;
      } catch (e) {
        rows.push({ primitive, engine, exportName: '(import)', ok: false, error: String(e).slice(0, 200) });
        continue;
      }

      const comps = componentsOf(mod);
      if (!comps.length) {
        rows.push({ primitive, engine, exportName: '(none)', ok: false, error: 'no component export' });
        continue;
      }
      // Probe EVERY component export, not just the default. `Text` is a named
      // export of the Typography engine module and carries 306 call sites — a
      // default-only walk reports on `Heading` and calls it Typography.
      for (const [exportName, Comp] of comps) {

      const attempt = (extra: Record<string, unknown>) => {
        const { container, unmount } = render(
          React.createElement(
            I18nProvider,
            null,
            React.createElement(Comp as any, { ...(MIN_PROPS[primitive] ?? {}), ...extra }, 'x')
          )
        );
        const root = container.firstElementChild;
        // Everything is read off the live DOM here: after `unmount()` the node is
        // detached and a later read is not a measurement of what rendered.
        const info = {
          rootTag: root?.tagName.toLowerCase(),
          rootClasses: root ? Array.from(root.classList) : [],
          rootPart: root?.getAttribute('data-part') ?? null,
          rootStyle: root?.getAttribute('style') ?? '',
          rootHasProbeClass: !!root?.classList.contains('probe-class'),
          parts: root ? [root.getAttribute('data-part'), ...partsIn(root)].filter(Boolean) as string[] : [],
          html: container.innerHTML,
        };
        unmount();
        return info;
      };

      try {
        const bare = attempt({});
        let withCaller: ReturnType<typeof attempt> | null = null;
        try { withCaller = attempt({ 'data-part': PROBE }); } catch { /* recorded below */ }

        // Class 2 — does an inline `style` survive, and does every declaration in
        // it survive? A primitive can keep the object and drop one key.
        let style: Record<string, unknown> = {};
        try {
          const s = attempt({
            style: {
              fontSize: 'var(--probe-fs)',
              fontFamily: 'var(--probe-ff)',
              color: 'var(--probe-color)',
              marginTop: '3px',
            },
            className: 'probe-class',
          });
          const rootStyle = s.rootStyle;
          const anyStyle = s.html;
          style = {
            styleOnRoot: rootStyle.slice(0, 400),
            fontSizeOnRoot: rootStyle.includes('--probe-fs'),
            fontFamilyOnRoot: rootStyle.includes('--probe-ff'),
            colorOnRoot: rootStyle.includes('--probe-color'),
            marginTopOnRoot: /margin-top:\s*3px/.test(rootStyle),
            fontSizeAnywhere: anyStyle.includes('--probe-fs'),
            fontFamilyAnywhere: anyStyle.includes('--probe-ff'),
            colorAnywhere: anyStyle.includes('--probe-color'),
            marginTopAnywhere: /margin-top:\s*3px/.test(anyStyle),
            classOnRoot: s.rootHasProbeClass,
            classAnywhere: anyStyle.includes('probe-class'),
          };
        } catch (e) {
          style = { error: String(e).slice(0, 120) };
        }

        rows.push({
          primitive, engine, exportName, ok: true,
          rootTag: bare.rootTag,
          rootClasses: bare.rootClasses,
          rootPart: bare.rootPart,
          rootPartWithCaller: withCaller ? withCaller.rootPart : null,
          callerPartReaches: withCaller ? withCaller.html.includes(PROBE) : false,
          callerPartOnRoot: withCaller ? withCaller.rootPart === PROBE : false,
          partsInTree: [...new Set(bare.parts)],
          partsInTreeWithCaller: withCaller ? [...new Set(withCaller.parts)] : [],
          style,
        });
      } catch (e) {
        rows.push({ primitive, engine, exportName, ok: false, error: String(e).slice(0, 200) });
      }
      }
    }

    writeFileSync(OUT, JSON.stringify(rows, null, 1));

    // ---- positive control on the HARNESS itself -----------------------------
    // A census that renders nothing reports nothing and looks clean. These
    // assertions fail if the glob, the loader or the DOM read stops working.
    const rendered = rows.filter((r) => r.ok);
    expect(rows.length).toBeGreaterThan(200);        // 89 primitives x 3 engines
    expect(rendered.length).toBeGreaterThan(100);    // the walk actually mounted things

    // Known ground truth, pinned by Button.passthrough-contract.test.tsx:
    // modern lets the caller's part win, rustic keeps 'trigger', classic stamps it.
    const btn = (e: string) => rows.find((r) => r.primitive === 'inputs/Button' && r.engine === e);
    expect(btn('modern')?.rootPart).toBe('trigger');
    expect(btn('modern')?.callerPartOnRoot).toBe(true);
    expect(btn('rustic')?.rootPart).toBe('trigger');
    expect(btn('rustic')?.callerPartOnRoot).toBe(false);
    expect(btn('classic')?.callerPartOnRoot).toBe(false);

    // The style probe must DISCRIMINATE. A field that is constant across 266
    // rows is not measuring anything, and would report either "nobody drops a
    // style" or "everybody does" with equal confidence.
    const kept = rendered.filter((r) => (r.style as any)?.fontSizeOnRoot === true).length;
    const dropped = rendered.filter((r) => (r.style as any)?.fontSizeOnRoot === false).length;
    expect(kept).toBeGreaterThan(20);
    expect(dropped).toBeGreaterThan(0);
  }, 180000);

  it('renders every COMPOSED compound under each engine', async () => {
    const rows: any[] = [];
    for (const [path, load] of Object.entries(compounds)) {
      const m = path.match(/\.\.\/([^/]+)\/([^/]+)\/compound\/([^/]+)\/index\.tsx$/);
      if (!m) continue;
      const [, category, name, compound] = m;
      const primitive = `${category}/${name}`;
      let mod: Record<string, unknown>;
      try { mod = (await load()) as Record<string, unknown>; }
      catch (e) { rows.push({ primitive, compound, ok: false, error: String(e).slice(0, 160) }); continue; }
      const comps = componentsOf(mod);
      if (!comps.length) { rows.push({ primitive, compound, ok: false, error: 'no component export' }); continue; }
      const [exportName, Comp] = comps[0];

      for (const engine of ['classic', 'modern', 'rustic'] as const) {
        const run = (extra: Record<string, unknown>) => {
          const { container, unmount } = render(
            React.createElement(I18nProvider, null,
              // `defaultEngine`, not `engine`: passing the wrong name silently
              // renders the default three times and reads as three agreeing engines.
              React.createElement(EngineProvider, { defaultEngine: engine } as any,
                React.createElement(Comp as any, { ...(MIN_PROPS[primitive] ?? {}), ...extra }, 'x')))
          );
          const root = container.firstElementChild;
          const info = {
            rootTag: root?.tagName.toLowerCase(),
            rootPart: root?.getAttribute('data-part') ?? null,
            rootStyle: root?.getAttribute('style') ?? '',
            classOnRoot: !!root?.classList.contains('probe-class'),
            html: container.innerHTML,
          };
          unmount();
          return info;
        };
        try {
          const bare = run({});
          const caller = run({ 'data-part': PROBE });
          const styled = run({
            style: { fontSize: 'var(--probe-fs)', fontFamily: 'var(--probe-ff)', color: 'var(--probe-color)', marginTop: '3px' },
            className: 'probe-class',
          });
          rows.push({
            primitive, compound, exportName, engine, ok: true,
            rootTag: bare.rootTag, rootPart: bare.rootPart,
            callerPartOnRoot: caller.rootPart === PROBE,
            callerPartAnywhere: caller.html.includes(PROBE),
            fontSizeOnRoot: styled.rootStyle.includes('--probe-fs'),
            fontFamilyOnRoot: styled.rootStyle.includes('--probe-ff'),
            colorOnRoot: styled.rootStyle.includes('--probe-color'),
            marginTopOnRoot: /margin-top:\s*3px/.test(styled.rootStyle),
            fontSizeAnywhere: styled.html.includes('--probe-fs'),
            fontFamilyAnywhere: styled.html.includes('--probe-ff'),
            classOnRoot: styled.classOnRoot,
            classAnywhere: styled.html.includes('probe-class'),
            rootStyle: styled.rootStyle.slice(0, 400),
          });
        } catch (e) {
          rows.push({ primitive, compound, exportName, engine, ok: false, error: String(e).slice(0, 160) });
        }
      }
    }
    writeFileSync(OUT.replace('.json', '-compounds.json'), JSON.stringify(rows, null, 1));
    expect(rows.length).toBeGreaterThan(60);
    expect(rows.filter((r) => r.ok).length).toBeGreaterThan(40);
    // The engine switch must actually take effect, or every row is one engine
    // measured three times.
    const text = rows.filter((r) => r.primitive === 'display/Typography' && r.compound === 'Text' && r.ok);
    expect(text.length).toBe(3);
    expect(new Set(text.map((r) => r.callerPartOnRoot)).size).toBe(2);
  }, 180000);

  it('probes Text across the prop combinations that could suppress an inline fontSize', async () => {
    const { Text } = await import('../display/Typography/compound/Text');
    const combos: Record<string, Record<string, unknown>> = {
      'bare': {},
      'size=sm': { size: 'sm' },
      'size=lg': { size: 'lg' },
      'textStyle=body': { textStyle: 'body' },
      'textStyle=caption': { textStyle: 'caption' },
      'as=label': { as: 'label' },
      'fluid': { fluid: true },
      'monospace': { monospace: true },
      'truncate': { truncate: true },
      'size responsive': { size: { base: 'sm', md: 'lg' } },
    };
    const out: any[] = [];
    for (const engine of ['classic', 'modern', 'rustic'] as const) {
      for (const [label, props] of Object.entries(combos)) {
        const { container, unmount } = render(
          React.createElement(I18nProvider, null,
            React.createElement(EngineProvider, { defaultEngine: engine } as any,
              React.createElement(Text as any, {
                ...props,
                style: { fontSize: 'var(--probe-fs)', fontFamily: 'var(--probe-ff)' },
              }, 'x')))
        );
        const el = container.querySelector('[data-part]') ?? container.firstElementChild;
        const s = el?.getAttribute('style') ?? '';
        out.push({ engine, combo: label, fontSize: s.includes('--probe-fs'), fontFamily: s.includes('--probe-ff'), style: s.slice(0, 200) });
        unmount();
      }
    }
    writeFileSync(OUT.replace('.json', '-text-matrix.json'), JSON.stringify(out, null, 1));
    expect(out.length).toBe(30);
  }, 120000);
});
