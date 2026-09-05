/**
 * The posture drill.
 *
 * Every cell of the 3 x 22 matrix is AUTHORED with evidence and MEASURED here
 * against the tree. A cell cannot claim more than the engine's own surface
 * does, cannot claim less than it does, and cannot be relabelled without the
 * measurement moving with it.
 */

import { describe, expect, it } from "vitest";

import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import type {
  ControlId,
  EngineAdapter,
  EnginePosture,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import { ENGINE_NAMES } from "@/foundation/contracts/kernel/engine-identity";

import { classicThemeAdapter } from "../presentation/classic";
import { modernThemeAdapter } from "../presentation/modern";
import { rusticThemeAdapter } from "../presentation/rustic";

/* ---------------------------------------------------------------------------
 * The measurement this drill is checked against: what each engine's own
 * surface reads, which derivations really exist, and which of them a shipped
 * artifact severs. Source-only — no `dist`, so a stale build can never turn a
 * posture claim green. Inlined rather than a sibling module because a `.ts`
 * beside a test is compiled into `dist` and packed.
 * ------------------------------------------------------------------------ */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export const SRC_ROOT = resolve(__dirname, "../../../../../../..");

const ANTD_BRIDGE = join(
  SRC_ROOT,
  "infrastructure/runtime/engines/presentation/adapters/antd/index.tsx"
);
const ARTIFACT_ROOT = join(SRC_ROOT, "foundation/tokens/css/facade/artifacts");

export type MeasuredEngine = "modern" | "classic" | "rustic";
export const MEASURED_ENGINES: readonly MeasuredEngine[] = ["modern", "classic", "rustic"];

const ENGINE_SEGMENT = /(?:^|\/)engines\/(modern|classic|rustic)\//;

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "node_modules" || entry === "tests" || entry === "__snapshots__") continue;
      walk(path, out);
    } else if (
      /\.(css|ts|tsx)$/.test(entry) &&
      !/\.(test|spec)\.[tj]sx?$/.test(entry) &&
      !/\.stories\./.test(entry)
    ) {
      out.push(path);
    }
  }
  return out;
}

/** Comments are not paint: a channel named in prose must never count as a read. */
const strip = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

const files = walk(SRC_ROOT);
const text = new Map(files.map((file) => [file, strip(readFileSync(file, "utf8"))]));
const isArtifact = (file: string): boolean => file.startsWith(ARTIFACT_ROOT);
const engineOf = (file: string): MeasuredEngine | undefined =>
  (ENGINE_SEGMENT.exec(file)?.[1] as MeasuredEngine | undefined);

const surfaceText: Record<MeasuredEngine, string> = {
  modern: "",
  classic: "",
  rustic: "",
};
for (const engine of MEASURED_ENGINES) {
  surfaceText[engine] = files
    .filter((file) => !isArtifact(file) && engineOf(file) === engine)
    .map((file) => text.get(file) as string)
    .join("\n");
}
surfaceText.classic += text.get(ANTD_BRIDGE) ?? readFileSync(ANTD_BRIDGE, "utf8");

export const ENGINE_SURFACE_FILES: Record<MeasuredEngine, number> = {
  modern: files.filter((f) => !isArtifact(f) && engineOf(f) === "modern").length,
  classic: files.filter((f) => !isArtifact(f) && engineOf(f) === "classic").length + 1,
  rustic: files.filter((f) => !isArtifact(f) && engineOf(f) === "rustic").length,
};

const escape = (channel: string): string => channel.replace(/-/g, "\\-");

/** A READ is `var(--x)` or `var(--x, fallback)`. A declaration is not a read. */
export function readsChannel(engine: MeasuredEngine, channel: string): boolean {
  return new RegExp(`var\\(\\s*${escape(channel)}\\s*[,)]`).test(surfaceText[engine]);
}

export function countReads(engine: MeasuredEngine, channel: string): number {
  return (
    surfaceText[engine].match(new RegExp(`var\\(\\s*${escape(channel)}\\s*[,)]`, "g")) ?? []
  ).length;
}

export function carriesAttribute(engine: MeasuredEngine, attribute: string): boolean {
  return surfaceText[engine].includes(attribute);
}

