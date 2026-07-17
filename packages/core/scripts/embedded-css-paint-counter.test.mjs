import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  analyzeEmbeddedCssPaint,
  countEmbeddedCssPaintByFile,
  countEmbeddedCssPaintInFile,
} from "./lib/embedded-css-paint-counter.mjs";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const realBadgeSource = join(
  packageRoot,
  "src/ui/primitives/display/Badge/engines/modern/index.tsx"
);

function source(lines) {
  return lines.join("\n");
}

test("counts only the sanctioned paint declaration family in real style CSS", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const CSS = `",
      ".x {",
      "  background: red; background-color: blue;",
      "  border: 1px solid; border-collapse: collapse; border-spacing: 0;",
      "  outline-color: red; color: red;",
      "  box-shadow: none; text-shadow: none;",
      "  fill: red; stroke: blue; accent-color: red;",
      "  filter: blur(1px); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);",
      "  transform: scale(1);",
      "  width: 10px; padding: 2px; opacity: .5; --paint: red;",
      "}",
      "`;",
      "export const Example = () => <style>{CSS}</style>;",
    ])
  );

  assert.equal(result.classifiedPaint, 14);
  assert.equal(result.unclassified, 0);
  assert.equal(result.count, 14);
});

test("ignores CSS-shaped strings that are not injected through a style element", () => {
  assert.equal(
    countEmbeddedCssPaintInFile(
      source([
        "const documentation = '.fake { color: red; transform: scale(1) }';",
        "const payload = { css: `button { background: red }` };",
        "export const value = documentation + payload.css;",
      ])
    ),
    0
  );
});

test("template values remain classifiable while computed properties fail closed", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "export const Example = ({ tone, property, extraCss }) => (",
      "  <style>{`",
      "    .mark { color: ${tone}; ${property}: red; }",
      "    ${extraCss}",
      "  `}</style>",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 1);
  assert.equal(result.dynamicProperties, 1);
  assert.equal(result.parseFailures, 0);
  assert.equal(result.count, 2);
});

test("resolves constants and conditional custom CSS without double-counting", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const BASE = `.x { color: red; transform: scale(1); }`;",
      "export const Example = ({ customCss }) => (",
      "  <style dangerouslySetInnerHTML={{",
      "    __html: customCss ? `${BASE}\\n${customCss}` : BASE,",
      "  }} />",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 2);
  assert.equal(result.unclassified, 0);
  assert.equal(result.cssLiterals, 1);
  assert.equal(result.count, 2);
});

test("malformed embedded CSS fails closed instead of certifying zero", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const BROKEN = `.x { color: red;`;",
      "export const Example = () => <style>{BROKEN}</style>;",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.parseFailures, 1);
  assert.equal(result.unclassified, 1);
  assert.equal(result.count, 1);
});

test("counts DOM style injection through scoped element, tag, and sink aliases", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const STYLE_TAG = 'style';",
      "const SINK = 'textContent';",
      "const CSS = '.x { color: red; transform: scale(1); }';",
      "export function inject() {",
      "  const element = document.createElement(STYLE_TAG);",
      "  const alias = element;",
      "  alias[SINK] = CSS;",
      "  document.head.appendChild(alias);",
      "}",
    ])
  );

  assert.equal(result.classifiedPaint, 2);
  assert.equal(result.unknownSinks, 0);
  assert.equal(result.count, 2);
});

test("counts React.createElement props, DOM text nodes, and constructable sheets", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const A = '.a { background: red }';",
      "const B = '.b { border-color: blue }';",
      "const C = '.c { outline: none }';",
      "const html = { __html: A };",
      "const props = { dangerouslySetInnerHTML: html };",
      "React.createElement('style', { ...props });",
      "const style = document.createElement('style');",
      "style.appendChild(document.createTextNode(B));",
      "const sheet = new CSSStyleSheet();",
      "sheet.replaceSync(C);",
    ])
  );

  assert.equal(result.classifiedPaint, 3);
  assert.equal(result.unclassified, 0);
  assert.equal(result.count, 3);
});

