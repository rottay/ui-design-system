/**
 * @fileoverview What a value READS, what a leaf WRITES, and when the two close
 * a circle.
 *
 * The vocabulary of the cycle law, below both readings that apply it: the
 * authored one inside the value station, where the override path still has a
 * name, and the emitted one over the tenant's compiled delta.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Foundation/References
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";
import { compareCodeUnits } from "@/foundation/kernel/serialization";
import { chromeToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";

/** Every `--ds-*` channel a value reads, fallback positions included. */
export function channelReferences(value: string): readonly string[] {
  return [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map(
    (match) => match[1]
  );
}

/** A value the probe can tell apart from anything the emitter invents. */
const CHROME_PROBE_VALUE = "__cycle-probe__";

const chromeWriteSets = new Map<string, ReadonlySet<string>>();

/** The channels the emitter states when NOTHING is authored. */
const CHROME_CONSTANTS: ReadonlySet<string> = new Set(
  Object.keys(chromeToVariables({} as BrandChrome))
);

function nest(field: string, value: string): BrandChrome {
  const trail = field.split(".");
  const root: Record<string, unknown> = {};
  let node = root;
  for (const key of trail.slice(0, -1)) {
    const child: Record<string, unknown> = {};
    node[key] = child;
    node = child;
  }
  node[trail[trail.length - 1]] = value;
  return root as BrandChrome;
}

/**
 * The `--ds-*` channels one authored chrome leaf writes, asked of the emitter
 * rather than restated.
 *
 * A restated map is a second answer to "where does this leaf land", and the one
 * leaf that needed this law -- `controls.buttonGeometry.radius` -- is precisely
 * a leaf whose fan-out is six channels rather than one.
 */
export function chromeLeafChannels(field: string): ReadonlySet<string> {
  const cached = chromeWriteSets.get(field);
  if (cached) return cached;
  let written: ReadonlySet<string>;
  try {
    written = new Set(
      Object.keys(chromeToVariables(nest(field, CHROME_PROBE_VALUE))).filter(
        (channel) => !CHROME_CONSTANTS.has(channel)
      )
    );
  } catch {
    // A leaf the probe cannot exercise has no write set to contest at the door;
    // the emitted reading still measures whatever it lowers to.
    written = new Set();
  }
  chromeWriteSets.set(field, written);
  return written;
}

/**
 * The reference this authored chrome value closes on itself, or null.
 *
 * `field` is the leaf's trail below `chrome`, which is what the write-set probe
 * is keyed on; `value` is the authored value verbatim.
 */
export function authoredSelfReference(
  field: string,
  value: string
): string | null {
  if (!value.includes("var(")) return null;
  const written = chromeLeafChannels(field);
  if (written.size === 0) return null;
  return (
    channelReferences(value).find((channel) => written.has(channel)) ?? null
  );
}

/**
 * Every channel that lies ON a reference cycle, mapped to the cycle it closes.
 *
 * Edges are drawn only into channels the map itself defines, because a
 * reference out of it resolves against the vertical's own compiled baseline --
 * code-owned and acyclic by construction -- and terminates there.
 */
export function cyclesIn(
  variables: Readonly<Record<string, string>>
): Map<string, readonly string[]> {
  const found = new Map<string, readonly string[]>();
  const settled = new Set<string>();
  const open: string[] = [];
  const visit = (channel: string): void => {
    if (settled.has(channel)) return;
    const depth = open.indexOf(channel);
    if (depth >= 0) {
      const cycle = [...open.slice(depth), channel];
      for (const node of cycle.slice(0, -1)) {
        if (!found.has(node)) found.set(node, cycle);
      }
      return;
    }
    open.push(channel);
    for (const reference of channelReferences(variables[channel])) {
      if (variables[reference] !== undefined) visit(reference);
    }
    open.pop();
    settled.add(channel);
  };
  for (const channel of Object.keys(variables).sort(compareCodeUnits)) {
    visit(channel);
  }
  return found;
}
