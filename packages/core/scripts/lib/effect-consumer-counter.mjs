import { readFileSync } from "node:fs";
import postcss from "postcss";

/**
 * Premium-effect token families whose live render consumers are protected by
 * the engine audit's minimum floors.
 */
const EFFECT_FAMILIES = {
  gradient: /var\(\s*--ds-gradient-/,
  glass: /var\(\s*--ds-glass-/,
  glow: /var\(\s*--ds-shadow-glow-/,
};

function emptyConsumerSets() {
  return Object.fromEntries(Object.keys(EFFECT_FAMILIES).map((family) => [family, new Set()]));
}

function recordMatches(text, file, consumers) {
  for (const [family, pattern] of Object.entries(EFFECT_FAMILIES)) {
    if (pattern.test(text)) consumers[family].add(file);
  }
}

/**
 * Count files that consume a premium-effect token in render-owned source.
 *
 * `sourceFiles` are TS/TSX render files, where a `var(--ds-...)` reference is
 * the established consumer signal. `skinFiles` are parsed as CSS and only
 * values of real CSS declarations count. Custom-property declarations are
 * deliberately excluded: defining (or aliasing) a token is not evidence that
 * a browser-painted property consumes it.
 *
 * Paths are de-duplicated before scanning, so importing a skin from multiple
 * entrypoints cannot inflate the file-consumer count.
 */
export function countPremiumEffectConsumers({ sourceFiles = [], skinFiles = [] }) {
  const consumers = emptyConsumerSets();

  for (const file of new Set(sourceFiles)) {
    recordMatches(readFileSync(file, "utf8"), file, consumers);
  }

  for (const file of new Set(skinFiles)) {
    const root = postcss.parse(readFileSync(file, "utf8"), { from: file });
    root.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--")) return;
      recordMatches(declaration.value, file, consumers);
    });
  }

  return Object.fromEntries(
    Object.entries(consumers).map(([family, files]) => [family, files.size]),
  );
}

/** Shared floor evaluation used by the CLI and its focused regression test. */
export function collectBelowFloorFailures(counters, minimums) {
  const failures = [];
  for (const [key, minimum] of Object.entries(minimums)) {
    const actual = counters[key] ?? 0;
    if (actual < minimum) failures.push(`${key}: ${actual} < required >= ${minimum}`);
  }
  return failures;
}
