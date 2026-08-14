#!/usr/bin/env node
/**
 * controls-catalog — the Standard/Pro/Expert control table as PRODUCT API,
 * generated from the real contracts (FASE 4 of the integral-normalization
 * directive, 2026-08-02). Reproducible from code; never hand-maintained.
 *
 * Joins, per active control:
 *   TENANT_CAPABILITY_REGISTRY (tier, valueType, defaultBehavior,
 *   documentPath = DB path, brandThemePath = static path, channels,
 *   derivation, productive-consumer evidence)
 *   × customization-surface-report.json (tier lists, Expert allowlist size +
 *   domains, per-channel live read counts)
 * and emits `tokens/controls/README.md` — Standard and Pro tables with the
 * owner-required columns, plus the Expert allowlist summary. Governance and
 * dead inventories stay in their own trees; this page is ONLY the operative
 * product surface.
 *
 * COMMAND GRAMMAR (closed, exactly ONE token — anti-vacuity law, 2026-08-13):
 *   --write                  regenerate the view
 *   --check                  fail on: missing view, digest drift vs inputs, an
 *                            active standard/pro capability absent from the
 *                            view, or a control whose channels sum ZERO live
 *                            reads with no proven consumer
 *   --drill=stale            self-inject each violation and prove THAT drill
 *   --drill=missing-control  produced ITS OWN cause. A drill that only
 *   --drill=zero-consumer    inherits a pre-existing baseline failure FAILS.
 *
 * Exit codes: 0 = ok / causal drill · 1 = gate red or vacuous drill ·
 *             2 = invalid usage (rejected BEFORE any build/check/dist load).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = join(ROOT, 'customization-surface-report.json');
const OUT_DIR = join(ROOT, 'tokens/controls');
const OUT = join(OUT_DIR, 'README.md');

/* ------------------------------------------------------------------ *
 * Drill grammar — closed set, each case carries its OWN expected cause.
 * A drill verdict NEVER counts a failure it did not itself inject.
 * ------------------------------------------------------------------ */

const DRILL_STALE_CANDIDATE = 'deadbeef';
const DRILL_GHOST_ID = 'drill.ghost';
const DRILL_ZERO_ID = 'drill.zero-consumer';
const DRILL_ZERO_CHANNEL = '--ds-drill-channel-sin-lecturas';

/**
 * `expectedCause` is the LITERAL discriminating substring the injected failure
 * must carry, and `matches` is derived from it — the matcher and the advertised
 * cause cannot drift apart, so a drill can never be credited by prose that no
 * failure actually contains.
 */
const defineDrill = ({ injects, expectedCause }) => Object.freeze({
  injects,
  expectedCause,
  matches: (failure) => failure.includes(expectedCause),
});

export const DRILL_CASES = Object.freeze({
  stale: defineDrill({
    injects: `digest almacenado sustituido por el candidato "${DRILL_STALE_CANDIDATE}"`,
    // A real stale tree reports a 64-hex observed digest, never the candidate.
    expectedCause: `observed=${DRILL_STALE_CANDIDATE}`,
  }),
  'missing-control': defineDrill({
    injects: `capability activa sintética "${DRILL_GHOST_ID}" que la vista no contiene`,
    expectedCause: `ausente de la vista: ${DRILL_GHOST_ID}`,
  }),
  'zero-consumer': defineDrill({
    injects: `control publicado sintético "${DRILL_ZERO_ID}" con canal sin lecturas ni consumer`,
    expectedCause: `SIN consumer real (drill): ${DRILL_ZERO_ID}`,
  }),
});

export const DRILL_NAMES = Object.freeze(Object.keys(DRILL_CASES));

export const USAGE = `controls-catalog USAGE — exactamente UN comando: --check | --write | ${DRILL_NAMES.map((n) => `--drill=${n}`).join(' | ')}`;

/**
 * Pure argv parser. The grammar is CLOSED and accepts exactly one token, so an
 * unknown drill, a bare `--drill`, a `--check=x`, a stray positional, or an
 * empty argv is rejected here — before any build, dist load or filesystem read
 * can produce a failure the caller might mistake for a real signal.
 *
 * @param {readonly string[]} argv
 * @returns {{ok: true, command: 'check'|'write'|'drill', drill?: string} | {ok: false, error: string}}
 */
export function parseCommand(argv) {
  if (!Array.isArray(argv)) {
    return { ok: false, error: 'argv debe ser un array de tokens' };
  }
  if (argv.length === 0) {
    return { ok: false, error: 'sin comando: se requiere exactamente UN token' };
  }
  if (argv.length > 1) {
    return { ok: false, error: `${argv.length} tokens recibidos: la gramática admite exactamente UNO` };
  }
  const [token] = argv;
  if (typeof token !== 'string') {
    return { ok: false, error: 'el token debe ser un string' };
  }
  if (token === '--check') return { ok: true, command: 'check' };
  if (token === '--write') return { ok: true, command: 'write' };
  if (token === '--drill') {
    return { ok: false, error: '`--drill` desnudo: se requiere `--drill=<case>`' };
  }
  if (token.startsWith('--drill=')) {
    const drill = token.slice('--drill='.length);
    if (drill === '') {
      return { ok: false, error: '`--drill=` vacío: se requiere un caso de la gramática' };
    }
    if (!Object.hasOwn(DRILL_CASES, drill)) {
      return { ok: false, error: `drill desconocido "${drill}": la gramática es cerrada (${DRILL_NAMES.join(', ')})` };
    }
    return { ok: true, command: 'drill', drill };
  }
  return { ok: false, error: `token no reconocido "${token}"` };
}

