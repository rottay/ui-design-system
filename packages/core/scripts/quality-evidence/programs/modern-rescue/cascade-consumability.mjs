#!/usr/bin/env node
/**
 * cascade-consumability.mjs — the DOWNSTREAM FENCE (PRE_F4B lote A, path A7).
 *
 * WHY. `manifest/cascade/materialized/**` and `backlog/**` are stale, and one
 * of the two producers does not even run end to end: `cascade-backlog.mjs`
 * reads two absolute paths under `/private/tmp` that do not exist on any clean
 * checkout, so `producers.draft.json` cannot be regenerated at all. Neither
 * producer has a pure `--check`. Nothing in CI reads any of it, which is
 * exactly why it could rot unnoticed — and exactly why F4B must not be allowed
 * to pick it up as if it described the tree.
 *
 * WHAT THIS IS NOT. It is not a freshness gate: it never runs the impure
 * producers, and it never claims a file is fresh. It seals four things that
 * ARE observable without executing anything downstream:
 *
 *   1. the exact membership of both directories;
 *   2. the substrate digest the fence was cut against;
 *   3. the `planeVocabulary` each artifact ALREADY declares in its own bytes;
 *   4. the purity of the producer, which is a property of the script.
 *
 * NO OUTPUT IS EVER `CONSUMABLE`. The state does not exist in the emitted
 * vocabulary, because no downstream producer can demonstrate freshness today,
 * and granting it would be inventing data. The measured 6 + 3 + 11 staleness
 * split lives in `authoredCensus` as DIAGNOSIS with its recipe and provenance,
 * never as generated state.
 *
 * TWO APIS, DELIBERATELY SEPARATE (addendum V3-4):
 *   validateInventory()      -- what A10 calls. Passes when the outputs are
 *                               correctly enumerated and correctly BLOCKED.
 *   assertConsumable(paths)  -- what a real F4B consumer calls. Throws when a
 *                               requested path has no consumable state.
 * Collapsing them would make the blocking gate permanently red for doing its
 * job, which is how a fence gets deleted instead of respected.
 *
 * CLI: --check (default, fail-closed) | --write.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST = join(HERE, "../../../../manifest");
const OUT = join(MANIFEST, "cascade/extracted/consumability.json");
const SUBSTRATE = join(MANIFEST, "cascade/extracted/css-edges.json");
const MATERIALIZED = join(MANIFEST, "cascade/materialized");
const BACKLOG = join(MANIFEST, "cascade/backlog");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/** Closed vocabulary. Note what is NOT in it: `CONSUMABLE`. */
export const STATE_VOCABULARY = [
  "STALE_OWN_INPUTS",
  "STALE_SUBSTRATE",
  "UNVERIFIED_PRODUCER_IMPURE",
  "UNREPRODUCIBLE_BLOCKED",
];

/** The two states this writer can DERIVE without running an impure producer. */
export const DERIVABLE_STATES = ["UNVERIFIED_PRODUCER_IMPURE", "UNREPRODUCIBLE_BLOCKED"];

/**
 * The state each namespace MUST carry. Validating only against the closed
 * vocabulary let a backlog row claim `STALE_OWN_INPUTS` -- a legal name, and a
 * state this writer may not derive -- and pass.
 */
export const STATE_BY_NAMESPACE = {
  materialized: "UNVERIFIED_PRODUCER_IMPURE",
  backlog: "UNREPRODUCIBLE_BLOCKED",
};

export const PLANE_VOCABULARY = ["css", "ts-compilers", "ts-chrome-variables", "tsx-inline-stamp"];

/**
 * The measured staleness split. DIAGNOSIS, not state: reproducing it requires
 * running `cascade-materialize.mjs` with its output redirected, which is
 * exactly the impure operation this fence refuses to perform.
 */
