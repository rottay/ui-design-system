/**
 * @fileoverview Decision 19 (owner, 2026-08-26) made executable: a public dial
 * must keep authority over the channels it governs, in every vertical.
 *
 * THE LAW. "Una vertical puede decidir su seed o coeficiente propio, pero no
 * puede congelar el resultado terminal de un control publico sin una excepcion
 * explicita y visible." A brand-theme is free to author its own seed (a colour,
 * a base size) and its own coefficient; what it may not do is write the
 * MULTIPLIED RESULT as a literal, because that silently removes the dial from
 * the expression and the tenant who moves the dial sees nothing happen.
 *
 * WHAT IS AND IS NOT AN ANTI-DOOR. The distinction is measured, not asserted:
 *   - `--ds-badge-error-bg: #DC2626` is a SEED. No dial multiplies it, no dial
 *     is lost. Legitimate vertical identity, and the law says so explicitly.
 *   - `--ds-glass-blur: 12px` where the base says
 *     `calc(12px * var(--ds-effect-intensity))` is an ANTI-DOOR: the coefficient
 *     is gone, so `surfaces.effect-intensity` moves nothing on that vertical.
 * So this gate only ever looks at FACTOR dials -- a control-declared channel
 * that the authored base layer uses as an operand inside `calc()`. A channel
 * that is never a multiplicand cannot be frozen in this sense and is not read.
 *
 * THE COUNTERFACTUAL IS TWO-SIDED, and it has to be. A channel proves itself
 * dial-governed either because the BASE layer expresses it with the factor
 * (`--ds-glass-blur`), or because a PEER VERTICAL does (`--ds-input-md-font-size`:
 * the base component layer writes a raw `0.875rem`, and it is rottay's
 * `var(--ds-font-size-sm)` that carries `--ds-type-scale`). Reading only the base
 * would have missed the second case entirely -- which is exactly the case the
 * owner ruled on. Reachability is transitive through `var()` chains, resolved
 * per vertical against that vertical's own effective map (artifact over base),
 * because the artifact is unlayered and wins the cascade.
 *
 * PENDING INVENTORY vs EXCEPTION. Two different things, deliberately not one:
 *   - `exceptions[]` is the law's escape hatch: an owner-granted, visible
 *     statement that a vertical MAY freeze a channel, with its reason. Granting
 *     one is a governance act; this gate never writes them.
 *   - `pending[]` is measured DEBT of the same class that no ruling has covered
 *     yet. It is decrease-only: an entry that stops reproducing must be removed
 *     (the gate fails until it is), and a case that is not already listed fails
 *     outright. It is not permission -- it is a worklist that cannot grow.
 *
 * WHAT THIS GATE DOES NOT MODEL, stated because it bit the measurement that
 * built it. Declarations are read WITHOUT their at-rule scope: a value inside
 * `@media (prefers-reduced-motion: reduce)` counts the same as one on `:root`.
 * For REACHABILITY that is deliberate and safe -- a channel counts as
 * dial-governed if ANY of its declarations carries the factor, and a scene that
 * carries it is still proof the channel is governed. It would only mislead in
 * the inverse shape: a channel whose ONLY factor-carrying declaration lives in a
 * conditional scene, where this gate would call the default scene governed when
 * it is not. No such channel exists today (checked while writing this). If one
 * appears, the fix is to carry at-rule context into the map, not to widen the
 * rule. The same flat read is NOT safe for asking "what does this paint by
 * default" -- that question needs the scope, and reading it flat is exactly how
 * `--ds-glass-blur` first measured as `0px` here, from the reduced-motion block.
 *
 * Run: node scripts/tokens/dial-authority-gate/index.mjs [--check|--write|--json]
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = resolve(HERE, '../../..');
const CSS = join(CORE, 'src/foundation/tokens/css');
const ARTIFACTS = join(CSS, 'facade/artifacts');
const CONTROLS = join(CORE, 'manifest/controls');
const INVENTORY = join(HERE, 'dial-authority-gate.inventory.json');

const VERTICALS = Object.freeze(['rottay', 'bithire', 'evnto']);
const DECLARATION = /^\s*(--ds-[a-z0-9-]+)\s*:\s*([^;]+);/i;
const VAR_REFERENCE = /var\(\s*(--ds-[a-z0-9-]+)/g;
const CALC_EXPRESSION = /calc\(([^;]*)\)/gi;

/** Comments name channels they deliberately do NOT use; they are not declarations. */
function withoutComments(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('/*', i);
    if (open === -1) { out += text.slice(i); break; }
    out += text.slice(i, open);
    const close = text.indexOf('*/', open + 2);
    const end = close === -1 ? text.length : close + 2;
    out += text.slice(open, end).replace(/[^\n]/g, ' ');
    i = end;
  }
  return out;
}

function collectInto(file, map) {
  for (const line of withoutComments(readFileSync(file, 'utf8')).split('\n')) {
    const match = line.match(DECLARATION);
    if (match) (map[match[1]] ??= []).push(match[2].trim());
  }
}

function walkCss(dir, map, skip) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.startsWith(skip)) continue;
      walkCss(full, map, skip);
    } else if (entry.name.endsWith('.css')) {
      collectInto(full, map);
    }
  }
}