async function loadRegistry() {
  const mod = await import(pathToFileURL(join(ROOT, 'dist/index.js')).href);
  if (!mod.TENANT_CAPABILITY_REGISTRY) {
    throw new Error('TENANT_CAPABILITY_REGISTRY missing from dist — rebuild before generating (stale-dist law)');
  }
  return mod.TENANT_CAPABILITY_REGISTRY;
}

function liveReads(report, channels) {
  let total = 0;
  const perChannel = [];
  for (const name of channels ?? []) {
    const row = report.rows[name];
    const n = row ? (row.reads?.css ?? 0) + (row.reads?.ts ?? 0) : 0;
    perChannel.push(`${name}:${n}`);
    total += n;
  }
  return { total, perChannel };
}

function controlRow(cap, report) {
  const { total } = liveReads(report, cap.derivedChannels);
  const domain = cap.valueType ?? '—';
  const isData = !cap.derivedChannels?.length;
  return [
    `\`${cap.id}\``,
    cap.title ?? '—',
    domain,
    cap.defaultBehavior ?? '—',
    isData ? 'data → compilador → familias' : `${cap.derivedChannels.length} ch`,
    cap.brandThemePath ? `\`${cap.brandThemePath}\`` : '—',
    cap.documentPath ? `\`${cap.documentPath}\`` : '—',
    isData ? 'vía compilador (evidence →)' : String(total),
    cap.evidence?.consumer ? `\`${cap.evidence.consumer.split('/').pop()}\`` : '—',
  ].join(' | ');
}

export async function build() {
  const reportRaw = readFileSync(REPORT);
  const report = JSON.parse(reportRaw.toString());
  const registry = await loadRegistry();
  const active = registry.filter((c) => c.status === 'active');
  const byTier = (t) => active.filter((c) => c.tier === t);

  const header = '| id | control | dominio/tipo | default | canal | static path (BrandTheme) | DB path (TenantThemeDocument) | lecturas vivas | consumer probado |';
  const sep = '|---|---|---|---|---|---|---|---|---|';
  const table = (caps) => [header, sep, ...caps.map((c) => `| ${controlRow(c, report)} |`)].join('\n');

  const expert = report.controls;
  const domains = Object.entries(expert.tenantRawDomains ?? {}).map(([d, n]) => `${d} ${Array.isArray(n) ? n.length : n}`).join(' · ');

  const digest = createHash('sha256')
    .update(reportRaw)
    .update(JSON.stringify(active.map((c) => [c.id, c.tier, c.derivedChannels, c.documentPath, c.brandThemePath])))
    .digest('hex');

  const md = `# Controles de customización — API de producto (generado)

> Generado por \`scripts/controls-catalog.mjs --write\`. NO editar a mano.
> Solo superficie OPERATIVA: governance/dead/frontier viven en sus propios árboles.
> Regla de tiers: pocos inputs que derivan decisiones coherentes ("familia + intensidad");
> Expert es una allowlist CERRADA, no acceso a los --ds-* internos.
> A11y: los envelopes expresivos respetan EXPRESSIVE_A11Y_FLOORS (los floors ganan a todo perfil).
> Rollback: cada control es un INPUT — quitar la autoría restaura el baseline del vertical
> (probado por los legs restore-equals-default del harness no-loss).

digest: ${digest}

## STANDARD — ${byTier('standard').length} controles (pocos diales, gran superficie)

${table(byTier('standard'))}

## PRO — ${byTier('pro').length} controles (familias y perfiles)

${table(byTier('pro'))}

## EXPERT — allowlist cerrada

- **${expert.tenantRawAllowlist} tokens** raw-override permitidos (fuente: ${expert.tenantRawAllowlistSource}).
- Dominios: ${domains}.
- Overlap con writers vivos: ${expert.rawOverlapWithWriters}.
- Contrato: \`TENANT_THEME_OVERRIDE_TOKENS\` (bounded); todo lo fuera de la lista es rechazado.

## INTERNAL (no producto) — ${byTier('internal').length}

${byTier('internal').map((c) => `- \`${c.id}\` — ${c.title ?? ''} (${c.defaultBehavior ?? ''})`).join('\n')}
`;
  return { md, digest, active, report };
}

/**
 * Run the gate. `drill` is an explicit ARGUMENT, never ambient argv state, so
 * the same function can be exercised in-process without a global.
 *
 * Every injected violation is tagged so the caller can tell an injected cause
 * apart from a pre-existing baseline failure. In particular the stale drill
 * emits its OWN finding carrying `observed=deadbeef` alongside (not instead of)
 * whatever the real stored digest reports — a genuinely stale tree can never
 * satisfy the drill's expected cause.
 *
 * @param {{drill?: string}} [options]
 * @returns {Promise<string[]>} failures, injected and baseline alike
 */
export async function check({ drill } = {}) {
  if (drill !== undefined && !Object.hasOwn(DRILL_CASES, drill)) {
    throw new Error(`check(): drill desconocido "${drill}" — la gramática es cerrada (${DRILL_NAMES.join(', ')})`);
  }
  const failures = [];
  const { digest, active, report } = await build();
  if (!existsSync(OUT)) return ['controls view missing — run --write'];
  const stored = readFileSync(OUT, 'utf8');
  const storedDigest = stored.match(/digest: ([0-9a-f]{64})/)?.[1];

  if (storedDigest !== digest) {
    failures.push(`controls view STALE vs contratos/censo — regenerar con --write (observed=${storedDigest ?? 'ausente'}, expected=${digest})`);
  }
  if (drill === 'stale' && DRILL_STALE_CANDIDATE !== digest) {
    failures.push(`controls view STALE vs contratos/censo (drill) — candidato inyectado (observed=${DRILL_STALE_CANDIDATE}, expected=${digest})`);
  }

  const caps = [...active];
  if (drill === 'missing-control') {
    caps.push({
      id: DRILL_GHOST_ID,
      title: 'drill: control activo nunca publicado en la vista',
      tier: 'standard',
      status: 'active',
      derivedChannels: [],
    });
  }
  if (drill === 'zero-consumer') {
    caps.push({
      id: DRILL_ZERO_ID,
      title: 'drill: control publicado sin lecturas vivas ni consumer',
      tier: 'pro',
      status: 'active',
      derivedChannels: [DRILL_ZERO_CHANNEL],
      drillInjected: true,
      skipPresenceCheck: true,
    });
  }

  for (const cap of caps.filter((c) => c.tier === 'standard' || c.tier === 'pro')) {
    if (!cap.skipPresenceCheck && !stored.includes(`\`${cap.id}\``)) {
      failures.push(`control activo ausente de la vista: ${cap.id}`);
    }
    const channels = cap.derivedChannels ?? [];
    if (channels.length === 0) continue;
    const { total } = liveReads(report, channels);
    if (total > 0 || cap.evidence?.consumer) continue;
    failures.push(cap.drillInjected
      ? `control publicado SIN consumer real (drill): ${cap.id}`
      : `control publicado SIN consumer real: ${cap.id}`);
  }
  return failures;
}