const AUTHORED_CENSUS = {
  measuredOn: "2026-08-22",
  isComputed: false,
  source:
    "/private/tmp/pre-f4b-v2-sonnet-measurements.md sha256 d09d3a7ae85e6f05b1d055c829c6fe5757e7c91518bd38e24e39ee0b5d86498f, section 6.2",
  recipe:
    "run a copy of cascade-materialize.mjs with OUT_DIR redirected to tmp, twice: once against the committed css-edges.json and once against a freshly extracted one, then `diff -rq` each result against manifest/cascade/materialized/.",
  staleAgainstOwnInputs: {
    count: 6,
    controls: [
      "chrome.anatomy",
      "experience.profile",
      "profiles.expressive",
      "recipe-profile",
      "responsive.posture",
      "typography.families",
    ],
    note: "differ TODAY against their own declared inputs (controls/, roots/), with no substrate refresh involved.",
  },
  staleOnlyWithFreshSubstrate: {
    count: 3,
    controls: ["shape.radius-scale", "spacing.rhythm", "typography.scale"],
    note: "differ only once the substrate is also refreshed: compound debt, not a defect of materialize itself.",
  },
  identicalUnderBothRuns: {
    count: 11,
    note: "not contradicted by either run. NOT certified fresh: the producer has no pure --check, so freshness is unprovable, which is why every materialized output still carries UNVERIFIED_PRODUCER_IMPURE.",
  },
};

const PRODUCERS = {
  materialized: {
    producer: "cascade-materialize.mjs",
    producerPurity: "impure-no-check",
    purityEvidence:
      "reads process.argv only to filter which controlIds to process; calls writeFileSync unconditionally for every control. No read-only mode exists.",
    state: "UNVERIFIED_PRODUCER_IMPURE",
    reason:
      "the producer cannot be run without writing, so freshness cannot be certified. Not contradicted is not the same as fresh.",
  },
  backlog: {
    producer: "cascade-backlog.mjs",
    producerPurity: "impure-no-check",
    purityEvidence:
      "same unconditional writeFileSync, and its PRODUCERS DRAFT section reads two absolute paths under /private/tmp (BACKLOG_FILE :295, CANONICAL_FILE :296) that do not exist on a clean checkout; the script crashes with ENOENT after emitting the per-control files.",
    state: "UNREPRODUCIBLE_BLOCKED",
    reason:
      "the producer does not run end to end anywhere but the machine that once left those two files in /private/tmp. producers.draft.json is therefore irreproducible today. F4B may neither consume this nor promise to regenerate it until those inputs are committed or injectable AND the script has a pure --check.",
  },
};

/**
 * EVERY member of the directory, not just the `.json` ones. The contract asks
 * for exact membership, and a filter that skips a stray file makes the fence
 * blind to precisely the member nobody expected.
 */
const listMembers = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : []);

/** Read `planeVocabulary` ONLY where the field exists; absence is observable. */
function declaredVocabularyOf(abs) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(abs, "utf8"));
  } catch {
    return { declaredPlaneVocabulary: null, vocabularyObservable: "unparseable" };
  }
  if (!Array.isArray(parsed.planeVocabulary)) {
    return { declaredPlaneVocabulary: null, vocabularyObservable: "absent" };
  }
  const declared = parsed.planeVocabulary;
  const matches =
    declared.length === PLANE_VOCABULARY.length &&
    declared.every((name, index) => name === PLANE_VOCABULARY[index]);
  return {
    declaredPlaneVocabulary: declared,
    vocabularyObservable: matches ? "current" : "superseded",
  };
}

