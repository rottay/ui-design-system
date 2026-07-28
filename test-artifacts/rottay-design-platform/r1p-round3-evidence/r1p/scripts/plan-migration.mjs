/**
 * Join classification.json with theme-paths.json into the per-vertical migration plan.
 *
 * Category comes from the classification's own per-state verdict, never recomputed:
 * A = rendered-equal (delete only), B = divergent (adopt into TS, then delete).
 * The base state is `default` everywhere; rottay included, because de-gating the
 * spec makes the compiled block the base-state author and the extension's
 * dark-DEFAULT block the thing it now duplicates.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const cls = JSON.parse(readFileSync(`${ROOT}/classification.json`, 'utf-8'));
const paths = JSON.parse(readFileSync(`${ROOT}/r1p/theme-paths.json`, 'utf-8'));

/** AD-1 exception list (handoff item 14): compiled value is canonical. */
const COMPILED_WINS = new Set(['evnto:--ds-font-family-base', 'evnto:--ds-font-family-heading']);

const norm = (v) => (v == null ? null : v.replace(/\s+/g, ' ').trim().toLowerCase());

const plan = {};

for (const slug of ['bithire', 'evnto', 'rottay']) {
  const names = Object.values(cls.verticals[slug].names);
  const byVar = paths[slug].byVar;
  const rows = [];

  for (const entry of names) {
    const st = entry.perState.default;
    const key = `${slug}:${entry.name}`;
    const compiledValue = entry.compiled?.value ?? null;

    if (!st?.extensionFileLine || !st.extensionEffective || st.descendantOnly || st.mediaConditional) {
      rows.push({ name: entry.name, action: 'keep', reason: entry.final, extensionValue: st?.extensionValue ?? null });
      continue;
    }

    const extValue = st.extensionValue;
    if (COMPILED_WINS.has(key)) {
      rows.push({ name: entry.name, action: 'delete', kind: 'compiled-wins', compiledValue, extValue });
      continue;
    }
    // rottay's default state records the compiled block as absent (it was
    // light-gated); the de-gated comparison is `entry.compiled.value`.
    const equal = st.result === 'A' || (slug === 'rottay' && norm(compiledValue) === norm(extValue));
    if (equal) {
      rows.push({ name: entry.name, action: 'delete', kind: 'duplicate', compiledValue, extValue });
      continue;
    }
    rows.push({ name: entry.name, action: 'adopt', compiledValue, extValue, candidates: byVar[entry.name] ?? [] });
  }

  // A field is usable when every channel it moves is a channel we are setting to
  // the same value (or is the target itself). `--ds-card-radius` and
  // `--ds-card-border-radius` share one field and one value: legal. A field that
  // also moves 64 unrelated channels is not.
  const adopting = new Map(rows.filter((r) => r.action === 'adopt').map((r) => [r.name, r.extValue]));
  const sets = [];
  const gaps = [];
  const usedPath = new Map();
  for (const row of rows.filter((r) => r.action === 'adopt')) {
    const usable = row.candidates.find((c) =>
      c.controlsVars.every((v) => v === row.name || (adopting.has(v) && norm(adopting.get(v)) === norm(row.extValue)))
    );
    if (!usable) {
      row.action = 'gap';
      gaps.push(row);
      continue;
    }
    row.path = usable.path;
    row.controlsVars = usable.controlsVars;
    if (!usedPath.has(usable.path)) {
      usedPath.set(usable.path, row.extValue);
      sets.push({ name: row.name, path: usable.path, from: row.compiledValue, to: row.extValue, controlsVars: usable.controlsVars });
    }
  }

  const deletes = rows.filter((r) => r.action === 'delete' || r.action === 'adopt');
  plan[slug] = {
    deleteNames: deletes.map((r) => r.name),
    duplicateCount: rows.filter((r) => r.kind === 'duplicate').length,
    compiledWinsCount: rows.filter((r) => r.kind === 'compiled-wins').length,
    adoptedCount: rows.filter((r) => r.action === 'adopt').length,
    sets,
    gaps: gaps.map((g) => ({ name: g.name, compiled: g.compiledValue, extension: g.extValue, candidates: g.candidates.slice(0, 2).map((c) => `${c.path} moves ${c.controls}`) })),
    keep: rows.filter((r) => r.action === 'keep').map((r) => ({ name: r.name, reason: r.reason })),
  };
  const p = plan[slug];
  console.log(`${slug}: delete ${p.deleteNames.length} (dup ${p.duplicateCount}, compiled-wins ${p.compiledWinsCount}, adopted ${p.adoptedCount}) | ${p.sets.length} TS field sets | ${p.gaps.length} capability gaps | ${p.keep.length} untouched`);
}

for (const slug of ['bithire', 'rottay']) {
  console.log(`\n--- ${slug} capability gaps (${plan[slug].gaps.length}) ---`);
  for (const g of plan[slug].gaps.slice(0, 12)) console.log(`  ${g.name}: compiled=${JSON.stringify(g.compiled)} ext=${JSON.stringify(g.extension)} [${g.candidates.join(', ') || 'no field'}]`);
  if (plan[slug].gaps.length > 12) console.log(`  … +${plan[slug].gaps.length - 12} more`);
}

writeFileSync(`${ROOT}/r1p/migration-plan.json`, JSON.stringify(plan, null, 2));