/** `--x: ... var(--y) ...` in authored CSS is the edge `y -> x`. */
const producers = new Map<string, Set<string>>();
for (const file of files) {
  if (isArtifact(file) || !file.endsWith(".css")) continue;
  const declaration = /(--[a-z0-9-]+)\s*:\s*([^;{}]*)/gi;
  let match: RegExpExecArray | null;
  const body = text.get(file) as string;
  while ((match = declaration.exec(body))) {
    const target = match[1];
    for (const reference of match[2].matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
      const source = reference[1];
      if (source === target) continue;
      if (!producers.has(source)) producers.set(source, new Set());
      (producers.get(source) as Set<string>).add(target);
    }
  }
}

/** Every value a shipped first-party artifact declares for a channel. */
const artifactDeclarations = new Map<string, { slug: string; value: string }[]>();
for (const file of files) {
  if (!isArtifact(file)) continue;
  const slug = file.slice(ARTIFACT_ROOT.length + 1).split("/")[0];
  const declaration = /(--[a-z0-9-]+)\s*:\s*([^;{}]*)/gi;
  let match: RegExpExecArray | null;
  const body = text.get(file) as string;
  while ((match = declaration.exec(body))) {
    const rows = artifactDeclarations.get(match[1]) ?? [];
    rows.push({ slug, value: match[2].trim() });
    artifactDeclarations.set(match[1], rows);
  }
}

/**
 * A hop is severed when a shipped artifact redeclares the child without
 * referencing the parent: the derivation exists in the default theme and does
 * not survive into the vertical that ships.
 */
export function severedBy(child: string, parent: string): readonly string[] {
  return [
    ...new Set(
      (artifactDeclarations.get(child) ?? [])
        .filter((row) => !row.value.includes(`var(${parent}`))
        .map((row) => row.slug)
    ),
  ];
}

/** Validate one authored carrier chain from a declared channel to a read one. */
export function verifyCarrier(
  engine: MeasuredEngine,
  channel: string,
  via: readonly string[]
): string | null {
  if (via.length === 0) return `${channel}: empty carrier chain`;
  let previous = channel;
  for (const hop of via) {
    if (!producers.get(previous)?.has(hop))
      return `${channel}: no CSS producer derives ${hop} from ${previous}`;
    const severed = severedBy(hop, previous);
    if (severed.length > 0)
      return `${channel}: ${hop} is severed from ${previous} by ${severed.join(", ")}`;
    previous = hop;
  }
  const last = via[via.length - 1];
  if (!readsChannel(engine, last))
    return `${channel}: ${engine} does not read the carrier ${last}`;
  return null;
}

const POSTURES: readonly EnginePosture[] = ["native", "mapped", "invariant", "unsupported"];

const REGISTRY_IDS = TENANT_CAPABILITY_REGISTRY.map((control) => control.id);
const DECLARED = new Map(
  TENANT_CAPABILITY_REGISTRY.map((control) => [
    control.id as ControlId,
    {
      channels: control.derivedChannels as readonly string[],
      attributes: ((control as { derivedRootAttributes?: readonly string[] })
        .derivedRootAttributes ?? []) as readonly string[],
    },
  ])
);

const ADAPTERS: readonly [MeasuredEngine, EngineAdapter][] = [
  ["modern", modernThemeAdapter],
  ["classic", classicThemeAdapter],
  ["rustic", rusticThemeAdapter],
];

/** Declared channels this engine's own surface reads directly. */
const directReads = (engine: MeasuredEngine, id: ControlId): readonly string[] =>
  (DECLARED.get(id)?.channels ?? []).filter((channel) => readsChannel(engine, channel));

/** Declared root attributes this engine's own surface carries. */
const presentAttributes = (engine: MeasuredEngine, id: ControlId): readonly string[] =>
  (DECLARED.get(id)?.attributes ?? []).filter((attribute) => carriesAttribute(engine, attribute));