export function buildConsumability({
  substratePath = SUBSTRATE,
  materializedDir = MATERIALIZED,
  backlogDir = BACKLOG,
  manifestRel = "manifest/cascade",
} = {}) {
  const outputs = [];
  const collect = (dir, relDir, spec) => {
    for (const name of listMembers(dir)) {
      const abs = join(dir, name);
      const isJson = name.endsWith(".json");
      outputs.push({
        path: `${manifestRel}/${relDir}/${name}`,
        namespace: relDir,
        isJson,
        state: spec.state,
        producer: spec.producer,
        producerPurity: spec.producerPurity,
        purityEvidence: spec.purityEvidence,
        reason: spec.reason,
        owner: "DT / modern-rescue programme",
        blockedFor: ["F4B"],
        ...(isJson
          ? declaredVocabularyOf(abs)
          : { declaredPlaneVocabulary: null, vocabularyObservable: "not-json" }),
      });
    }
  };
  collect(materializedDir, "materialized", PRODUCERS.materialized);
  collect(backlogDir, "backlog", PRODUCERS.backlog);

  const membership = outputs.map((entry) => entry.path);
  return {
    generated: true,
    generator: "cascade-consumability.mjs",
    schemaVersion: 1,
    law: {
      noConsumableState:
        "`CONSUMABLE` is absent from the emitted vocabulary on purpose: no downstream producer can demonstrate freshness today, and granting it would be inventing data.",
      sealedWithoutRunning:
        "membership, substrate digest, each artifact's OWN declared planeVocabulary and the producer's purity are all observable without executing any downstream producer. Nothing here runs materialize or backlog.",
      twoApis:
        "validateInventory() is the blocking check (it PASSES when outputs are correctly blocked); assertConsumable(paths) is the consumer API (it THROWS for a blocked path). One gate, one consumer, never the same function.",
      diagnosisIsNotState:
        "the measured 6 + 3 + 11 staleness split lives in authoredCensus with its recipe and provenance. It is diagnosis, never generated state.",
    },
    substrate: {
      path: `${manifestRel}/extracted/css-edges.json`,
      schemaVersion: 2,
      digest: existsSync(substratePath) ? sha256(readFileSync(substratePath)) : null,
    },
    planeVocabulary: PLANE_VOCABULARY,
    stateVocabulary: STATE_VOCABULARY,
    derivableStates: DERIVABLE_STATES,
    authoredCensus: AUTHORED_CENSUS,
    stats: {
      outputs: outputs.length,
      byState: outputs.reduce((acc, entry) => {
        acc[entry.state] = (acc[entry.state] ?? 0) + 1;
        return acc;
      }, {}),
      byVocabularyObservable: outputs.reduce((acc, entry) => {
        acc[entry.vocabularyObservable] = (acc[entry.vocabularyObservable] ?? 0) + 1;
        return acc;
      }, {}),
      consumable: 0,
    },
    digests: {
      membership: sha256(JSON.stringify(membership)),
      states: sha256(JSON.stringify(outputs.map((entry) => [entry.path, entry.state]))),
      declaredVocabularies: sha256(
        JSON.stringify(outputs.map((entry) => [entry.path, entry.declaredPlaneVocabulary])),
      ),
    },
    outputs,
  };
}

/* ------------------------------------------------------------ the gate --- */

/**
 * The BLOCKING check. Returns findings; empty means the fence is intact.
 *
 * It deliberately PASSES while every output is blocked: a fence that fails for
 * doing its job gets deleted, not respected.
 */
