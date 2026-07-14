import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { countArc09PaintInFile } from './inline-paint-counter.mjs';
import { countRuntimeSvgPaintInFile } from './runtime-svg-paint-counter.mjs';
import { countEmbeddedCssPaintInFile } from './embedded-css-paint-counter.mjs';

const GLOB_MAGIC_RE = /[*?\[\]{}]/;
const FAMILY_KEYS = new Set(['files']);
const ENTRY_KEYS = new Set(['floor', 'runtimeSvgFloor', 'embeddedCssFloor', 'why']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isOutside(base, candidate) {
  const rel = relative(base, candidate);
  return rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel);
}

function displayPath(base, candidate) {
  return relative(base, candidate).split(sep).join('/');
}

function unknownExecutableKeys(record, allowedKeys) {
  return Object.keys(record).filter((key) => !key.startsWith('$') && !allowedKeys.has(key));
}

/**
 * Validate and evaluate the named WO-SKIN-06 inline-paint exemptions.
 *
 * Floors are first aggregated by the canonical target path and only then
 * compared with the file's actual count. A file can legitimately belong to
 * more than one exemption family; checking each family independently would
 * let the same remaining sites satisfy several floors.
 *
 * This is deliberately a cardinality gate, not a source-identity gate. It proves
 * that each canonical file still has enough counter-visible paint in EACH
 * declared channel to satisfy the sum of its floors: `floor` protects the
 * object-literal/imperative-inline lexer, `runtimeSvgFloor` protects the AST
 * channel used by D3/intrinsic SVG JSX/DOM attribute writes, and
 * `embeddedCssFloor` protects paint declarations inside real injected CSS
 * literals/templates. It cannot prove that those sites are the exact expressions
 * described by each entry's `why`.
 * Checkpoint contracts and their focused/visual tests own that identity and
 * rendering proof.
 *
 * Globs are deliberately rejected. A glob carries one aggregate floor but
 * cannot say how that floor is distributed across its matches, so it cannot
 * protect an individual runtime-value site from deletion. Historical globs
 * were planning shorthand and must be resolved to concrete per-file floors
 * before they become executable gate configuration.
 */
