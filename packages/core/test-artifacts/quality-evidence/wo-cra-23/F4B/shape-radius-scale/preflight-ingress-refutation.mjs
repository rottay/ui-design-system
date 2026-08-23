/**
 * F4B control 3/20 `shape.radius-scale` — PREFLIGHT REFUTATION (read-only).
 *
 * Answers one question the packet's canary depends on: does the ingress path
 * the contract declares for the STATIC door actually carry this control?
 *
 * It writes nothing to the repo and mutates no manifest. Every number below is
 * produced by the real compiled compilers loaded through the harness's own
 * `loadCompilerArms()`, after `assertDistFresh` passes.
 *
 * Run: node test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/preflight-ingress-refutation.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const { loadCompilerArms, lowerStop } = await import(
  resolve(CORE, 'src/tooling/resolution-probe/runtime/ingress/index.mjs')
);
const M = JSON.parse(readFileSync(resolve(CORE, 'manifest/controls/shape.radius-scale.json'), 'utf-8'));
const arms = await loadCompilerArms();
const STOPS = ['recto', 'sutil', 'suave', 'amplio'];
const VERTICALS = ['rottay', 'bithire', 'evnto'];
const out = { generatedFrom: 'compiled dist/, dist-freshness-gate ok', sections: {} };

function lower(manifest, armId, stopId, vertical) {
  try {
    const r = lowerStop({ armId, controlManifest: manifest, stopId,
      compile: arms[armId].compile, provenance: arms[armId].provenance, vertical });
    return { ok: true, variables: r.variables };
  } catch (e) { return { ok: false, error: e.message.split('\n')[0] }; }
}

// A: the path the contract declares today.
const A = {};
for (const v of VERTICALS) for (const s of STOPS) A[`${v}/${s}`] = lower(M, 'static-brand-theme', s, v);
out.sections.A_static_as_declared = { path: M.ingress.staticBrandThemePath, results: A };

// B: the single slot the packet was authorized to use.
const Mlg = structuredClone(M); Mlg.ingress.staticBrandThemePath = 'surfaces.borderRadius.lg';
const B = {};
for (const v of VERTICALS) for (const s of STOPS) B[`${v}/${s}`] = lower(Mlg, 'static-brand-theme', s, v);
out.sections.B_static_authorized_slot = { path: 'surfaces.borderRadius.lg', results: B };

// C: the field BrandSurfaces documents as "Bounded multiplier for the canonical radius ramp".
const Mrs = structuredClone(M); Mrs.ingress.staticBrandThemePath = 'surfaces.radiusScale';
const C = {};
for (const v of VERTICALS) for (const s of STOPS) C[`${v}/${s}`] = lower(Mrs, 'static-brand-theme', s, v);
out.sections.C_static_real_dial = { path: 'surfaces.radiusScale', results: C };

// D: the DB door, unchanged.
const D = {};
for (const v of VERTICALS) for (const s of STOPS) D[`${v}/${s}`] = lower(M, 'db-tenant-theme', s, v);
out.sections.D_db_as_declared = { path: M.ingress.dbTenantThemePath, results: D };

// E: raw compiler — is the dial cancelled when both fields are authored?
const bt = await import(resolve(CORE, 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js'));
const raw = (surfaces) => {
  const c = bt.compileBrandTheme({ brandTheme: { surfaces }, tenantSlug: 'rottay' });
  const v = c.cssVariables ?? c.variables ?? {};
  return { '--ds-radius-scale': v['--ds-radius-scale'] ?? null,
           '--ds-radius-lg-base': v['--ds-radius-lg-base'] ?? null,
           '--ds-radius-md': v['--ds-radius-md'] ?? null };
};
out.sections.E_raw_compiler = {
  'borderRadius.lg="12px"': raw({ borderRadius: { lg: '12px' } }),
  'radiusScale=0.9': raw({ radiusScale: 0.9 }),
  'both: borderRadius.lg="12px" + radiusScale=0.9': raw({ borderRadius: { lg: '12px' }, radiusScale: 0.9 }),
  'borderRadius.lg=0.9 (numeric, what a bounded stop writes)': raw({ borderRadius: { lg: 0.9 } }),
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