export function validateInventory({
  inventoryPath = OUT,
  substratePath = SUBSTRATE,
  materializedDir = MATERIALIZED,
  backlogDir = BACKLOG,
  manifestRel = "manifest/cascade",
} = {}) {
  const findings = [];
  if (!existsSync(inventoryPath)) return [`consumability.json is missing at ${inventoryPath}`];
  let inventory;
  try {
    inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
  } catch {
    return ["consumability.json is not valid JSON"];
  }

  // The stored fence is compared against a LIVE rebuild, not against digests it
  // computed from itself. Self-consistency proves only that nobody edited the
  // JSON by hand; it says nothing about the 42 artifacts, their producers or
  // the vocabulary each one actually declares in its own bytes.
  const live = buildConsumability({ substratePath, materializedDir, backlogDir, manifestRel });
  const liveByPath = new Map(live.outputs.map((entry) => [entry.path, entry]));
  const storedRows = inventory.outputs ?? [];
  const storedByPath = new Map();
  for (const entry of storedRows) {
    if (storedByPath.has(entry.path)) {
      findings.push(`consumability: ${entry.path} is enumerated more than once`);
      continue;
    }
    storedByPath.set(entry.path, entry);
  }

  for (const path of liveByPath.keys()) {
    if (!storedByPath.has(path)) findings.push(`consumability: ${path} exists on disk but is not enumerated`);
  }
  for (const path of storedByPath.keys()) {
    if (!liveByPath.has(path)) findings.push(`consumability: ${path} is enumerated but does not exist on disk`);
  }

  const FIELDS = [
    "namespace",
    "isJson",
    "state",
    "producer",
    "producerPurity",
    "purityEvidence",
    "reason",
    "declaredPlaneVocabulary",
    "vocabularyObservable",
  ];
  for (const [path, stored] of storedByPath) {
    const observed = liveByPath.get(path);
    if (!observed) continue;
    for (const field of FIELDS) {
      if (JSON.stringify(stored[field]) !== JSON.stringify(observed[field])) {
        findings.push(
          `consumability: ${path} records ${field}=${JSON.stringify(stored[field])} but the live artifact observes ${JSON.stringify(observed[field])}`,
        );
      }
    }
    const required = STATE_BY_NAMESPACE[observed.namespace];
    if (required && stored.state !== required) {
      findings.push(
        `consumability: ${path} is under ${observed.namespace}/ and must carry ${required}, not ${stored.state}`,
      );
    }
    if (!DERIVABLE_STATES.includes(stored.state)) {
      findings.push(
        `consumability: ${path} carries ${stored.state}, which this writer may not derive without running an impure producer`,
      );
    }
    if (stored.state === "CONSUMABLE") {
      findings.push(`consumability: ${path} claims CONSUMABLE, which no producer can demonstrate today`);
    }
    if (!stored.reason || !stored.owner || !Array.isArray(stored.blockedFor) || stored.blockedFor.length === 0) {
      findings.push(`consumability: ${path} lacks reason, owner or blockedFor -- silence is not acceptance`);
    }
    if (observed.isJson === false) {
      findings.push(
        `consumability: ${path} is a non-JSON member of a fenced namespace; membership is exact and an unexpected member needs a ruling, not a silent skip`,
      );
    }
  }

  const realSubstrate = existsSync(substratePath) ? sha256(readFileSync(substratePath)) : null;
  if (inventory.substrate?.digest !== realSubstrate) {
    findings.push(
      `consumability: the sealed substrate digest ${inventory.substrate?.digest} is not the current css-edges.json ${realSubstrate}`,
    );
  }

  // Digests are recomputed from the STORED rows (a hand edit that also fixed
  // the digest still has to survive the live comparison above).
  const enumerated = storedRows.map((entry) => entry.path);
  const recomputed = {
    membership: sha256(JSON.stringify(enumerated)),
    states: sha256(JSON.stringify(storedRows.map((e) => [e.path, e.state]))),
    declaredVocabularies: sha256(
      JSON.stringify(storedRows.map((e) => [e.path, e.declaredPlaneVocabulary])),
    ),
  };
  for (const key of Object.keys(recomputed)) {
    if (inventory.digests?.[key] !== recomputed[key]) {
      findings.push(`consumability: the ${key} digest does not match the enumerated outputs`);
    }
  }
  if (
    !Array.isArray(inventory.planeVocabulary) ||
    inventory.planeVocabulary.length !== PLANE_VOCABULARY.length ||
    inventory.planeVocabulary.some((name, index) => name !== PLANE_VOCABULARY[index])
  ) {
    findings.push("consumability: the sealed planeVocabulary is not the current four-plane vocabulary");
  }
  if (inventory.stats?.consumable !== 0) {
    findings.push("consumability: stats.consumable must be 0; nothing downstream can be certified fresh today");
  }
  return findings;
}

/**
 * The CONSUMER API. A future F4B step calls this before reading anything under
 * `manifest/cascade/materialized/**` or `backlog/**`.
 */