export function collectSkinExemptionFailures({
  exemptionsPath,
  componentsDir,
  countPaint = countArc09PaintInFile,
  countRuntimeSvgPaint = countRuntimeSvgPaintInFile,
  countEmbeddedCssPaint = countEmbeddedCssPaintInFile,
}) {
  const failures = [];
  const fail = (message) => failures.push(message);

  if (typeof exemptionsPath !== 'string' || exemptionsPath.length === 0) {
    fail('skin exemption configuration path is missing or invalid');
    return failures;
  }
  if (!existsSync(exemptionsPath)) {
    fail(`skin exemption configuration does not exist: ${exemptionsPath}`);
    return failures;
  }

  let document;
  try {
    document = JSON.parse(readFileSync(exemptionsPath, 'utf8'));
  } catch (error) {
    fail(`skin exemption configuration is not valid JSON: ${error.message}`);
    return failures;
  }
  if (!isRecord(document)) {
    fail('skin exemption configuration root must be an object');
    return failures;
  }

  let canonicalComponentsDir;
  try {
    if (!existsSync(componentsDir) || !statSync(componentsDir).isDirectory()) {
      fail(`skin exemption components directory does not exist: ${componentsDir}`);
      return failures;
    }
    canonicalComponentsDir = realpathSync(componentsDir);
  } catch (error) {
    fail(`skin exemption components directory cannot be read: ${error.message}`);
    return failures;
  }

  const targets = new Map();
  let configuredFamilies = 0;

  for (const [family, group] of Object.entries(document)) {
    if (family.startsWith('$')) continue;
    configuredFamilies += 1;

    if (!isRecord(group)) {
      fail(`exemption family ${family} must be an object`);
      continue;
    }
    for (const key of unknownExecutableKeys(group, FAMILY_KEYS)) {
      fail(`exemption family ${family} has unknown key ${JSON.stringify(key)}`);
    }
    if (!Object.hasOwn(group, 'files')) {
      fail(`exemption family ${family} is missing its files map`);
      continue;
    }
    if (!isRecord(group.files)) {
      fail(`exemption family ${family}.files must be an object`);
      continue;
    }
    if (Object.keys(group.files).length === 0) {
      fail(`exemption family ${family}.files must not be empty`);
      continue;
    }

    for (const [configuredPath, entry] of Object.entries(group.files)) {
      const label = `${family}: ${configuredPath}`;

      if (!isRecord(entry)) {
        fail(`exemption entry (${label}) must be an object`);
        continue;
      }
      for (const key of unknownExecutableKeys(entry, ENTRY_KEYS)) {
        fail(`exemption entry (${label}) has unknown key ${JSON.stringify(key)}`);
      }

      const hasInlineFloor = Object.hasOwn(entry, 'floor');
      const hasRuntimeSvgFloor = Object.hasOwn(entry, 'runtimeSvgFloor');
      const hasEmbeddedCssFloor = Object.hasOwn(entry, 'embeddedCssFloor');
      if (!hasInlineFloor && !hasRuntimeSvgFloor && !hasEmbeddedCssFloor) {
        fail(`exemption entry (${label}) must declare floor, runtimeSvgFloor, and/or embeddedCssFloor`);
        continue;
      }

      const floor = hasInlineFloor ? entry.floor : 0;
      if (hasInlineFloor && (!Number.isSafeInteger(floor) || floor < 1)) {
        fail(`exemption entry (${label}) has invalid floor ${JSON.stringify(floor)}; expected a positive integer`);
        continue;
      }

      const runtimeSvgFloor = hasRuntimeSvgFloor ? entry.runtimeSvgFloor : 0;
      if (hasRuntimeSvgFloor && (!Number.isSafeInteger(runtimeSvgFloor) || runtimeSvgFloor < 1)) {
        fail(
          `exemption entry (${label}) has invalid runtimeSvgFloor ${JSON.stringify(
            runtimeSvgFloor
          )}; expected a positive integer`
        );
        continue;
      }

      const embeddedCssFloor = hasEmbeddedCssFloor ? entry.embeddedCssFloor : 0;
      if (hasEmbeddedCssFloor && (!Number.isSafeInteger(embeddedCssFloor) || embeddedCssFloor < 1)) {
        fail(
          `exemption entry (${label}) has invalid embeddedCssFloor ${JSON.stringify(
            embeddedCssFloor
          )}; expected a positive integer`
        );
        continue;
      }

      if (configuredPath.length === 0) {
        fail(`exemption entry (${family}) has an empty target path`);
        continue;
      }
      if (GLOB_MAGIC_RE.test(configuredPath)) {
        fail(`exemption entry (${label}) is an unresolved glob; replace it with concrete per-file floors`);
        continue;
      }

      const candidate = resolve(canonicalComponentsDir, configuredPath);
      if (isOutside(canonicalComponentsDir, candidate)) {
        fail(`exemption entry (${label}) resolves outside the components directory`);
        continue;
      }
      if (!existsSync(candidate)) {
        fail(`exemption entry (${label}) points to a file that does not exist`);
        continue;
      }

      let canonicalPath;
      try {
        if (!statSync(candidate).isFile()) {
          fail(`exemption entry (${label}) does not point to a file`);
          continue;
        }
        canonicalPath = realpathSync(candidate);
      } catch (error) {
        fail(`exemption entry (${label}) cannot be read: ${error.message}`);
        continue;
      }
      if (isOutside(canonicalComponentsDir, canonicalPath)) {
        fail(`exemption entry (${label}) resolves outside the components directory`);
        continue;
      }

      const existing = targets.get(canonicalPath);
      if (existing) {
        existing.floor += floor;
        existing.runtimeSvgFloor += runtimeSvgFloor;
        existing.embeddedCssFloor += embeddedCssFloor;
        existing.contributions.push({
          family,
          configuredPath,
          floor,
          runtimeSvgFloor,
          embeddedCssFloor,
        });
      } else {
        targets.set(canonicalPath, {
          canonicalPath,
          displayPath: displayPath(canonicalComponentsDir, canonicalPath),
          floor,
          runtimeSvgFloor,
          embeddedCssFloor,
          contributions: [
            {
              family,
              configuredPath,
              floor,
              runtimeSvgFloor,
              embeddedCssFloor,
            },
          ],
        });
      }
    }
  }

  if (configuredFamilies === 0) {
    fail('skin exemption configuration must declare at least one exemption family');
  }

  for (const target of targets.values()) {
    let source;
    try {
      source = readFileSync(target.canonicalPath, 'utf8');
    } catch (error) {
      fail(`exemption target ${target.displayPath} could not be read: ${error.message}`);
      continue;
    }

    if (target.floor > 0) {
      let actual;
      try {
        actual = countPaint(source, target.canonicalPath);
      } catch (error) {
        fail(`exemption target ${target.displayPath} could not be counted for inline paint: ${error.message}`);
        actual = null;
      }
      if (actual !== null && (!Number.isSafeInteger(actual) || actual < 0)) {
        fail(`exemption target ${target.displayPath} produced invalid inline paint count ${JSON.stringify(actual)}`);
      } else if (actual !== null && actual < target.floor) {
        const contributionSummary = target.contributions
          .filter(({ floor }) => floor > 0)
          .map(({ family, floor }) => `${family}=${floor}`)
          .join(' + ');
        fail(
          `exemption breached (inline): ${target.displayPath} is at ${actual}, below its combined floor of ${target.floor} (${contributionSummary}) -- ` +
            'the aggregate counter-visible inline-paint cardinality no longer satisfies its declared exemptions'
        );
      }
    }

    if (target.runtimeSvgFloor > 0) {
      let actual;
      try {
        actual = countRuntimeSvgPaint(source, target.canonicalPath);
      } catch (error) {
        fail(`exemption target ${target.displayPath} could not be counted for runtime SVG paint: ${error.message}`);
        actual = null;
      }
      if (actual !== null && (!Number.isSafeInteger(actual) || actual < 0)) {
        fail(
          `exemption target ${target.displayPath} produced invalid runtime SVG paint count ${JSON.stringify(actual)}`
        );
      } else if (actual !== null && actual < target.runtimeSvgFloor) {
        const contributionSummary = target.contributions
          .filter(({ runtimeSvgFloor }) => runtimeSvgFloor > 0)
          .map(({ family, runtimeSvgFloor }) => `${family}=${runtimeSvgFloor}`)
          .join(' + ');
        fail(
          `exemption breached (runtime SVG): ${target.displayPath} is at ${actual}, below its combined runtimeSvgFloor of ${target.runtimeSvgFloor} (${contributionSummary}) -- ` +
            'the aggregate counter-visible runtime-SVG paint cardinality no longer satisfies its declared exemptions'
        );
      }
    }

    if (target.embeddedCssFloor > 0) {
      let actual;
      try {
        actual = countEmbeddedCssPaint(source, target.canonicalPath);
      } catch (error) {
        fail(`exemption target ${target.displayPath} could not be counted for embedded CSS paint: ${error.message}`);
        actual = null;
      }
      if (actual !== null && (!Number.isSafeInteger(actual) || actual < 0)) {
        fail(
          `exemption target ${target.displayPath} produced invalid embedded CSS paint count ${JSON.stringify(actual)}`
        );
      } else if (actual !== null && actual < target.embeddedCssFloor) {
        const contributionSummary = target.contributions
          .filter(({ embeddedCssFloor }) => embeddedCssFloor > 0)
          .map(({ family, embeddedCssFloor }) => `${family}=${embeddedCssFloor}`)
          .join(' + ');
        fail(
          `exemption breached (embedded CSS): ${target.displayPath} is at ${actual}, below its combined embeddedCssFloor of ${target.embeddedCssFloor} (${contributionSummary}) -- ` +
            'the aggregate counter-visible embedded-CSS paint cardinality no longer satisfies its declared exemptions'
        );
      }
    }
  }

  return failures;
}

/** CLI-facing exact-0 counter. Every schema/configuration error is a breach. */
export function countSkinExemptionBreaches(options) {
  const { log = console.error, ...auditOptions } = options;
  const failures = collectSkinExemptionFailures(auditOptions);
  for (const failure of failures) log(`  - ${failure}`);
  return failures.length;
}
