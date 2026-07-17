import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  ARC09_INLINE_PAINT_FILES,
  collectFleetInlinePaintSourceFiles,
  isFleetInlinePaintSourceFile,
} from "./lib/fleet-inline-paint-census.mjs";
import { countArc09PaintInFile } from "./lib/inline-paint-counter.mjs";

const COMPONENTS_DIR = fileURLToPath(
  new URL("../src/ui/", import.meta.url)
);

function write(root, path) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, "export const value = 1;\n");
}

test("fleet census enumerates zero files but excludes classic, catalog noise, and ARC-09", () => {
  const componentsDir = mkdtempSync(join(tmpdir(), "fleet-inline-census-"));
  try {
    write(componentsDir, "primitives/inputs/Field/index.tsx");
    write(componentsDir, "patterns/misc/leaf.ts");
    write(componentsDir, "structures/workspace/tests/example.tsx");
    write(componentsDir, "surfaces/pages/example.test.tsx");
    write(componentsDir, "surfaces/pages/example.stories.tsx");
    write(componentsDir, "patterns/data/Example.types.ts");
    write(componentsDir, "patterns/data/example/contracts/index.ts");
    write(componentsDir, "patterns/data/example/engines/classic/index.tsx");
    write(componentsDir, "patterns/data/example/classic/index.tsx");
    // Historical census law keeps these named helpers even though actual
    // `.stories.*`, `.test.*`, and `/test(s)/` catalog files are excluded.
    write(componentsDir, "surfaces/foundation/common/story-helpers.tsx");
    write(componentsDir, "surfaces/foundation/common/test-utils.tsx");
    write(componentsDir, "tokens/not-a-component.ts");
    for (const path of ARC09_INLINE_PAINT_FILES) write(componentsDir, path);

    assert.deepEqual(
      collectFleetInlinePaintSourceFiles(componentsDir).map((file) =>
        relative(realpathSync(componentsDir), file).replaceAll("\\", "/")
      ),
      [
        "patterns/misc/leaf.ts",
        "primitives/inputs/Field/index.tsx",
        "surfaces/foundation/common/story-helpers.tsx",
        "surfaces/foundation/common/test-utils.tsx",
      ]
    );
    for (const path of ARC09_INLINE_PAINT_FILES) {
      assert.equal(isFleetInlinePaintSourceFile(path), false);
    }
  } finally {
    rmSync(componentsDir, { recursive: true, force: true });
  }
});

test("counter sees CSSProperties mutations, style shorthand, and merge aliases exactly once", () => {
  const source = `
    import type { CSSProperties } from 'react';
    const color = 'red';
    const background = 'black';
    const boxShadow = 'none';
    const cardStyle: CSSProperties = { color };
    const alias = cardStyle;
    alias.background = background;
    alias.borderColor = color;
    Object.assign(alias, { boxShadow });
    alias.width = 10;
    const node = <div style={alias} />;
  `;
  assert.equal(countArc09PaintInFile(source), 4);
});

test("counter keeps aliases scope-aware when a data binding shadows a style sink", () => {
  const source = `
    const candidate = {};
    const node = <div style={candidate} />;
    candidate.color = 'red';
    function mutateData() {
      const candidate = {};
      candidate.color = 'metadata';
    }
  `;
  assert.equal(countArc09PaintInFile(source), 1);
});

test("counter resolves local style helpers and fails closed for opaque roots", () => {
  const source = `
    import { importedStyle, getExternalStyle } from './external';
    const color = 'red';
    const getLocalStyle = () => ({ color });
    function buildLocalStyle() { return { background: 'black' }; }
    const a = <div style={getLocalStyle()} />;
    const b = <div style={buildLocalStyle()} />;
    const c = <div style={importedStyle} />;
    const d = <div style={getExternalStyle()} />;
  `;
  // local shorthand + local explicit key + two deduped opaque roots
  assert.equal(countArc09PaintInFile(source), 4);
});

