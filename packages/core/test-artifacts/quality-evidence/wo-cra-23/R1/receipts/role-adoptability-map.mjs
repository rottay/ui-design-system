/**
 * R1 Cohort 1 — surface-role ADOPTABILITY map.
 *
 * WHY THIS EXISTS. Adopting the governed `--ds-material-{role}-*` vocabulary
 * looked like a mechanical refactor until it was measured. It is not, and the
 * reason is a CSS fact rather than a design opinion:
 *
 *   `foundation/themes/default.css` declares many role channels on `:root`.
 *   A channel declared there is ALWAYS defined, so
 *       var(--ds-material-control-shadow, <family value>)
 *   never reaches its fallback — it resolves to the role default and silently
 *   REPLACES the family value. `--ds-material-control-shadow` defaults to
 *   `none` while `--ds-button-primary-shadow` carries a real `0 1px 2px` in
 *   several themes, so that one line would flatten every button in every theme
 *   while reading, in review, like a no-op refactor.
 *
 * A channel that is tenant-writable but NOT declared on `:root` behaves the
 * opposite way: the fallback fires, today's paint is preserved exactly, and the
 * channel becomes causal the moment a tenant authors it. Those are safe.
 *
 * This map separates the two so the cohort can land every safe adoption
 * immediately and send only the genuinely visual decisions to sighted
 * adjudication, instead of mixing them in one indistinguishable diff.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');

const { TENANT_THEME_OVERRIDE_TOKENS } = require(path.join(CORE, 'dist/index.cjs'));

const ROLES = ['canvas', 'shell', 'panel', 'card', 'inset', 'control', 'raised', 'overlay'];
const CHANNELS = [
  'background', 'background-hover', 'background-active', 'background-selected', 'background-disabled',
  'foreground', 'foreground-muted', 'foreground-disabled',
  'border', 'border-strong', 'border-hover', 'border-active', 'border-selected', 'border-disabled',
  'focus-ring',
  'shadow', 'shadow-hover', 'shadow-active', 'shadow-selected',
  'highlight', 'texture',
];

/** Which Cohort 1 group maps to which role(s), and why. */
const GROUP_ROLES = Object.freeze({
  control: { roles: ['control'], members: ['button', 'segmented'], why: 'a button and a segmented control are controls' },
  field: {
    roles: ['control', 'inset'],
    members: ['input', 'select', 'form-field'],
    why: 'a field is a control whose WELL is an inset surface; the chrome takes control, the well takes inset',
  },
  overlay: {
    roles: ['overlay', 'raised'],
    members: ['overlay-modal', 'drawer', 'popover', 'dropdown'],
    why: 'popover already proves this pair; modal, drawer and dropdown are the same ground',
  },
  feedback: {
    roles: ['panel', 'card'],
    members: ['alert', 'skeleton', 'spinner'],
    why: 'lifecycle feedback sits on panel and card grounds, not on its own surface',
  },
});

export function buildMap() {
  const defaultCss = readFileSync(
    path.join(CORE, 'src/foundation/tokens/css/foundation/themes/default.css'),
    'utf8',
  );
  const rootDeclared = new Set(defaultCss.match(/--ds-material-[a-z-]+(?=\s*:)/g) ?? []);
  const writable = new Set(
    (TENANT_THEME_OVERRIDE_TOKENS ?? []).filter((t) => t.startsWith('--ds-material-')),
  );

  const roles = Object.fromEntries(
    ROLES.map((role) => {
      const safe = [];
      const sighted = [];
      const unreachable = [];
      for (const channel of CHANNELS) {
        const token = `--ds-material-${role}-${channel}`;
        if (!writable.has(token)) unreachable.push(channel);
        else if (rootDeclared.has(token)) sighted.push(channel);
        else safe.push(channel);
      }
      return [role, { safeToAdoptNow: safe, needsSightedAdjudication: sighted, notTenantWritable: unreachable }];
    }),
  );

  const groups = Object.fromEntries(
    Object.entries(GROUP_ROLES).map(([group, spec]) => {
      const safe = new Set();
      const sighted = new Set();
      for (const role of spec.roles) {
        for (const c of roles[role].safeToAdoptNow) safe.add(`${role}.${c}`);
        for (const c of roles[role].needsSightedAdjudication) sighted.add(`${role}.${c}`);
      }
      return [
        group,
        {
          members: spec.members,
          roles: spec.roles,
          why: spec.why,
          safeToAdoptNow: [...safe],
          needsSightedAdjudication: [...sighted],
        },
      ];
    }),
  );

  return {
    schemaVersion: 1,
    mapId: 'wo-cra-23-R1-C1-role-adoptability',
    law: 'A tenant-writable role channel that is NOT declared on :root can be adopted with a var() fallback that preserves current paint exactly and becomes causal on first tenant write. A channel DECLARED on :root cannot: its default silently replaces the family value, so adopting it is a visual decision for the sighted approver.',
    rootDeclaredCount: rootDeclared.size,
    tenantWritableCount: writable.size,
    roles,
    groups,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const map = buildMap();
  writeFileSync(
    path.join(HERE, '..', 'receipts', 'cohort-1-role-adoptability.json'),
    `${JSON.stringify(map, null, 2)}\n`,
  );
  for (const [group, g] of Object.entries(map.groups)) {
    process.stdout.write(
      `${group.padEnd(9)} safe-now ${String(g.safeToAdoptNow.length).padStart(2)}  sighted ${String(g.needsSightedAdjudication.length).padStart(2)}  (${g.roles.join('+')})\n`,
    );
  }
}
