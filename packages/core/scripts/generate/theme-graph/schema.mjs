/**
 * The derived cascade graph: schema, and the law that keeps it derived.
 *
 * `audit/40-architecture/manifest` §3 names five node kinds and five edge kinds
 * that answer mechanically what the retired manifest simulated. This file holds
 * that shape and nothing else -- no data. Every value that ever lands in a node
 * or an edge is READ from one of the five measured sources named below; none is
 * written here, and a graph a person could hand-author is the defect F-04
 * records, not a shortcut.
 *
 * WHERE EACH KIND COMES FROM, and why that source is a measurement:
 *
 *   decision  THEME_CONTROL_CATALOG, the typed catalog. The one authored list
 *             in the chain, and the only one: it IS the product decision.
 *   deriver   FAMILY_DERIVERS. The registry the compiler itself iterates; the
 *             file is resolved from the family, not declared twice.
 *   channel   a dry-run of the real pipeline over 3 verticals x 2 modes. The
 *             producing family comes from `runDerivation`'s own `provenance`
 *             map, so attribution is the compiler's answer and not a re-reading
 *             of the `produces` patterns, which are authored and may drift.
 *   consumer  `artifacts/generated/manifest/cascade/edges`, the measured read
 *             census, which already carries file, line, selector and property.
 *   family    the physical skin tree on disk plus the component tier that owns
 *             it. A directory listing, not an inventory someone maintains.
 *
 * NO UNKNOWN CELLS. The retired manifest published 5,355 control x family cells
 * every one of which said `UNKNOWN`, and a gate that accepted them. Here a fact
 * that was not measured produces NO row: a channel nobody reads simply has no
 * edge to a consumer, and that absence is the finding. `assertNoUnknown` below
 * refuses any value that smuggles a placeholder back in.
 */

/** The five node kinds, in the order the graph is built. */
export const NODE_KINDS = Object.freeze(["decision", "deriver", "channel", "consumer", "family"]);

/** The five edge kinds, each naming the measurement that produces it. */
export const EDGE_KINDS = Object.freeze({
  consumes: { from: "decision", to: "deriver", source: "FAMILY_DERIVERS[].consumes matched against the catalog ids" },
  produces: { from: "deriver", to: "channel", source: "runDerivation().provenance over 3 verticals x 2 modes" },
  aliases: { from: "channel", to: "channel", source: "cascade/edges (measured var() reference graph)" },
  reads: { from: "channel", to: "consumer", source: "cascade/edges readSites (file:line:selector:property)" },
  paints: { from: "consumer", to: "family", source: "the consumer file's own path under the skin or component tree" },
});

/** Values that would re-admit a manifest cell. A graph carrying one is refused. */
const PLACEHOLDERS = new Set(["UNKNOWN", "UNATTRIBUTED", "TBD", "PRESCRIPCION", "PRESCRIPTION", "PENDING"]);

/**
 * Refuse a placeholder anywhere in the emitted graph.
 *
 * Structural: it walks the value rather than checking a field list, because the
 * defect it guards against is a NEW field carrying the old habit. `null` and
 * `undefined` are refused in the same sweep for the same reason -- an absent
 * fact is expressed by omitting the row, never by a null standing in for it.
 */
export function assertNoUnknown(value, path = "$") {
  if (typeof value === "string") {
    if (PLACEHOLDERS.has(value.trim().toUpperCase())) {
      throw new Error(`theme-graph: placeholder ${JSON.stringify(value)} at ${path} — the graph carries measured facts only`);
    }
    return;
  }
  if (value === null || value === undefined) {
    throw new Error(`theme-graph: ${value} at ${path} — an unmeasured fact is omitted, never nulled`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoUnknown(item, `${path}[${index}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value)) assertNoUnknown(child, `${path}.${key}`);
  }
}

/** Canonical JSON: sorted keys at every depth, so a digest moves only when a FACT moves. */
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]));
  }
  return value;
}

/**
 * COMPACT on purpose. These are machine artifacts compared by digest, and a
 * two-space indent tripled them past the 5 MB budget the architecture note
 * sets. The human surface is the `by-control` / `by-family` views and the
 * Markdown generated from them, not this.
 */
export function stableStringify(value, { pretty = false } = {}) {
  return `${JSON.stringify(canonical(value), null, pretty ? 2 : 0)}\n`;
}