test("counter proves closed local factories, maps, hooks, state, and consumer-derived bags", () => {
  const source = `
    import React, { useMemo, useState } from 'react';
    const SIZES = {
      sm: { label: { fontSize: 12 } },
      lg: { label: { fontSize: 16 } },
    };
    const factory = () => ({ root: { width: 10 } });
    function Component({ styles, items, size }) {
      const local = SIZES[size];
      const made = factory();
      const memo = useMemo(() => ({ width: 2 }), []);
      const [state, setState] = useState({ panel: { width: 3 } });
      setState({ panel: { width: 4 } });
      return <>
        {items.map((item) => <i style={item.style} />)}
        <i style={styles?.root} />
        <i style={local.label} />
        <i style={made.root} />
        <i style={memo} />
        <i style={state.panel} />
      </>;
    }
  `;
  assert.equal(countArc09PaintInFile(source), 0);
});

test("counter keeps unknown factory and spread provenance fail-closed", () => {
  const source = `
    import { externalRegistry } from './external';
    const registry = { safe: { width: 1 }, ...externalRegistry };
    const first = <div style={registry[getKey()]} />;
    const getExternal = () => unknownStyleFactory();
    const second = <div style={getExternal()} />;
  `;
  assert.equal(countArc09PaintInFile(source), 2);

  const localPaint = `
    const color = 'red';
    const factories = { card: () => ({ color }) };
    const node = <div style={factories.card()} />;
  `;
  assert.equal(countArc09PaintInFile(localPaint), 1);

  const nestedLocalSpread = `
    const color = 'red';
    const extension = { danger: { color } };
    const registry = { safe: { width: 1 }, ...extension };
    const node = <div style={registry.danger} />;
  `;
  assert.equal(countArc09PaintInFile(nestedLocalSpread), 1);

  const unknownComputedMember = `
    const key = getKey();
    const registry = { [key]: { width: 1 } };
    const node = <div style={registry.safe} />;
  `;
  assert.equal(countArc09PaintInFile(unknownComputedMember), 1);

  const unknownStateUpdater = `
    function Component() {
      const [style, setStyle] = React.useState({ width: 1 });
      setStyle((previous) => unknownStyleFactory(previous));
      return <div style={style} />;
    }
  `;
  assert.equal(countArc09PaintInFile(unknownStateUpdater), 1);
});

test(
  "certified producers require an absolute canonical file and exact export",
  {
    concurrency: false,
  },
  () => {
    const liveFeed = join(
      COMPONENTS_DIR,
      "patterns/communication/live-feed/engines/modern/index.tsx"
    );
    const tooltip = join(
      COMPONENTS_DIR,
      "primitives/display/Tooltip/engines/rustic/index.tsx"
    );
    const previousCwd = process.cwd();
    process.chdir(tmpdir());
    try {
      assert.equal(
        countArc09PaintInFile(readFileSync(liveFeed, "utf8"), liveFeed),
        0
      );
      // PLACEMENT_MAP is certified, while the consumer's own effective
      // transition transform remains visible exactly once.
      assert.equal(
        countArc09PaintInFile(readFileSync(tooltip, "utf8"), tooltip),
        1
      );
    } finally {
      process.chdir(previousCwd);
    }

    const unregisteredExport = `
    import { TOOLTIP_DEFAULTS } from '../../contracts';
    const node = <div style={TOOLTIP_DEFAULTS} />;
  `;
    assert.equal(countArc09PaintInFile(unregisteredExport, tooltip), 1);

    const certifiedProducerMutation = `
    import { PLACEMENT_MAP } from '../../contracts';
    PLACEMENT_MAP.top.backgroundColor = 'red';
    PLACEMENT_MAP[getPlacement()][getPaintProperty()] = 'blue';
    const node = <div style={PLACEMENT_MAP.top} />;
  `;
    // Two authored writes plus the direct read, which is not protected by the
    // rustic engine's verified spread-then-transform overwrite contract.
    assert.equal(countArc09PaintInFile(certifiedProducerMutation, tooltip), 3);
  }
);

