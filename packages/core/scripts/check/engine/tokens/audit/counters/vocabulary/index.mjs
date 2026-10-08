import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* ============================================================================
   Off-canon vocabulary gate (WO-ARC-01, proposal P-13): the component API
   normalization sweep drives two duplication shapes to zero across every
   packages/core/src/components/**\/*.types.ts file:
    - an undocumented raw 'small' | 'middle' | 'large' union on a type-alias declaration line
      -- the antd-style spelling a Size-derived canonical type plus a `@deprecated`-marked
      `Legacy*Size` alias replaces (e.g. TreeSelect.types.ts's `TreeSelectSize = Extract<Size,
      'sm'|'md'|'lg'>` paired with `LegacyTreeSelectSize = 'small'|'middle'|'large'`). A
      declaration whose immediately-preceding JSDoc block carries `@deprecated` is a sanctioned
      one-release compatibility alias and is exempt; an undocumented raw union is the
      violation this counter targets.
    - a size-vocabulary type name (`export type <Name>Size = ...` / `export type ModalSize =
      ...`) declared -- not merely re-exported -- in more than one components-tree file (the
      `ButtonSize` / `ModalSize` duplication the WO's research found). `ModalSize` collapsed to
      one declaration in contracts/common with both Modal families re-exporting it (`export
      type { ModalSize }`, not a second `= ...` assignment), so a re-export never counts.
   Target: 0 for both. Decrease-only.
   ============================================================================ */

/** Every `.types.ts` file under `packages/core/src/components/**`. */
function collectTypesFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...collectTypesFiles(full));
    else if (full.endsWith('.types.ts')) out.push(full);
  }
  return out;
}

/**
 * True when a `@deprecated` JSDoc tag appears anywhere in the comment block immediately
 * preceding source line index `declIndex` in `lines` -- walked upward through `*`-prefixed
 * comment-body lines and the block's own `/**` opener; stops (no exemption) at the first line
 * that is neither the opener nor a `*`-prefixed body line, so a declaration with no JSDoc
 * directly above it is never exempted by an unrelated comment further up the file.
 */
function precededByDeprecatedTag(lines, declIndex) {
  let sawDeprecated = false;
  let j = declIndex - 1;
  while (j >= 0) {
    const line = lines[j];
    if (/@deprecated/.test(line)) sawDeprecated = true;
    if (/^\s*\/\*\*/.test(line)) break; // reached the JSDoc block's opening line
    if (line.trim() !== '' && !line.trim().startsWith('*')) break; // no JSDoc directly above
    j -= 1;
  }
  return sawDeprecated;
}

/**
 * Count undocumented raw `'small' | 'middle' | 'large'` union literals on a `export type <Name>
 * = ...` declaration line, across every `.types.ts` file under
 * packages/core/src/components/**. Scoped to type-alias declaration lines (not e.g. a
 * `Record<...>` value map like `SPACE_SIZE_MAP`, which legitimately stays keyed by the legacy
 * spelling internally) -- see this gate's module doc for the exemption rule.
 */
function countRawAntdSizeUnions(files) {
  let count = 0;
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!/^\s*export type \w+\s*=/.test(line)) continue;
      if (!(/'small'/.test(line) && /'middle'/.test(line) && /'large'/.test(line))) continue;
      if (precededByDeprecatedTag(lines, i)) continue;
      count += 1;
    }
  }
  return count;
}

/**
 * Count size-vocabulary type names (any `export type <Name> = ...` where `<Name>` ends in
 * `Size`, e.g. `ButtonSize`, `ModalSize`) DECLARED -- not merely re-exported via `export type {
 * Name }` -- in more than one packages/core/src/components/**\/*.types.ts file. Each name's
 * site count beyond the first is a duplicate (a name declared 3 times contributes 2).
 */
function countDuplicateSizeVocabDeclarations(files) {
  const declRe = /^export type (\w*Size)\s*=/;
  const sitesByName = new Map();
  for (const file of files) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = declRe.exec(line.trim());
      if (!m) continue;
      const name = m[1];
      if (!sitesByName.has(name)) sitesByName.set(name, []);
      sitesByName.get(name).push(file);
    }
  }
  let duplicates = 0;
  for (const sites of sitesByName.values()) {
    if (sites.length > 1) duplicates += sites.length - 1;
  }
  return duplicates;
}

export {
  collectTypesFiles,
  countRawAntdSizeUnions,
  countDuplicateSizeVocabDeclarations,
};
