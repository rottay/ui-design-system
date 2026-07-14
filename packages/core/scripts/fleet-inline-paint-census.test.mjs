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
  new URL("../src/components/", import.meta.url)
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
    write(componentsDir, "patterns/data/engines/classic.tsx");
    write(componentsDir, "patterns/data/classic/index.tsx");
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

test("counter covers the productive false-zero regressions", () => {
  const cases = new Map([
    ["primitives/layout/Box/engines/modern.tsx", 10],
    ["primitives/layout/Box/engines/rustic.tsx", 10],
    ["primitives/inputs/Input/compound/Group/index.tsx", 8],
    ["surfaces/foundation/personality-helpers.tsx", 1],
    ["primitives/display/Card/engines/rustic.tsx", 1],
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