test("certified style producers expose every transparent style input", () => {
  const toolbar = join(
    COMPONENTS_DIR,
    "patterns/data/list-toolbar/engines/modern/index.tsx"
  );
  const card = join(COMPONENTS_DIR, "primitives/display/Card/index.tsx");
  const stack = join(
    COMPONENTS_DIR,
    "primitives/layout/Stack/engines/modern/index.tsx"
  );

  assert.equal(
    countArc09PaintInFile(
      `
      import { searchInputStyle } from '../tokens';
      const color = 'red';
      const node = <div style={searchInputStyle({ color })} />;
    `,
      toolbar
    ),
    1
  );
  assert.equal(
    countArc09PaintInFile(
      `
      import { mergePersonalityStyle } from '../../../../runtime/personality/primitives';
      const color = 'red';
      const local = { color };
      const node = <div style={mergePersonalityStyle(local, undefined)} />;
    `,
      card
    ),
    1
  );
  assert.equal(
    countArc09PaintInFile(
      `
      import { buildStackStyles } from '../../runtime/responsive';
      const color = 'red';
      const props = { style: { color } };
      const node = <div style={buildStackStyles(props)} />;
    `,
      stack
    ),
    1
  );
});

test("counter follows shorthand style prop bags and opaque intrinsic spreads", () => {
  const source = `
    const color = 'red';
    const style = { color };
    React.cloneElement(child, { style });
    React.createElement('div', { style });
    const opaque = getProps();
    const first = <div {...opaque} />;

    // Top-level HTML color is a DOM prop, not inline style.
    const safe = { color };
    const second = <div {...safe} />;
    function Consumer(props) {
      const { ...rest } = props;
      return <div {...rest} />;
    }
  `;
  assert.equal(countArc09PaintInFile(source), 2);
});

test("counter follows replacement assignments into style-map slots", () => {
  const source = `
    const color = 'red';
    const styles = { root: { width: 1 } };
    styles.root = { color };
    const local = <div style={styles.root} />;

    function Consumer(props) {
      props.styles.root ??= { color };
      return <div style={props.styles.root} />;
    }
  `;
  assert.equal(countArc09PaintInFile(source), 2);
});

test("counter resolves React factory aliases and fails closed on unknown tags", () => {
  const source = `
    import { createElement as h } from 'react';
    const fill = 'red';
    const stroke = 'blue';
    const color = 'pink';
    const tags = { path: 'path' };
    h(tags.path, { fill });
    const getTag = () => 'path';
    h(getTag(), { stroke });
    h(getUnknownTag(), { color });

    h(Widget, { fill });
    h('div', { fill });
  `;
  assert.equal(countArc09PaintInFile(source), 3);
});

test("counter covers opaque style constructors and modern CSS setter sinks", () => {
  const source = `
    const style: React.CSSProperties = {};
    const constructed = <div style={new StyleBag()} />;
    const awaited = <div style={await getStyle()} />;
    Reflect.defineProperty(style, 'color', { value: 'red' });
    element.attributeStyleMap.set('background-color', 'red');
    selection.style('color', 'red');

    // Runtime SVG owns these D3 presentation-paint setters.
    selection.style('fill', 'red');
    selection.style('width', '1px');
  `;
  assert.equal(countArc09PaintInFile(source), 5);
});

test("counter covers DOM writes, computed names, cloneElement, and SVG createElement bags", () => {
  const source = `
    import type { CSSProperties } from 'react';
    const fill = 'red';
    const stroke = 'blue';
    const style: CSSProperties = {};
    const dynamicProperty = getProperty();
    style['outlineColor'] = fill;
    style[dynamicProperty] = fill;
    style.setProperty('background-color', fill);
    style.setProperty(dynamicProperty, fill);
    element.style.color = fill;
    element.style.width = '10px';
    React.cloneElement(child, { fill, style: { stroke } });
    const pathProps = { fill };
    React.createElement('path', pathProps);
    React.createElement('div', { stroke });
  `;
  assert.equal(countArc09PaintInFile(source), 8);
});

test("counter fails closed on computed cloneElement props and direct nested style mutations", () => {
  const source = `
    const dynamicProperty = getProperty();
    React.cloneElement(<path />, { [dynamicProperty]: 'red' });

    const PLACEMENT_MAP = { top: { width: 10 } };
    PLACEMENT_MAP.top.backgroundColor = 'red';
    const node = <div style={PLACEMENT_MAP.top} />;

    function ConsumerMutation(props) {
      props.styles.root.backgroundColor = 'red';
      return <div style={props.styles.root} />;
    }
  `;
  assert.equal(countArc09PaintInFile(source), 3);
});

test("counter counts paint getters and fails closed on computed style getters", () => {
  const source = `
    const dynamicProperty = getProperty();
    const node = <div style={{
      get color() { return 'red'; },
      get [dynamicProperty]() { return 'blue'; },
      get width() { return 10; },
    }} />;
  `;
  assert.equal(countArc09PaintInFile(source), 2);
});