async function runWrite() {
  const { md, active } = await build();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, md);
  console.log(`controls-catalog: ${active.filter((c) => c.tier === 'standard').length} standard + ${active.filter((c) => c.tier === 'pro').length} pro + Expert allowlist escritos en tokens/controls/README.md`);
  return 0;
}

async function runCheck() {
  const failures = await check();
  if (failures.length > 0) {
    for (const f of failures.slice(0, 10)) console.error(`controls-catalog FAIL — ${f}`);
    if (failures.length > 10) console.error(`controls-catalog FAIL — … y ${failures.length - 10} más`);
    return 1;
  }
  console.log('controls-catalog --check OK');
  return 0;
}

async function runDrill(name) {
  const def = DRILL_CASES[name];
  const failures = await check({ drill: name });
  const causal = failures.filter((f) => def.matches(f));
  const baseline = failures.filter((f) => !def.matches(f));

  if (causal.length === 0) {
    console.error(`controls-catalog DRILL FAIL — ${name} no produjo SU violación`);
    console.error(`  inyectado: ${def.injects}`);
    console.error(`  causa esperada: ${def.expectedCause}`);
    for (const f of baseline.slice(0, 10)) {
      console.error(`  falla basal (NO acredita el drill): ${f}`);
    }
    if (baseline.length === 0) console.error('  (sin fallas basales: el gate quedó completamente mudo)');
    return 1;
  }

  console.log(`controls-catalog drill "${name}" OK — ${causal.length} violación(es) causal(es) propias`);
  for (const f of causal) console.log(`  causa propia: ${f}`);
  if (baseline.length > 0) {
    console.log(`  (${baseline.length} falla(s) basal(es) preexistente(s), excluidas del veredicto del drill)`);
  }
  return 0;
}

export async function main(argv = process.argv.slice(2)) {
  const parsed = parseCommand(argv);
  if (!parsed.ok) {
    console.error(USAGE);
    console.error(`  recibido: ${JSON.stringify(argv)}`);
    console.error(`  motivo: ${parsed.error}`);
    process.exitCode = 2;
    return 2;
  }

  let code;
  switch (parsed.command) {
    case 'write':
      code = await runWrite();
      break;
    case 'check':
      code = await runCheck();
      break;
    case 'drill':
      code = await runDrill(parsed.drill);
      break;
    default:
      throw new Error(`comando no implementado: ${parsed.command}`);
  }
  process.exitCode = code;
  return code;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
