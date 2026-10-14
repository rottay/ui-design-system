/**
 * Named receivers for the application-boundary gate: the CI step that must
 * provision the corpus, and the application owners of registered reaches.
 * Pure: the gate passes in everything it measured.
 */

/** The ci.yml wiring that must provision the corpus. */
export const CORPUS_CI_RECEIVER =
  '.github/workflows/ci.yml job `core` ("Core Library"): step "Check out app-bithire ' +
  '(boundary-gate corpus)" (ref = the corpus pin, path .corpora/app-bithire) exported as ' +
  'APP_BITHIRE_ROOT to step "Quality gates (manifest-driven, blocking)". The pin-move ' +
  'obligation is registered with the DT (no live WO yet).';

/** A named refusal, never a pass: an unaudited corpus is not a clean one. */
export function corpusRefusal(reason, pin) {
  return [
    `application-boundary-gate: REFUSED — ${reason}`,
    `  corpus pin: ${pin ?? "unpinned"}`,
    `  CI receiver: ${CORPUS_CI_RECEIVER}`,
  ].join("\n");
}

const REGISTRATION_KINDS = ["path-relocation", "ds-block-adoption"];
const REGISTRATION_FIELDS = ["id", "route", "selector", "kind", "owner", "enteredIn", "enteredOn", "measuredAt", "reason"];

/**
 * Registered private-anatomy reaches name a route, an entry commit and an app
 * receiver. They are NEVER consumed: the caller keeps every registered reach
 * among its failures, so registration annotates the red and cannot clear it.
 */
export function evaluateRegistrations(register, liveReaches, baselineReaches, corpusSha) {
  const failures = [];
  const registered = new Map();
  const baselined = new Set(Object.keys(baselineReaches ?? {}));
  if ((register.entries ?? []).length > 0 && !register.receiver?.trim()) {
    failures.push("[registrations] the register names no application receiver");
  }
  for (const entry of register.entries ?? []) {
    const name = entry.id ?? "<unnamed>";
    for (const field of REGISTRATION_FIELDS) {
      if (typeof entry[field] !== "string" || entry[field].trim() === "") {
        failures.push(`[registrations] ${name} is missing ${field}`);
      }
    }
    if (typeof entry.kind === "string" && !REGISTRATION_KINDS.includes(entry.kind)) {
      failures.push(`[registrations] ${name} kind "${entry.kind}" is not one of ${REGISTRATION_KINDS.join(", ")}`);
    }
    if (typeof entry.count !== "number") failures.push(`[registrations] ${name} is missing an exact count`);
    if (entry.id !== `${entry.route} :: ${entry.selector}`) {
      failures.push(`[registrations] ${name} does not equal "<route> :: <selector>"`);
    }
    if (baselined.has(entry.id)) {
      failures.push(`[registrations] ${name} also appears in baseline.reaches; registration never admits a reach`);
    }
    registered.set(entry.id, entry);
    if (corpusSha && corpusSha === entry.measuredAt && liveReaches.get(entry.id) !== entry.count) {
      failures.push(
        `[registrations] ${name} measured ${liveReaches.get(entry.id) ?? 0} at its own revision, registered ${entry.count}; re-derive or delete the entry`,
      );
    }
  }
  return { failures, registered };
}

export function receiverNote(registered, id) {
  const entry = registered.get(id);
  if (!entry) return "";
  return ` — registered ${entry.kind}, entered ${String(entry.enteredIn).slice(0, 10)} ${entry.enteredOn}, receiver ${entry.owner}`;
}