test("computed DOM style tags and sinks fail closed", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const CSS = '.x { color: red }';",
      "export function inject(tag, sink) {",
      "  const maybeStyle = document.createElement(tag);",
      "  maybeStyle.textContent = CSS;",
      "  const style = document.createElement('style');",
      "  style[sink] = CSS;",
      "}",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 2);
  assert.equal(result.unclassified, 2);
  assert.equal(result.count, 2);
});

test("unresolved whole-root calls and properties fail closed", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "import { getCss } from './theme';",
      "export const Imported = () => <style>{getCss()}</style>;",
      "export const Computed = ({ theme }) => (",
      "  <style dangerouslySetInnerHTML={{ __html: theme.css }} />",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 2);
  assert.deepEqual(result.unknownSinkSites.map(({ kind }) => kind).sort(), [
    "unresolved-css-call-root",
    "unresolved-css-property-root",
  ]);
  assert.equal(result.count, 2);
});

test("certified runtime-data generators are explicit safe roots", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "import { generateResponsiveCSS } from '@/infrastructure/runtime/responsive/runtime/style-properties';",
      "export const Example = ({ entries }) => {",
      "  const responsive = entries.length ? generateResponsiveCSS('x', entries) : null;",
      "  return responsive && <style dangerouslySetInnerHTML={{ __html: responsive.css }} />;",
      "};",
    ]),
    realBadgeSource
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 0);
  assert.equal(result.count, 0);
});

test("a trusted producer name imported from another module is not certified", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "import { generateResponsiveCSS } from './evil';",
      "export const Example = ({ entries }) => {",
      "  const responsive = generateResponsiveCSS('x', entries);",
      "  return <style dangerouslySetInnerHTML={{ __html: responsive.css }} />;",
      "};",
    ]),
    "/repo/packages/core/src/ui/primitives/display/Badge/engines/modern/index.tsx"
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 1);
  assert.equal(result.unknownSinkSites[0].kind, "unresolved-css-property-root");
  assert.equal(result.count, 1);
});

test("a trusted producer path suffix outside the current core package is not certified", () => {
  const dir = mkdtempSync(join(tmpdir(), "embedded-css-evil-producer-"));
  const evilModule = join(
    dir,
    "src/infrastructure/runtime/responsive/runtime/style-properties/index.ts"
  );
  try {
    mkdirSync(dirname(evilModule), { recursive: true });
    writeFileSync(
      evilModule,
      "export const generateResponsiveCSS = () => ({ css: '' });\n"
    );
    const evilImport = evilModule.slice(0, -3);
    const result = analyzeEmbeddedCssPaint(
      source([
        `import { generateResponsiveCSS } from '${evilImport}';`,
        "export const Example = ({ entries }) => {",
        "  const responsive = generateResponsiveCSS('x', entries);",
        "  return <style dangerouslySetInnerHTML={{ __html: responsive.css }} />;",
        "};",
      ]),
      realBadgeSource
    );

    assert.equal(result.classifiedPaint, 0);
    assert.equal(result.unknownSinks, 1);
    assert.equal(
      result.unknownSinkSites[0].kind,
      "unresolved-css-property-root"
    );
    assert.equal(result.count, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a local shadow of a certified producer name is analyzed normally", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "function generateTenantCss() {",
      "  return '.local { color: red; transform: scale(1) }';",
      "}",
      "export const Example = () => <style>{generateTenantCss()}</style>;",
    ]),
    "/repo/packages/core/src/ui/example.tsx"
  );

  assert.equal(result.classifiedPaint, 2);
  assert.equal(result.unknownSinks, 0);
  assert.equal(result.count, 2);
});

test("scope-aware aliases, logical branches, arrays, and local getters do not false-zero", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const styles = { first: '.a { color: red }' };",
      "const getSecond = () => '.b { background: blue }';",
      "export const A = ({ enabled }) => <style>{enabled && [styles.first, getSecond()]}</style>;",
      "export function B() {",
      "  const CSS = '.c { border: 0 }';",
      "  return <style>{CSS}</style>;",
      "}",
      "export function C() {",
      "  const CSS = '.d { outline: 0 }';",
      "  return <style>{CSS}</style>;",
      "}",
    ])
  );

  assert.equal(result.classifiedPaint, 4);
  assert.equal(result.unclassified, 0);
  assert.equal(result.count, 4);
});