test("counter covers CSSOM text, style attributes, descriptor bags, and resolved SVG tags", () => {
  const source = `
    import type { CSSProperties } from 'react';
    const style: CSSProperties = {};
    const descriptorKey = getDescriptorKey();
    Object.defineProperties(style, getDescriptors());
    Object.defineProperties(style, {
      [descriptorKey]: { value: 'red' },
    });

    element.style.cssText = 'color: red; width: 10px';
    element.style.cssText = getCssText();
    element.style.cssText = '';
    element.setAttribute('style', 'background: red; opacity: 0.5');
    element.setAttribute(getAttributeName(), 'red');
    element.setAttributeNS(null, 'style', 'border-color: red');

    const tag = 'path';
    const dynamicTag = getTag();
    const fill = 'red';
    const stroke = 'blue';
    React.createElement(tag, { fill });
    React.createElement(dynamicTag, { stroke });
  `;
  assert.equal(countArc09PaintInFile(source), 8);
});

test("counter does not double-count lexical keys or DOM style writes", () => {
  const source = `
    const node = <div style={{ color: 'red' }} />;
    element.style.background = 'black';
    element.style.setProperty('border-color', 'red');
  `;
  assert.equal(countArc09PaintInFile(source), 3);
});

test("counter leaves DOM style nodes to embedded CSS but follows style sinks", () => {
  const source = `
    const style = document.createElement('style');
    style.textContent = '.root { color: red; }';
    document.head.appendChild(style);
    const namespacedStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    namespacedStyle.textContent = 'path { fill: red; }';
    const sheetStyle = new CSSStyleSheet();
    sheetStyle.insertRule('.root { border-color: red; }');
    const inlineStyle = '.root { color: red; }';

    const cardStyle = {};
    cardStyle.color = 'red';
    const node = <div style={cardStyle} />;
  `;
  assert.equal(countArc09PaintInFile(source), 1);
});

test("counter excludes caller-owned style bags but keeps local explicit paint", () => {
  const callerOnly = `
    const Component = ({ overlayStyle }) => (
      <div style={{ ...overlayStyle }} />
    );
    const { imageStyle } = props;
    const image = <img style={{ ...imageStyle }} />;
  `;
  assert.equal(countArc09PaintInFile(callerOnly), 0);

  const withLocalPaint = `
    const Component = ({ valueStyle, color }) => (
      <span style={{ ...valueStyle, color }} />
    );
  `;
  assert.equal(countArc09PaintInFile(withLocalPaint), 1);
});

test("counter preserves non-paint, type, destructuring, read, and consumer-style exclusions", () => {
  const source = `
    interface Shape { color: string; background: string }
    type Paint = { fill: string };
    const { color: incomingColor, bordered } = props;
    const color = incomingColor;
    const data = { color };
    data.color = 'metadata';
    palette.filter = 'domain-filter';
    function Component({ style }: { style?: React.CSSProperties }) {
      const read = style?.color;
      if (style) {
        style.borderCollapse = 'collapse';
        style.borderSpacing = 0;
        style.width = 10;
      }
      return <div style={style}>{read}</div>;
    }
    React.createElement(Widget, { color });
  `;
  assert.equal(countArc09PaintInFile(source), 0);
});

test("counter fails closed on malformed source instead of certifying zero", () => {
  assert.throws(
    () => countArc09PaintInFile("const style = { color: ;", "broken.tsx"),
    /Cannot count inline paint in broken\.tsx/
  );
});

test("counter pins the productive recovered residuals", () => {
  const cases = new Map([
    ["primitives/layout/Box/engines/modern/index.tsx", 8],
    ["primitives/layout/Box/engines/rustic/index.tsx", 8],
    ["primitives/inputs/Input/compound/Group/index.tsx", 0],
    ["surfaces/runtime/profile-defaults/personality/index.tsx", 0],
    ["primitives/display/Card/engines/rustic/index.tsx", 1],
  ]);
  for (const [relativePath, expected] of cases) {
    const file = join(COMPONENTS_DIR, relativePath);
    assert.equal(
      countArc09PaintInFile(readFileSync(file, "utf8"), file),
      expected,
      relativePath
    );
  }
});