/** A factor dial: declared by a control AND used as a calc() operand in the base. */
function factorDials(base) {
  const declared = new Set();
  for (const file of readdirSync(CONTROLS)) {
    if (!file.endsWith('.json')) continue;
    const control = JSON.parse(readFileSync(join(CONTROLS, file), 'utf8'));
    for (const channel of control.declaredOutputs?.channels ?? []) declared.add(channel);
  }
  const dials = new Set();
  for (const values of Object.values(base)) {
    for (const value of values) {
      for (const calc of value.matchAll(CALC_EXPRESSION)) {
        for (const ref of calc[1].matchAll(VAR_REFERENCE)) {
          if (declared.has(ref[1])) dials.add(ref[1]);
        }
      }
    }
  }
  return dials;
}

function reaches(map, channel, dial, seen = new Set()) {
  if (seen.has(channel)) return false;
  seen.add(channel);
  for (const value of map[channel] ?? []) {
    for (const ref of value.matchAll(VAR_REFERENCE)) {
      if (ref[1] === dial) return true;
      if (reaches(map, ref[1], dial, seen)) return true;
    }
  }
  return false;
}

/**
 * The whole judgement, as a pure function of two maps, so the drill can plant a
 * frozen literal and watch this fail without touching the tree.
 *
 * @param {Record<string, string[]>} base authored base-layer declarations
 * @param {Record<string, Record<string, string[]>>} artifacts per-vertical declarations
 * @param {Set<string>} dials the factor dials to judge against
 */
export function analyse(base, artifacts, dials) {
  const verticals = Object.keys(artifacts);
  const effective = {};
  for (const vertical of verticals) {
    effective[vertical] = { ...base, ...artifacts[vertical] };
  }
  const VERTICALS = verticals;
  const channels = new Set([...Object.keys(base), ...VERTICALS.flatMap((v) => Object.keys(artifacts[v]))]);
  const findings = [];
  for (const channel of channels) {
    for (const dial of dials) {
      if (channel === dial) continue;
      const viaBase = reaches(base, channel, dial);
      const carriers = VERTICALS.filter((v) => reaches(effective[v], channel, dial));
      if (!viaBase && carriers.length === 0) continue;
      for (const vertical of VERTICALS) {
        if (!artifacts[vertical][channel]) continue;
        if (reaches(effective[vertical], channel, dial)) continue;
        findings.push({
          channel,
          dial,
          vertical,
          frozenAs: artifacts[vertical][channel],
          dialCarriedBy: [...(viaBase ? ['base'] : []), ...carriers.filter((c) => c !== vertical)],
        });
      }
    }
  }
  findings.sort((a, b) => a.channel.localeCompare(b.channel) || a.vertical.localeCompare(b.vertical) || a.dial.localeCompare(b.dial));
  return findings;
}

export function measure() {
  const base = {};
  walkCss(CSS, base, ARTIFACTS);
  const artifacts = {};
  for (const vertical of VERTICALS) {
    artifacts[vertical] = {};
    collectInto(join(ARTIFACTS, vertical, 'index.css'), artifacts[vertical]);
  }
  const dials = factorDials(base);
  return { dials: [...dials].sort(), findings: analyse(base, artifacts, dials) };
}

const key = (f) => `${f.vertical}|${f.channel}|${f.dial}`;

function main() {
  const args = process.argv.slice(2);
  const { dials, findings } = measure();
  const inventory = JSON.parse(readFileSync(INVENTORY, 'utf8'));

  if (args.includes('--json')) {
    console.log(JSON.stringify({ dials, findings }, null, 2));
    return;
  }
  if (args.includes('--write')) {
    const pending = findings
      .filter((f) => !inventory.exceptions.some((e) => key(e) === key(f)))
      .map((f) => {
        const prior = inventory.pending.find((p) => key(p) === key(f));
        return { ...f, reason: prior?.reason ?? 'SIN ADJUDICAR — misma clase anti-puerta; ningun ruling la cubre todavia.' };
      });
    writeFileSync(INVENTORY, `${JSON.stringify({ ...inventory, pending }, null, 2)}\n`);
    console.log(`dial-authority: inventario reescrito — ${pending.length} pendientes, ${inventory.exceptions.length} excepciones`);
    return;
  }

  const failures = [];
  const listed = new Set([...inventory.pending, ...inventory.exceptions].map(key));
  for (const finding of findings) {
    if (listed.has(key(finding))) continue;
    failures.push(
      `ANTI-PUERTA NUEVA: ${finding.vertical} congela ${finding.channel} como ${JSON.stringify(finding.frozenAs)}, ` +
        `y ahi ${finding.dial} deja de mover. El factor SI esta presente en: ${finding.dialCarriedBy.join(', ')}. ` +
        `Un dial publico debe producir un cambio observable (decision 19).`
    );
  }
  const reproduced = new Set(findings.map(key));
  for (const entry of inventory.pending) {
    if (!reproduced.has(key(entry))) {
      failures.push(
        `PENDIENTE RESUELTO, sin retirar del inventario: ${entry.vertical} / ${entry.channel} / ${entry.dial} ` +
          `ya no reproduce. El inventario es decrece-solo: quitalo (--write) y baja la cuenta.`
      );
    }
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`dial-authority FAIL — ${failure}`);
    process.exit(1);
  }
  console.log(
    `dial-authority-gate OK — ${dials.length} diales de factor; ${findings.length} congelamientos, ` +
      `todos inventariados (${inventory.pending.length} pendientes sin adjudicar, ${inventory.exceptions.length} excepciones del owner)`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) main();