test("opaque JSX style props and dangerous HTML payloads fail closed", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "export const Example = ({ props, payload }) => (",
      "  <>",
      "    <style {...props} />",
      "    <style dangerouslySetInnerHTML={payload} />",
      "  </>",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 2);
  assert.deepEqual(result.unknownSinkSites.map(({ kind }) => kind).sort(), [
    "opaque-dangerous-html-payload",
    "opaque-style-props",
  ]);
  assert.equal(result.count, 2);
});

test("opaque computed and accessor style props fail closed", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const CSS = '.x { color: red }';",
      "const key = 'dangerouslySetInnerHTML';",
      "const props = { get dangerouslySetInnerHTML() { return { __html: CSS }; } };",
      "const payload = { get __html() { return CSS; } };",
      "export const Example = () => (",
      "  <>",
      "    <style {...props} />",
      "    <style dangerouslySetInnerHTML={payload} />",
      "    <style {...{ [key]: { __html: CSS } }} />",
      "  </>",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 3);
  assert.equal(result.count, 3);
});

test("counts style nodes returned by helpers, assigned later, and created from window.document", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const A = '.a { color: red }';",
      "const B = '.b { background: blue }';",
      "const C = '.c { border-color: green }';",
      "function makeStyle() { return window.document.createElement('style'); }",
      "const helperStyle = makeStyle();",
      "helperStyle.textContent = A;",
      "let reassignedStyle;",
      "reassignedStyle = window.document.createElement('style');",
      "reassignedStyle.innerHTML = B;",
      "const directStyle = window.document.createElement('style');",
      "directStyle.innerText = C;",
    ])
  );

  assert.equal(result.classifiedPaint, 3);
  assert.equal(result.unknownSinks, 0);
  assert.equal(result.count, 3);
});

test("a runtime-fragment visit cannot suppress a later whole-root failure", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "export const Example = ({ opaqueCss }) => (",
      "  <>",
      "    <style>{`${opaqueCss}`}</style>",
      "    <style>{opaqueCss}</style>",
      "  </>",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unknownSinks, 1);
  assert.equal(result.unknownSinkSites[0].kind, "unresolved-css-root");
  assert.equal(result.count, 1);
});

test("mode-aware visits still de-duplicate a literal reached as fragment and whole root", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const CSS = '.x { color: red }';",
      "export const Example = () => (",
      "  <>",
      "    <style>{`${CSS}`}</style>",
      "    <style>{CSS}</style>",
      "  </>",
      ");",
    ])
  );

  assert.equal(result.classifiedPaint, 1);
  assert.equal(result.cssLiterals, 1);
  assert.equal(result.unknownSinks, 0);
  assert.equal(result.count, 1);
});

test("malformed CSS assigned through a DOM style sink fails closed", () => {
  const result = analyzeEmbeddedCssPaint(
    source([
      "const style = document.createElement('style');",
      "style.textContent = '.x { color: red';",
    ])
  );

  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.parseFailures, 1);
  assert.equal(result.count, 1);
});

test("malformed TypeScript is rejected with a file location", () => {
  assert.throws(
    () =>
      countEmbeddedCssPaintInFile(
        "export const Example = () => <style>{`x { color:red }`}</style",
        "broken.tsx"
      ),
    /Cannot count embedded CSS paint in broken\.tsx:/
  );
});

test("canonicalizes and de-duplicates symlinked files", () => {
  const dir = mkdtempSync(join(tmpdir(), "embedded-css-paint-"));
  const file = join(dir, "style.tsx");
  const alias = join(dir, "alias.tsx");
  try {
    writeFileSync(
      file,
      "const CSS = `.x { color:red }`; export const X = () => <style>{CSS}</style>;\n"
    );
    symlinkSync(file, alias, "file");
    const result = countEmbeddedCssPaintByFile([file, alias, file]);
    assert.equal(result.total, 1);
    assert.deepEqual(Object.keys(result.files), [realpathSync(file)]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
