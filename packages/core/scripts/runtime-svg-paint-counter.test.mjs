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
import { join, relative } from "node:path";
import test from "node:test";
import {
  STRUCTURAL_SVG_PAINT_CONVENTION,
  analyzeRuntimeSvgPaint,
  countRuntimeSvgPaintByFile,
  countRuntimeSvgPaintInFile,
} from "./lib/runtime-svg-paint-counter.mjs";
import {
  collectSourceFiles,
  isProductionSourceFile,
} from "./runtime-svg-paint-census.mjs";

test("counts D3 paint setters but not one-argument getters", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection
      .attr('fill', datum.color)
      .attr('stroke', '#fff')
      .attr('stop-color', stopColor)
      .style('fill', theme.label)
      .style('stroke', theme.axis);
    const existing = selection.attr('fill');
    selection.attr('opacity', 0.5).style('color', 'red');
    selection.attr(('fill' as const), castTone);
    const example = ".attr('stroke', '#000')";
    // selection.style('fill', commentOnly);
  `);

  assert.equal(result.count, 6);
  assert.equal(result.d3Setters, 6);
  assert.equal(result.jsxAttributes, 0);
  assert.deepEqual(
    result.sites.map(({ kind, property }) => ({ kind, property })),
    [
      { kind: "d3-setter", property: "fill" },
      { kind: "d3-setter", property: "stroke" },
      { kind: "d3-setter", property: "stop-color" },
      { kind: "d3-setter", property: "fill" },
      { kind: "d3-setter", property: "stroke" },
      { kind: "d3-setter", property: "fill" },
    ]
  );
});

test("supports D3 style priority and literal element-access methods", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection
      .style('fill', computedTone, 'important')
      ['attr']('stroke', axisTone)
      [\`style\`]('stop-color', stopTone, priority);
    selection.attr('fill', tone, 'not-a-d3-attr-signature');
    selection.style('fill');
    selection.attr('opacity', 0.5).style('color', 'red', 'important');
  `);

  assert.equal(result.count, 3);
  assert.equal(result.classifiedPaint, 3);
  assert.equal(result.d3Setters, 3);
  assert.equal(result.unclassified, 0);
  assert.deepEqual(
    result.sites.map(({ kind, property }) => ({ kind, property })),
    [
      { kind: "d3-setter", property: "fill" },
      { kind: "d3-setter", property: "stroke" },
      { kind: "d3-setter", property: "stop-color" },
    ]
  );
});

test("counts D3 paint tween setters but ignores geometry tweens", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection
      .attrTween('fill', fillTween)
      .attrTween('stroke', strokeTween)
      .styleTween('stop-color', stopTween)
      .styleTween('fill', fillStyleTween, 'important')
      .attrTween('d', pathTween)
      .styleTween('opacity', opacityTween);
  `);

  assert.equal(result.count, 4);
  assert.equal(result.d3Setters, 4);
  assert.equal(result.unclassified, 0);
});

test("reports computed setter names and methods as fail-closed unclassified sites", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection.attr(attributeName, tone);
    selection.style(styleName, axisTone);
    selection.style(condition ? 'fill' : 'stroke', stateTone, priority);
    svg.setAttribute(domAttributeName, exportTone);
    selection.attr('opacity', 0.5);
    selection.style('font-size', '12px', 'important');
    selection[methodName]('fill', hiddenFromUnknownMethodAnalysis);
    selection[methodName](dynamicProperty, hiddenFromBothUnknowns);
  `);

  assert.equal(result.count, 6);
  assert.equal(result.classifiedPaint, 0);
  assert.equal(result.unclassified, 6);
  assert.deepEqual(
    result.unclassifiedSites.map(({ kind, method, expression }) => ({
      kind,
      method,
      expression,
    })),
    [
      { kind: "d3-setter", method: "attr", expression: "attributeName" },
      { kind: "d3-setter", method: "style", expression: "styleName" },
      {
        kind: "d3-setter",
        method: "style",
        expression: "condition ? 'fill' : 'stroke'",
      },
      {
        kind: "dom-set-attribute",
        method: "setAttribute",
        expression: "domAttributeName",
      },
      {
        kind: "d3-setter",
        method: "methodName",
        expression: "'fill'",
      },
      {
        kind: "d3-setter",
        method: "methodName",
        expression: "dynamicProperty",
      },
    ]
  );
});

