#!/usr/bin/env node
// Copied from app-bithire@c12901962 scripts/roadmap-status.mjs (2026-07-06).
// Byte-identical to the source except: (1) this provenance header, and (2) the
// LANES constant, which is the one repo-specific line — this repo has a single
// `engine-modern` lane. All orchestration logic is unchanged.
// - Divergence (2026-07-06, owner request): `progress` command + progressLog — step-level mid-WO handoff trail (STATUS shows the last entry; show/delegate print the full trail). Upstream-later candidate for app-bithire.
// - Divergence (2026-07-07, owner approval): added the `craft` lane (LANES = ['engine-modern','craft']) — DS interaction/craft/brand-tooling WOs (WO-CRA-01..05) converted from the approved proposals inbox.
// - Divergence (2026-07-07, owner approval: full-program conversion): three new lanes (LANES = ['engine-modern','craft','gates','tokens','architecture']) — WO-GAT-01..04, WO-TOK-01..03, WO-ARC-01..05, and the craft extension WO-CRA-06..10 converted from the approved proposals inbox.
// - Divergence (2026-07-07, owner approval then EXTRACTION): the `showroom` lane (WO-SHW-01..05, the commercial Monochrome Signature relaunch + the shared `@rottay/design-system/commercial` kit) was added 2026-07-07 and then EXTRACTED the same day (owner isolation decision) into the standalone `roadmap-commercial/` program with its own machinery (scripts/roadmap-commercial-status.mjs, `pnpm roadmap:commercial`). LANES here reverts to ['engine-modern','craft','gates','tokens','architecture']; the showroom lane is no longer part of this graph.
/**
 * Roadmap work-order orchestrator.
 *
 * Single source of WO STATE is roadmap/registry.json; WO SPECS live in the
 * lane markdown files (roadmap/{security,completeness,ux,design-adoption}.md).
 * This CLI is the only sanctioned way to change a WO status, so the
 * dependency graph and the documented sequencing hazards are enforced
 * mechanically instead of by prose.
 *
 * Commands:
 *   status                     regenerate roadmap/STATUS.md and print a summary
 *   check                      validate registry <-> lane-file consistency (CI gate; exit 1 on drift)
 *   next                       list actionable WOs (todo with satisfied deps)
 *   show <WO-ID>               print the full WO spec block + current state
 *   delegate <WO-ID>           print the ready-to-paste delegation prompt + fences + state warnings
 *   claim <WO-ID> [--by name]  mark in-progress (refused while dependencies are open)
 *   progress <WO-ID> --note "t" [--by name]  append a step-level progress entry (in-progress only)
 *   done <WO-ID> --evidence "<how the acceptance gate was proven>"
 *   reopen <WO-ID> [--note t]  back to todo with a handoff note
 *
 * mustLandWith semantics ("same certified window"): a dependency that is also
 * a mustLandWith partner counts as satisfied while in-progress, and `done`
 * requires every partner to be at least in-progress. This encodes the
 * SEC-01/SEC-05 hazard without deadlocking the pair.
 *
 * Mid-WO continuity: executors append a `progress` entry after every completed
 * step and when hitting a blocker. If an agent dies mid-WO, the successor runs
 * `show <WO-ID>` and resumes from the last logged step instead of restarting.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROADMAP = path.join(ROOT, "roadmap");
const REGISTRY_PATH = path.join(ROADMAP, "registry.json");
const STATUS_PATH = path.join(ROADMAP, "STATUS.md");
const LANES = ["engine-modern", "craft", "gates", "tokens", "architecture"];
const STATUSES = ["todo", "in-progress", "done"];

const loadRegistry = () => JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const saveRegistry = (reg) => {
  reg.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 1) + "\n");
};
const byId = (reg) => Object.fromEntries(reg.workOrders.map((w) => [w.id, w]));

function laneHeadings(lane) {
  const text = fs.readFileSync(path.join(ROADMAP, `${lane}.md`), "utf8");
  return [...text.matchAll(/^### (WO-[A-Z]+-\d+)\s+(.+)$/gm)].map((m) => ({ id: m[1], title: m[2].trim() }));
}

function woBlock(lane, id) {
  const text = fs.readFileSync(path.join(ROADMAP, `${lane}.md`), "utf8");
  const re = new RegExp(`^### ${id}[\\s\\S]*?(?=^### WO-|^## |$(?![\\s\\S]))`, "m");
  const m = text.match(re);
  return m ? m[0].trim() : null;
}

function depSatisfied(w, depId, map) {
  const dep = map[depId];
  if (!dep) return false;
  if (dep.status === "done") return true;
  return (w.mustLandWith || []).includes(depId) && dep.status === "in-progress";
}
const openDeps = (w, map) => (w.dependsOn || []).filter((d) => !depSatisfied(w, d, map));
const actionable = (reg, map) => reg.workOrders.filter((w) => w.status === "todo" && openDeps(w, map).length === 0);

function detectCycles(reg) {
  const map = byId(reg);
  const state = {};
  const cycles = [];
  const visit = (id, stack) => {
    if (state[id] === 2) return;
    if (state[id] === 1) { cycles.push([...stack, id].join(" -> ")); return; }
    state[id] = 1;
    for (const d of map[id]?.dependsOn || []) if (map[d]) visit(d, [...stack, id]);
    state[id] = 2;
  };
  for (const w of reg.workOrders) visit(w.id, []);
  return cycles;
}

function check() {
  const reg = loadRegistry();
  const map = byId(reg);
  const errors = [];
  const seen = new Set();
  for (const lane of LANES) {
    for (const h of laneHeadings(lane)) {
      seen.add(h.id);
      const w = map[h.id];
      if (!w) errors.push(`${lane}.md has ${h.id} but registry.json does not — add it via a registry entry`);
      else {
        if (w.lane !== lane) errors.push(`${h.id}: lane mismatch (registry=${w.lane}, file=${lane}.md)`);
        if (w.title !== h.title) errors.push(`${h.id}: title drift (registry="${w.title}" vs file="${h.title}")`);
      }
    }
  }
  for (const w of reg.workOrders) {
    if (!seen.has(w.id)) errors.push(`registry has ${w.id} but no heading in ${w.lane}.md`);
    if (!STATUSES.includes(w.status)) errors.push(`${w.id}: invalid status "${w.status}"`);
    for (const d of w.dependsOn || []) if (!map[d]) errors.push(`${w.id}: unknown dependency ${d}`);
    for (const p of w.mustLandWith || []) if (!map[p]) errors.push(`${w.id}: unknown mustLandWith ${p}`);
    if (w.status === "done" && !w.evidence) errors.push(`${w.id}: done without evidence — reopen or record evidence`);
    if (w.status === "done") for (const d of w.dependsOn || []) if (map[d].status !== "done") errors.push(`${w.id}: done but dependency ${d} is ${map[d].status}`);
  }
  errors.push(...detectCycles(reg).map((c) => `dependency cycle: ${c}`));
  if (errors.length) {
    console.error(`roadmap:check FAILED (${errors.length}):`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`roadmap:check OK — ${reg.workOrders.length} WOs consistent across registry + ${LANES.length} lane files`);
}

function generateStatus() {
  const reg = loadRegistry();
  const map = byId(reg);
  const today = new Date().toISOString().slice(0, 10);
  const counts = (lane) => {
    const ws = reg.workOrders.filter((w) => w.lane === lane);
    const c = { done: 0, "in-progress": 0, todo: 0 };
    for (const w of ws) c[w.status]++;
    return { total: ws.length, ...c };
  };
  const overallDone = reg.workOrders.filter((w) => w.status === "done").length;
  const pct = Math.round((overallDone / reg.workOrders.length) * 100);
  const lines = [];
  lines.push("# Roadmap Status");
  lines.push("");
  lines.push(`> GENERATED by \`pnpm roadmap:status\` on ${today} — do not edit by hand. State lives in \`registry.json\`; specs live in the lane files. Handoff protocol: [README.md](./README.md).`);
  lines.push("");
  lines.push(`## Burn-down — ${overallDone}/${reg.workOrders.length} done (${pct}%)`);
  lines.push("");
  lines.push("| Lane | Done | In progress | Todo | Total |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const lane of LANES) {
    const c = counts(lane);
    lines.push(`| [${lane}](./${lane}.md) | ${c.done} | ${c["in-progress"]} | ${c.todo} | ${c.total} |`);
  }
  lines.push("");
  const inProg = reg.workOrders.filter((w) => w.status === "in-progress");
  lines.push("## In progress");
  lines.push("");
  if (!inProg.length) lines.push("(none)");
  else {
    lines.push("| WO | Title | Claimed by | Since | Last progress |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const w of inProg) {
      const log = w.progressLog || [];
      const last = log.length
        ? `${log[log.length - 1].at} — ${log[log.length - 1].note}`.replace(/\|/g, "/")
        : "(no entries — log via `progress`)";
      lines.push(`| ${w.id} | ${w.title} | ${w.claimedBy || "?"} | ${w.claimedAt || "?"} | ${last} |`);
    }
  }
  lines.push("");
  const nextUp = actionable(reg, map);
  lines.push("## Next up (todo, dependencies satisfied)");
  lines.push("");
  lines.push("| WO | Title | Size | Lane | Programs |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const w of nextUp) lines.push(`| ${w.id} | ${w.title} | ${w.size} | ${w.lane} | ${(w.programs || []).join(", ")} |`);
  lines.push("");
  const blocked = reg.workOrders.filter((w) => w.status === "todo" && openDeps(w, map).length > 0);
  lines.push("## Blocked (waiting on dependencies)");
  lines.push("");
  lines.push("| WO | Waiting on |");
  lines.push("| --- | --- |");
  for (const w of blocked) lines.push(`| ${w.id} | ${openDeps(w, map).join(", ")} |`);
  lines.push("");
  lines.push("## Sequencing hazards (mechanically enforced)");
  lines.push("");
  const pairs = new Set();
  for (const w of reg.workOrders) for (const p of w.mustLandWith || []) pairs.add([w.id, p].sort().join(" + "));
  for (const p of pairs) lines.push(`- ${p} must land in the same certified window (\`done\` on either requires the other >= in-progress).`);
  if (!pairs.size) lines.push("(none)");
  lines.push("");
  lines.push("## North-star metrics");
  lines.push("");
  lines.push("| Metric | Baseline | Target | How to re-measure | As of |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const m of reg.metrics || []) lines.push(`| ${m.name} | ${m.baseline} | ${m.target} | ${m.measure} | ${m.asOf} |`);
  lines.push("");
  const doneList = reg.workOrders.filter((w) => w.status === "done");
  lines.push("## Done ledger");
  lines.push("");
  if (!doneList.length) lines.push("(none yet)");
  else {
    lines.push("| WO | Done | Evidence |");
    lines.push("| --- | --- | --- |");
    for (const w of doneList) lines.push(`| ${w.id} | ${w.doneAt} | ${w.evidence} |`);
  }
  lines.push("");
  fs.writeFileSync(STATUS_PATH, lines.join("\n"));
  console.log(`STATUS.md regenerated — ${overallDone}/${reg.workOrders.length} done, ${inProg.length} in progress, ${nextUp.length} actionable`);
}

function requireWo(reg, id) {
  const w = byId(reg)[id];
  if (!w) { console.error(`Unknown WO id: ${id}`); process.exit(1); }
  return w;
}
const flag = (args, name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const [cmd, arg, ...rest] = process.argv.slice(2);
const args = [arg, ...rest].filter(Boolean);

switch (cmd) {
  case "status": generateStatus(); break;
  case "check": check(); break;
  case "next": {
    const reg = loadRegistry();
    for (const w of actionable(reg, byId(reg))) console.log(`${w.id} [${w.size}] (${w.lane}) ${w.title}`);
    break;
  }
  case "show": case "delegate": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const block = woBlock(w.lane, w.id);
    if (!block) { console.error(`Spec block for ${w.id} not found in ${w.lane}.md`); process.exit(1); }
    const map = byId(reg);
    const open = openDeps(w, map);
    if (cmd === "show") console.log(block);
    else {
      const dm = block.match(/\*\*Delegation prompt\*\*\s*[—-]\s*([\s\S]*?)(?=\n- \*\*|\n### |\n---|$)/);
      console.log(dm ? dm[1].trim() : block);
      console.log("\n--- Universal fences (roadmap/README.md): work on main; commit only when full cert is green; never git-restore directories; no emojis/AI attribution; update the matching docs-engineering product/ chapter CURRENT lines before `done`.");
    }
    console.log(`\n[state] status=${w.status}${w.claimedBy ? ` claimedBy=${w.claimedBy}` : ""}${open.length ? ` OPEN-DEPS=${open.join(",")}` : " deps-satisfied"}${(w.mustLandWith || []).length ? ` mustLandWith=${w.mustLandWith.join(",")}` : ""}`);
    for (const p of w.progressLog || []) console.log(`[progress] ${p.at} ${p.by}: ${p.note}`);
    if (w.status === "in-progress" && (w.progressLog || []).length) console.log("[handoff] resume from the last progress entry — do not redo completed steps");
    if (open.length) console.log(`[warn] not actionable yet — complete ${open.join(", ")} first`);
    break;
  }
  case "claim": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const open = openDeps(w, byId(reg));
    if (w.status === "done") { console.error(`${w.id} is done; use reopen first`); process.exit(1); }
    if (open.length) { console.error(`REFUSED: ${w.id} has open dependencies: ${open.join(", ")}`); process.exit(1); }
    w.status = "in-progress";
    w.claimedBy = flag(args, "--by") || process.env.USER || "agent";
    w.claimedAt = new Date().toISOString().slice(0, 10);
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} claimed by ${w.claimedBy}. Spec: pnpm roadmap show ${w.id}`);
    break;
  }
  case "progress": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const note = flag(args, "--note");
    if (w.status !== "in-progress") { console.error(`REFUSED: ${w.id} is ${w.status} — progress entries are only for in-progress WOs (claim first)`); process.exit(1); }
    if (!note) { console.error(`REFUSED: --note "<what landed / what is next / blockers>" is mandatory`); process.exit(1); }
    w.progressLog = w.progressLog || [];
    w.progressLog.push({ at: new Date().toISOString().slice(0, 16).replace("T", " "), by: flag(args, "--by") || w.claimedBy || process.env.USER || "agent", note });
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} progress logged (entry ${w.progressLog.length}). Successors resume via: node scripts/roadmap-status.mjs show ${w.id}`);
    break;
  }
  case "done": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const map = byId(reg);
    const evidence = flag(args, "--evidence");
    if (!evidence) { console.error("REFUSED: --evidence \"<how the acceptance gate was proven>\" is mandatory"); process.exit(1); }
    const openHard = (w.dependsOn || []).filter((d) => map[d].status !== "done" && !((w.mustLandWith || []).includes(d) && map[d].status === "in-progress"));
    if (openHard.length) { console.error(`REFUSED: dependencies not done: ${openHard.join(", ")}`); process.exit(1); }
    const partnersNotReady = (w.mustLandWith || []).filter((p) => !["in-progress", "done"].includes(map[p].status));
    if (partnersNotReady.length) { console.error(`REFUSED (sequencing hazard): ${partnersNotReady.join(", ")} must be at least in-progress in the same certified window`); process.exit(1); }
    w.status = "done";
    w.doneAt = new Date().toISOString().slice(0, 10);
    w.evidence = evidence;
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} DONE.`);
    console.log("Reminders: (1) update the matching docs-engineering product/ chapter CURRENT lines; (2) pnpm docs:anchors && pnpm roadmap:check; (3) full cert before push.");
    break;
  }
  case "reopen": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    w.status = "todo"; w.claimedBy = null; w.claimedAt = null; w.doneAt = null; w.evidence = null;
    w.notes = flag(args, "--note") || w.notes;
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} reopened.`);
    break;
  }
  default:
    console.log("Usage: roadmap-status.mjs <status|check|next|show WO-ID|delegate WO-ID|claim WO-ID [--by name]|progress WO-ID --note \"...\" [--by name]|done WO-ID --evidence \"...\"|reopen WO-ID [--note ...]>");
    process.exit(cmd ? 1 : 0);
}
