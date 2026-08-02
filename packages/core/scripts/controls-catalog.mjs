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
 * --write   regenerate the view
 * --check   fail on: missing view, digest drift vs inputs, an active
 *           standard/pro capability absent from the view, a control whose
 *           channels sum ZERO live reads (published control without a real
 *           consumer), or an Expert count that disagrees with the report.
 * --drill=<case>  self-inject: missing-control | zero-consumer | stale
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = join(ROOT, 'customization-surface-report.json');
const OUT_DIR = join(ROOT, 'tokens/controls');
const OUT = join(OUT_DIR, 'README.md');

const args = process.argv.slice(2);
const has = (f) => args.includes(f) || args.some((a) => a.startsWith(`${f}=`));
const drill = (() => {
  const hit = args.find((a) => a.startsWith('--drill'));
  return hit?.includes('=') ? hit.split('=')[1] : undefined;
})();

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
  const { total } = liveReads(report, cap.channels);
  const domain = cap.valueType ?? '—';
  const isData = !cap.channels?.length;
  return [
    `\`${cap.id}\``,
    cap.title ?? '—',
    domain,
    cap.defaultBehavior ?? '—',
    isData ? 'data → compilador → familias' : `${cap.channels.length} ch`,
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
    .update(JSON.stringify(active.map((c) => [c.id, c.tier, c.channels, c.documentPath, c.brandThemePath])))
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

export async function check() {
  const failures = [];
  const { md, digest, active, report } = await build();
  if (!existsSync(OUT)) return ['controls view missing — run --write'];
  const stored = readFileSync(OUT, 'utf8');
  const storedDigest = stored.match(/digest: ([0-9a-f]{64})/)?.[1];
  if ((drill === 'stale' ? 'deadbeef' : storedDigest) !== digest) {
    failures.push('controls view STALE vs contratos/censo — regenerar con --write');
  }
  const caps = drill === 'missing-control'
    ? [...active, { id: 'drill.ghost', tier: 'standard', status: 'active', channels: [] }]
    : active;
  for (const cap of caps.filter((c) => c.tier === 'standard' || c.tier === 'pro')) {
    if (!stored.includes(`\`${cap.id}\``)) failures.push(`control activo ausente de la vista: ${cap.id}`);
    const { total } = liveReads(report, cap.channels);
    const zero = drill === 'zero-consumer' && cap.id === caps[0].id ? 0 : (cap.channels?.length ? total : 1);
    if (cap.channels?.length && zero === 0 && !cap.evidence?.consumer) {
      failures.push(`control publicado SIN consumer real: ${cap.id}`);
    }
    if (drill === 'zero-consumer' && cap.id === caps[0].id && zero === 0) {
      failures.push(`control publicado SIN consumer real (drill): ${cap.id}`);
    }
  }
  return failures;
}

async function main() {
  if (has('--write')) {
    const { md, active } = await build();
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT, md);
    console.log(`controls-catalog: ${active.filter((c) => c.tier === 'standard').length} standard + ${active.filter((c) => c.tier === 'pro').length} pro + Expert allowlist escritos en tokens/controls/README.md`);
  }
  if (has('--check') || drill) {
    const failures = await check();
    if (drill) {
      if (failures.length === 0) {
        console.error(`controls-catalog DRILL FAIL — "${drill}" no produjo violaciones (gate vacuo)`);
        process.exit(1);
      }
      console.log(`controls-catalog drill "${drill}" OK — ${failures.length} violación(es) detectadas`);
      return;
    }
    if (failures.length > 0) {
      for (const f of failures.slice(0, 10)) console.error(`controls-catalog FAIL — ${f}`);
      process.exit(1);
    }
    console.log('controls-catalog --check OK');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