/** Declared outputs no engine surface consumes: channel debt, not an engine gap. */
function globallyUnread(id: ControlId): ReadonlySet<string> {
  const carried = new Set<string>();
  for (const [engine, adapter] of ADAPTERS) {
    const cell = adapter.controls[id];
    if (cell.posture !== "native") continue;
    for (const carrier of cell.evidence.carriers ?? []) {
      if (verifyCarrier(engine, carrier.channel, carrier.via) === null)
        carried.add(carrier.channel);
    }
  }
  return new Set(
    (DECLARED.get(id)?.channels ?? []).filter(
      (channel) =>
        !carried.has(channel) &&
        !MEASURED_ENGINES.some((engine) => readsChannel(engine, channel))
    )
  );
}

/** Declared outputs this engine neither reads, carries, nor can be excused for. */
function unaccountedFor(engine: MeasuredEngine, adapter: EngineAdapter, id: ControlId): readonly string[] {
  const cell = adapter.controls[id];
  const excused = globallyUnread(id);
  const carried = new Set(
    cell.posture === "native"
      ? (cell.evidence.carriers ?? [])
          .filter((carrier) => verifyCarrier(engine, carrier.channel, carrier.via) === null)
          .map((carrier) => carrier.channel)
      : []
  );
  const read = new Set(directReads(engine, id));
  const channels = (DECLARED.get(id)?.channels ?? []).filter(
    (channel) => !read.has(channel) && !carried.has(channel) && !excused.has(channel)
  );
  const present = new Set(presentAttributes(engine, id));
  const attributes = (DECLARED.get(id)?.attributes ?? []).filter(
    (attribute) => !present.has(attribute)
  );
  return [...channels, ...attributes];
}

describe("every adapter declares every control, once, with matching evidence", () => {
  for (const [name, adapter] of ADAPTERS) {
    it(`${name} declares exactly the registry controls`, () => {
      expect(Object.keys(adapter.controls).sort()).toEqual([...REGISTRY_IDS].sort());
    });

    it(`${name} uses only the four closed posture values`, () => {
      for (const id of REGISTRY_IDS) expect(POSTURES).toContain(adapter.controls[id].posture);
    });

    it(`${name} derives posture from its cells, never beside them`, () => {
      for (const id of REGISTRY_IDS)
        expect(adapter.posture[id]).toBe(adapter.controls[id].posture);
    });

    it(`${name} pairs each posture with the evidence kind it demands`, () => {
      const KIND: Record<EnginePosture, string> = {
        native: "channels",
        mapped: "projection",
        invariant: "delivery",
        unsupported: "absent",
      };
      for (const id of REGISTRY_IDS)
        expect(adapter.controls[id].evidence.kind).toBe(KIND[adapter.controls[id].posture]);
    });

    it(`${name} reports its own engine id, and the id is on the roster`, () => {
      expect(adapter.id).toBe(name);
      expect(ENGINE_NAMES).toContain(adapter.id);
    });
  }
});

describe("`native` names exactly what the engine's own surface consumes", () => {
  for (const [engine, adapter] of ADAPTERS) {
    for (const id of REGISTRY_IDS) {
      if (adapter.controls[id].posture !== "native") continue;
      const cell = adapter.controls[id];
      if (cell.posture !== "native") continue;

      it(`${engine}/${id}: every named channel is read on the surface`, () => {
        for (const channel of cell.evidence.read) {
          expect(DECLARED.get(id)?.channels).toContain(channel);
          expect(readsChannel(engine, channel)).toBe(true);
        }
      });

      it(`${engine}/${id}: the named set IS the measured set, with nothing hidden`, () => {
        if (cell.evidence.family) {
          // A derived family names its authored inputs; the floor below pins how
          // much of the family the engine consumes.
          for (const channel of cell.evidence.read)
            expect(directReads(engine, id)).toContain(channel);
        } else {
          expect([...cell.evidence.read].sort()).toEqual([...directReads(engine, id)].sort());
        }
      });

      it(`${engine}/${id}: every carrier chain exists in CSS and no artifact severs it`, () => {
        for (const carrier of cell.evidence.carriers ?? []) {
          expect(DECLARED.get(id)?.channels).toContain(carrier.channel);
          expect(verifyCarrier(engine, carrier.channel, carrier.via)).toBeNull();
        }
      });

      it(`${engine}/${id}: every named attribute is on the surface`, () => {
        for (const attribute of cell.evidence.attributes ?? []) {
          expect(DECLARED.get(id)?.attributes).toContain(attribute);
          expect(carriesAttribute(engine, attribute)).toBe(true);
        }
      });

      it(`${engine}/${id}: the engine consumes something of it`, () => {
        const carried = (cell.evidence.carriers ?? []).length;
        const attributes = (cell.evidence.attributes ?? []).length;
        expect(cell.evidence.read.length + carried + attributes).toBeGreaterThan(0);
      });

      it(`${engine}/${id}: the whole declared output is accounted for`, () => {
        const gaps = unaccountedFor(engine, adapter, id);
        if (cell.evidence.family) {
          // A derived family: the floor is the pinned measurement, decrease-only.
          const measured = (DECLARED.get(id)?.channels ?? []).filter((channel) =>
            readsChannel(engine, channel)
          ).length;
          expect(measured).toBeGreaterThanOrEqual(cell.evidence.family.minimumRead);
          expect(cell.evidence.family.reason.length).toBeGreaterThan(20);
        } else {
          expect(gaps).toEqual([]);
        }
      });
    }
  }
});