test("counts DOM SVG setAttribute paint but not Canvas paint", () => {
  const result = analyzeRuntimeSvgPaint(`
    svg.setAttribute('fill', computedTone);
    svg['setAttribute']('stroke', 'none');
    svg.setAttribute('stop-color', stopTone);
    svg.setAttribute('fill', null);
    svg.setAttribute('opacity', 0.5);
    ctx.fillStyle = canvasFill;
    ctx.strokeStyle = canvasStroke;
  `);

  assert.equal(result.count, 3);
  assert.equal(result.classifiedPaint, 3);
  assert.equal(result.domSetAttributes, 3);
  assert.equal(result.ignoredStructural, 1);
  assert.equal(result.unclassified, 0);
  assert.deepEqual(
    result.sites.map(({ kind, property }) => ({ kind, property })),
    [
      { kind: "dom-set-attribute", property: "fill" },
      { kind: "dom-set-attribute", property: "stop-color" },
      { kind: "dom-set-attribute", property: "fill" },
    ]
  );
});

test("counts DOM setAttributeNS paint and fails closed on a computed name", () => {
  const result = analyzeRuntimeSvgPaint(`
    svg.setAttributeNS(null, 'fill', computedTone);
    svg['setAttributeNS'](SVG_NS, 'stroke', strokeTone);
    svg.setAttributeNS(null, attributeName, unknownTone);
    svg.setAttributeNS(null, 'opacity', 0.5);
  `);

  assert.equal(result.count, 3);
  assert.equal(result.classifiedPaint, 2);
  assert.equal(result.domSetAttributes, 2);
  assert.equal(result.unclassified, 1);
  assert.deepEqual(
    result.unclassifiedSites.map(({ kind, method, expression }) => ({
      kind,
      method,
      expression,
    })),
    [
      {
        kind: "dom-set-attribute",
        method: "setAttributeNS",
        expression: "attributeName",
      },
    ]
  );
});

test("counts SVG JSX attributes without treating component props as DOM paint", () => {
  const result = analyzeRuntimeSvgPaint(`
    const chart = (
      <svg fill={surface}>
        <defs><linearGradient><stop stopColor={seriesColor} /></linearGradient></defs>
        <path fill={markColor} stroke="transparent" />
        <text stroke={labelStroke}>Label</text>
        <Icon fill={iconTone} stroke={iconStroke} />
        <div fill={invalidHtmlFill} />
      </svg>
    );
  `);

  assert.equal(result.count, 5);
  assert.equal(result.d3Setters, 0);
  assert.equal(result.jsxAttributes, 5);
  assert.deepEqual(
    result.sites.map(({ property }) => property),
    ["fill", "stopColor", "fill", "stroke", "stroke"]
  );
});

test("accepts canonical and raw JSX stop-color spellings", () => {
  const result = analyzeRuntimeSvgPaint(`
    const gradient = (
      <linearGradient>
        <stop stopColor={firstStop} />
        <stop stop-color={secondStop} />
      </linearGradient>
    );
  `);

  assert.equal(result.count, 2);
  assert.equal(result.jsxAttributes, 2);
});