export function assertConsumable(paths, { inventoryPath = OUT } = {}) {
  const requested = Array.isArray(paths) ? paths : [paths];
  const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
  const byPath = new Map((inventory.outputs ?? []).map((entry) => [entry.path, entry]));
  const FENCED_NAMESPACES = ["manifest/cascade/materialized/", "manifest/cascade/backlog/"];
  const blocked = [];
  for (const path of requested) {
    const entry = byPath.get(path);
    if (entry) {
      blocked.push(`${path} [${entry.state}] ${entry.reason}`);
      continue;
    }
    // A path INSIDE a fenced namespace that the inventory does not know is the
    // most dangerous case, not the safe one: it is a member nobody sealed.
    // Only paths outside both namespaces are out of scope.
    if (FENCED_NAMESPACES.some((namespace) => path.startsWith(namespace))) {
      blocked.push(`${path} [UNKNOWN_MEMBER] inside a fenced namespace but absent from the inventory`);
    }
  }
  if (blocked.length > 0) {
    throw new Error(
      `assertConsumable: ${blocked.length} requested path(s) are fenced and must not be consumed:\n  ` +
        blocked.join("\n  "),
    );
  }
  return true;
}

/* --------------------------------------------------------- serialise --- */
const ROW_ARRAYS = new Set(["outputs"]);

export function serialize(output) {
  const keys = Object.keys(output);
  const lines = ["{"];
  keys.forEach((key, index) => {
    const comma = index === keys.length - 1 ? "" : ",";
    if (ROW_ARRAYS.has(key)) {
      const rows = output[key];
      if (rows.length === 0) {
        lines.push(`  ${JSON.stringify(key)}: []${comma}`);
        return;
      }
      lines.push(`  ${JSON.stringify(key)}: [`);
      rows.forEach((row, rowIndex) => {
        lines.push(`    ${JSON.stringify(row)}${rowIndex === rows.length - 1 ? "" : ","}`);
      });
      lines.push(`  ]${comma}`);
      return;
    }
    const body = JSON.stringify(output[key], null, 2)
      .split("\n")
      .map((line, lineIndex) => (lineIndex === 0 ? line : `  ${line}`))
      .join("\n");
    lines.push(`  ${JSON.stringify(key)}: ${body}${comma}`);
  });
  lines.push("}");
  return lines.join("\n") + "\n";
}

export const OUT_PATH = OUT;

function usage(stream) {
  stream.write(
    "usage: node cascade-consumability.mjs [--check|--write]\n" +
      "  --check  (default) recompute and byte-compare against the committed fence; never writes\n" +
      "  --write  regenerate the fence\n",
  );
}

function main(argv) {
  const mode = argv.length === 0 ? "--check" : argv[0];
  if (argv.length > 1 || (mode !== "--check" && mode !== "--write")) {
    usage(process.stderr);
    process.exit(2);
  }
  const output = buildConsumability();
  const text = serialize(output);
  if (mode === "--check") {
    let onDisk = null;
    try {
      onDisk = readFileSync(OUT, "utf8");
    } catch {
      console.error(`cascade-consumability --check FAILED: ${OUT} does not exist`);
      process.exit(1);
    }
    if (onDisk !== text) {
      console.error(
        "cascade-consumability --check FAILED: the committed fence is not what the tree produces.\n" +
          "  run: node cascade-consumability.mjs --write",
      );
      process.exit(1);
    }
    console.log(`cascade-consumability --check OK -- ${OUT} matches the tree`);
    return;
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, text);
  console.log(`outputs fenced:       ${output.stats.outputs}`);
  console.log(`by state:             ${JSON.stringify(output.stats.byState)}`);
  console.log(`vocabulary observed:  ${JSON.stringify(output.stats.byVocabularyObservable)}`);
  console.log(`consumable:           ${output.stats.consumable}`);
  console.log(`wrote ${OUT}`);
}

const isMain =
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isMain) main(process.argv.slice(2));