describe("`unsupported` means the engine reads none of it, and says how much it misses", () => {
  for (const [engine, adapter] of ADAPTERS) {
    for (const id of REGISTRY_IDS) {
      const cell = adapter.controls[id];
      if (cell.posture !== "unsupported") continue;

      it(`${engine}/${id}: the pinned gap equals the measured gap`, () => {
        expect(cell.evidence.unaccounted).toBe(unaccountedFor(engine, adapter, id).length);
        expect(cell.evidence.unaccounted).toBeGreaterThan(0);
        expect(cell.evidence.reason.length).toBeGreaterThan(20);
      });

      it(`${engine}/${id}: some other engine does deliver it, so this is a real gap`, () => {
        const elsewhere = ADAPTERS.filter(([other]) => other !== engine).some(
          ([, peer]) => peer.controls[id].posture === "native" || peer.controls[id].posture === "mapped"
        );
        expect(elsewhere).toBe(true);
      });
    }
  }
});

describe("`invariant` means the engine does not participate, and names what does", () => {
  for (const [engine, adapter] of ADAPTERS) {
    for (const id of REGISTRY_IDS) {
      const cell = adapter.controls[id];
      if (cell.posture !== "invariant") continue;

      it(`${engine}/${id}: the surface consumes none of it`, () => {
        expect(directReads(engine, id)).toEqual([]);
        expect(presentAttributes(engine, id)).toEqual([]);
      });

      it(`${engine}/${id}: the witness resolves to a real exported symbol`, async () => {
        const module = (await import(/* @vite-ignore */ cell.evidence.module)) as Record<
          string,
          unknown
        >;
        expect(Object.keys(module)).toContain(cell.evidence.symbol);
        expect(module[cell.evidence.symbol]).toBeDefined();
      });
    }
  }
});

describe("the measured matrix, so a relabelling cannot pass unnoticed", () => {
  it("pins the distribution the measurement produces", () => {
    const cells = ADAPTERS.flatMap(([, adapter]) =>
      REGISTRY_IDS.map((id) => adapter.controls[id].posture)
    );
    expect(cells).toHaveLength(66);
    const count = (posture: EnginePosture) => cells.filter((value) => value === posture).length;
    expect(count("native")).toBe(32);
    expect(count("mapped")).toBe(1);
    expect(count("invariant")).toBe(9);
    expect(count("unsupported")).toBe(24);
    expect(count("native") + count("mapped") + count("invariant") + count("unsupported")).toBe(66);
  });

  it("keeps modern the primary engine: it is never unsupported", () => {
    for (const id of REGISTRY_IDS) expect(modernThemeAdapter.posture[id]).not.toBe("unsupported");
  });

  it("agrees with the engine surfaces it measured", () => {
    // A canary on the walker itself: if the surface census silently collapsed
    // to nothing, every `unsupported` cell above would pass for the wrong
    // reason.
    expect(countReads("modern", "--ds-color-primary")).toBeGreaterThan(0);
    expect(countReads("rustic", "--ds-elevation-1")).toBeGreaterThan(0);
    expect(countReads("classic", "--ds-color-primary")).toBeGreaterThan(0);
  });
});