test("counts SVG filter paint attributes in D3, DOM, and JSX channels", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection
      .attr('flood-color', floodTone)
      .style('lighting-color', lightTone);
    filter.setAttributeNS(null, 'flood-color', exportedFloodTone);
    const nodes = (
      <filter>
        <feFlood floodColor={jsxFloodTone} />
        <feSpecularLighting lighting-color={jsxLightTone} />
      </filter>
    );
  `);

  assert.equal(result.count, 5);
  assert.equal(result.d3Setters, 2);
  assert.equal(result.domSetAttributes, 1);
  assert.equal(result.jsxAttributes, 2);
});

test("counts intrinsic SVG JSX prop spreads and fails closed on opaque bags", () => {
  const result = analyzeRuntimeSvgPaint(`
    const mark = (
      <svg>
        <path {...{
          fill: tone,
          stroke: 'none',
          ['stopColor']: stopTone,
          [paintProperty]: computedTone,
          opacity: 0.5,
          ...rest,
        }} />
        <circle {...props} />
        <Icon {...props} />
      </svg>
    );
  `);

  assert.equal(result.count, 5);
  assert.equal(result.classifiedPaint, 2);
  assert.equal(result.jsxAttributes, 2);
  assert.equal(result.unclassified, 3);
  assert.equal(result.ignoredStructural, 1);
  assert.deepEqual(
    result.unclassifiedSites.map(({ kind, method, expression }) => ({
      kind,
      method,
      expression,
    })),
    [
      {
        kind: "jsx-spread",
        method: "spread",
        expression: "paintProperty",
      },
      { kind: "jsx-spread", method: "spread", expression: "rest" },
      { kind: "jsx-spread", method: "spread", expression: "props" },
    ]
  );
});

test("disambiguates HTML anchors from SVG anchors across foreignObject boundaries", () => {
  const result = analyzeRuntimeSvgPaint(`
    const html = <a fill={htmlTone} {...htmlProps}>Link</a>;
    const rootedSvgOnly = <path fill={rootTone} />;
    const graphic = (
      <svg>
        <a fill={svgTone} {...svgProps}><path fill={nestedTone} /></a>
        <foreignObject>
          <a fill={foreignHtmlTone} {...foreignHtmlProps}>HTML</a>
          <svg><a stroke={nestedSvgTone} {...nestedSvgProps} /></svg>
        </foreignObject>
      </svg>
    );
  `);

  assert.equal(result.classifiedPaint, 4);
  assert.equal(result.unclassified, 2);
  assert.equal(result.count, 6);
  assert.deepEqual(
    result.unclassifiedSites.map(({ kind, expression }) => ({
      kind,
      expression,
    })),
    [
      { kind: "jsx-spread", expression: "svgProps" },
      { kind: "jsx-spread", expression: "nestedSvgProps" },
    ]
  );
});

test("excludes structural delegation/removal values but keeps transparent as paint", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection
      .attr('fill', 'none')
      .attr('stroke', ' currentColor ')
      .attr('fill', 'url(#known-gradient)')
      .attr('stroke', 'url(https://cdn.example/paint.svg#tone)')
      .style('stroke', null)
      .style('fill', undefined)
      .attr('fill', 'transparent')
      .attr('stroke', externalColor);

    const svg = (
      <svg>
        <path fill="none" stroke="CURRENTCOLOR" />
        <path fill={\`url(#\${gradientId})\`} stroke="transparent" />
        <stop stopColor={runtimeStop} />
      </svg>
    );
  `);

  assert.equal(result.count, 5);
  assert.equal(result.ignoredStructural, 8);
  assert.deepEqual(
    result.ignoredSites.map(({ reason }) => reason),
    [
      STRUCTURAL_SVG_PAINT_CONVENTION.none,
      STRUCTURAL_SVG_PAINT_CONVENTION.currentColor,
      STRUCTURAL_SVG_PAINT_CONVENTION.localPaintServer,
      STRUCTURAL_SVG_PAINT_CONVENTION.nullishRemoval,
      STRUCTURAL_SVG_PAINT_CONVENTION.nullishRemoval,
      STRUCTURAL_SVG_PAINT_CONVENTION.none,
      STRUCTURAL_SVG_PAINT_CONVENTION.currentColor,
      STRUCTURAL_SVG_PAINT_CONVENTION.localPaintServer,
    ]
  );
});

test("does not hide mixed runtime expressions just because one branch is structural", () => {
  assert.equal(
    countRuntimeSvgPaintInFile(`
      selection.attr('fill', useGradient ? \`url(#\${id})\` : seriesColor);
      const mark = <path fill={disabled ? 'none' : seriesColor} />;
    `),
    2
  );
});

test("documents CSS color and React.createElement as separately-owned boundaries", () => {
  const result = analyzeRuntimeSvgPaint(`
    selection.style('color', inheritedTextTone);
    const delegated = <path fill="currentColor" />;
    const imperativeReact = React.createElement('path', { fill: markTone });
  `);

  assert.equal(result.count, 0);
  assert.equal(result.ignoredStructural, 1);
});

test("fails closed on malformed source", () => {
  assert.throws(
    () =>
      countRuntimeSvgPaintInFile(
        "const chart = <svg><path fill={tone} /></svg",
        "broken.tsx"
      ),
    /Cannot count runtime SVG paint in broken\.tsx:/
  );
});

test("uses the correct parser kind for module-flavoured extensions", () => {
  for (const fileName of ["source.mts", "source.cts"]) {
    assert.equal(
      countRuntimeSvgPaintInFile(
        "const castTone = <string>tone; selection.attr('fill', castTone);",
        fileName
      ),
      1
    );
  }

  for (const fileName of ["source.mjs", "source.cjs"]) {
    assert.equal(
      countRuntimeSvgPaintInFile("selection.attr('fill', tone);", fileName),
      1
    );
  }
});

test("recognizes production census files without test, story, or fixture noise", () => {
  assert.equal(isProductionSourceFile("/repo/src/chart.tsx"), true);
  assert.equal(isProductionSourceFile("/repo/src/helpers/color.ts"), true);
  assert.equal(isProductionSourceFile("/repo/src/tests/chart.tsx"), false);
  assert.equal(
    isProductionSourceFile("/repo/src/__fixtures__/chart.tsx"),
    false
  );
  assert.equal(isProductionSourceFile("/repo/src/chart.test.tsx"), false);
  assert.equal(isProductionSourceFile("/repo/src/chart.spec.ts"), false);
  assert.equal(isProductionSourceFile("/repo/src/Charts.stories.tsx"), false);
  assert.equal(isProductionSourceFile("/repo/src/chart.fixture.tsx"), false);
  assert.equal(isProductionSourceFile("/repo/src/test-utils.ts"), false);
  assert.equal(isProductionSourceFile("/repo/src/story-helpers.tsx"), false);
  assert.equal(isProductionSourceFile("/repo/src/types.d.mts"), false);
});

test("returns deterministic de-duplicated counts by file", () => {
  const dir = mkdtempSync(join(tmpdir(), "runtime-svg-paint-"));
  const first = join(dir, "a.tsx");
  const second = join(dir, "b.ts");
  try {
    writeFileSync(
      first,
      "export const A = () => <path fill={tone} stroke='none' />;\n"
    );
    writeFileSync(
      second,
      "selection.attr('fill', tone).style('stroke', axis);\n"
    );

    const canonicalFirst = realpathSync(first);
    const canonicalSecond = realpathSync(second);
    const relativeFirst = relative(process.cwd(), first);

    const result = countRuntimeSvgPaintByFile([
      second,
      first,
      first,
      relativeFirst,
    ]);
    assert.deepEqual(result, {
      total: 3,
      classifiedPaint: 3,
      d3Setters: 2,
      jsxAttributes: 1,
      domSetAttributes: 0,
      unclassified: 0,
      ignoredStructural: 1,
      unclassifiedSites: [],
      files: {
        [canonicalFirst]: {
          count: 1,
          classifiedPaint: 1,
          d3Setters: 0,
          jsxAttributes: 1,
          domSetAttributes: 0,
          unclassified: 0,
          ignoredStructural: 1,
        },
        [canonicalSecond]: {
          count: 2,
          classifiedPaint: 2,
          d3Setters: 2,
          jsxAttributes: 0,
          domSetAttributes: 0,
          unclassified: 0,
          ignoredStructural: 0,
        },
      },
    });
    assert.equal(
      result.total,
      Object.values(result.files).reduce((sum, file) => sum + file.count, 0)
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("follows nested in-root symlinks once and terminates directory cycles", () => {
  const dir = mkdtempSync(join(tmpdir(), "runtime-svg-symlinks-"));
  const root = join(dir, "root");
  const realDir = join(root, "real", "nested");
  const source = join(realDir, "chart.tsx");
  try {
    mkdirSync(realDir, { recursive: true });
    writeFileSync(source, "export const Mark = <path fill={tone} />;\n");
    symlinkSync(join(root, "real"), join(root, "alias"), "dir");
    symlinkSync(source, join(root, "chart-link.tsx"), "file");
    symlinkSync(root, join(realDir, "cycle"), "dir");

    assert.deepEqual(collectSourceFiles(root), [realpathSync(source)]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects a nested symlink that escapes the census root", () => {
  const dir = mkdtempSync(join(tmpdir(), "runtime-svg-symlink-escape-"));
  const root = join(dir, "root");
  const outside = join(dir, "outside.tsx");
  try {
    mkdirSync(root);
    writeFileSync(outside, "export const Mark = <path fill={tone} />;\n");
    symlinkSync(outside, join(root, "escape.tsx"), "file");

    assert.throws(
      () => collectSourceFiles(root),
      /resolves outside its scan root/
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
