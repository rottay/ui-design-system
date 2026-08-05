/**
 * Binary proof for `server-first-paint-matches-tenant-no-default-theme-flash`.
 *
 * R0 permits no browser captures, so this asserts over the RAW HTML STRING the
 * production server writes. That is the right instrument for this contract:
 * the hard veto is "an incorrect default theme is visible BEFORE tenant
 * hydration", and what makes it visible is bytes arriving without the tenant's
 * ground. A settled screenshot cannot see that frame; the byte stream can.
 *
 * Two layers, so the cheap one does not need a build:
 *
 *   --unit    resolver only. Loads the real server resolver directly (Node
 *             type-stripping, same file the bundler compiles) and asserts the
 *             plan it produces for both tenant paths.
 *   default   unit, then boots `next start` against the production build and
 *             asserts the served document for both URLs.
 *
 * Usage:
 *   pnpm --filter @rottay/showroom test:first-paint
 *   pnpm --filter @rottay/showroom test:first-paint -- --unit
 */

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '..');
const PORT = Number(process.env.FIRST_PAINT_PORT ?? 7311);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const UNIT_ONLY = process.argv.includes('--unit');

const BITHIRE_URL = '/probe/whitelabel-torture?fixture=bithire&engine=modern';
const MANAGEMENT_URL =
  '/probe/whitelabel-torture?fixture=themanagementmiami&engine=modern&tenantSource=canonical-db';
const SCENE_URL =
  '/probe/whitelabel-torture/scenes/primitives?fixture=themanagementmiami&engine=modern&tenantSource=canonical-db&slug=button';

/** The heading proves the gallery itself reached the server render. */
const HEADING = 'Whitelabel torture';
/** What an empty served body looks like when a client hook bails out of SSR. */
const BAILOUT_SIGNATURE = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';
const GROUND_HANDLE = 'data-testid="probe-ground"';
const STAMP_HANDLE = 'data-testid="probe-first-paint-stamp"';

const results = [];

function check(name, assertion) {
  try {
    assertion();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, detail: error.message });
  }
}

// ---------------------------------------------------------------------------
// Layer 1 — the resolver
// ---------------------------------------------------------------------------

const { resolveTortureFirstPaint } = await import(
  path.join(SHOWROOM_ROOT, 'src/components/torture-tenant/index.ts')
);
// The same published subpath the app reads. Node needs the import attribute the
// bundler infers, which is exactly why the resolver takes the specimen as an
// input instead of importing it: the resolver stays loadable here unchanged.
const { default: tenantThemeCanaryFixtures } = await import(
  '@rottay/design-system/tenant-theme-canary-fixtures',
  { with: { type: 'json' } }
);

const specimen = tenantThemeCanaryFixtures.specimens.themanagement;
assert.ok(specimen, 'the published The Management canary specimen is missing');
const plan = (query) => resolveTortureFirstPaint(query, { specimen });

const bithirePlan = plan({ fixture: 'bithire', engine: 'modern' });
const managementPlan = plan({
  fixture: 'themanagementmiami',
  engine: 'modern',
  tenantSource: 'canonical-db',
});
const legacyManagementPlan = plan({ fixture: 'themanagementmiami', engine: 'modern' });

check('resolver: bithire stamps its own light, modern, tenant-scoped root', () => {
  assert.equal(bithirePlan.rootAttributes['data-tenant'], 'bithire');
  assert.equal(bithirePlan.rootAttributes['data-vertical'], 'bithire');
  assert.equal(bithirePlan.rootAttributes['data-ds-root'], '');
  assert.equal(bithirePlan.rootAttributes['data-theme'], 'light');
  assert.equal(bithirePlan.rootAttributes['data-engine'], 'modern');
  assert.equal(bithirePlan.rootAttributes.lang, 'en');
  assert.equal(bithirePlan.rootAttributes.dir, 'ltr');
});

check('resolver: bithire embeds no CSS — its artifact ships in the DS bundle', () => {
  assert.equal(bithirePlan.css, '');
  assert.equal(bithirePlan.artifact, null);
});

check('resolver: the published document compiles to embeddable CSS', () => {
  assert.ok(managementPlan.artifact, 'canonical-db must compile an artifact');
  assert.ok(
    managementPlan.artifact.css.length > 0,
    'a compiled artifact with empty CSS would stamp a scope nothing matches',
  );
  assert.equal(managementPlan.css, managementPlan.artifact.css);
  assert.ok(
    managementPlan.css.includes(managementPlan.artifact.scopes.combinedSelector),
    'the embedded CSS must carry the scope the stamp emits',
  );
});

check('resolver: the compiled tenant stamps the specimen slug, not the fixture name', () => {
  assert.equal(managementPlan.rootAttributes['data-tenant'], 'themanagement');
  assert.equal(managementPlan.rootAttributes['data-vertical'], 'bithire');
  assert.equal(managementPlan.rootAttributes['data-theme'], 'light');
  assert.equal(managementPlan.rootAttributes['data-engine'], 'modern');
});

check('resolver: neither tenant path resolves to a dark stamp', () => {
  assert.notEqual(bithirePlan.rootAttributes['data-theme'], 'dark');
  assert.notEqual(managementPlan.rootAttributes['data-theme'], 'dark');
});

check('resolver: the legacy BrandFixture branch stays unstamped', () => {
  // Its settled render has never carried a tenant scope. Stamping one would
  // newly activate the bithire vertical baseline and move live baselines.
  assert.equal(legacyManagementPlan.rootAttributes, null);
  assert.equal(legacyManagementPlan.css, '');
});

check('resolver: DRILL — an unknown fixture cannot stamp a scope', () => {
  const rogue = plan({ fixture: '../../etc/passwd', engine: 'modern' });
  assert.equal(rogue.fixture, 'torture-dark');
  assert.equal(rogue.rootAttributes, null);
});

check('resolver: DRILL — compiling twice yields one digest', () => {
  assert.equal(
    plan({ fixture: 'themanagementmiami', tenantSource: 'canonical-db' }).artifact.digest,
    managementPlan.artifact.digest,
  );
});

// The other half of "no flash": ground that arrives early must not be repainted
// by a second emitter. The declaration TortureSurface mounts is exactly this.
const { resolveVisualAuthority, TENANT_THEME_V1_COVERAGE } = await import('@rottay/design-system');

const managementPayload = {
  visualBranding: false,
  tokenOverrides: false,
  appearance: managementPlan.artifact.normalizedAppearance,
};

check('authority: the compiled artifact silences every channel it covers', () => {
  const resolution = resolveVisualAuthority({
    declaration: { authority: 'compiled-artifact', artifact: managementPlan.artifact },
    slug: managementPlan.artifact.slug,
    hasBundledArtifact: false,
    payload: managementPayload,
  });
  assert.equal(resolution.authority, 'compiled-artifact');
  assert.equal(resolution.conflict, null);
  assert.deepEqual([...resolution.suppressedChannels].sort(), [...TENANT_THEME_V1_COVERAGE].sort());
});

check('authority: DRILL — without the declaration the provider paints a second layer', () => {
  const resolution = resolveVisualAuthority({
    slug: managementPlan.artifact.slug,
    hasBundledArtifact: false,
    payload: managementPayload,
  });
  assert.equal(resolution.authority, 'provider');
  assert.deepEqual([...resolution.suppressedChannels], []);
});

/** A value only this specimen's compiled artifact can carry. */
const SPECIMEN_GROUND = `--ds-color-bg-primary: ${managementPlan.artifact.variables['--ds-color-bg-primary']}`;

// ---------------------------------------------------------------------------
// Layer 2 — the served document
// ---------------------------------------------------------------------------

function assertServedDocument(label, html, expected) {
  const groundAt = html.indexOf(GROUND_HANDLE);

  check(`${label}: the ground element reached the served body`, () => {
    assert.ok(groundAt !== -1, `${GROUND_HANDLE} is absent from the served HTML`);
  });

  check(`${label}: the gallery rendered on the server`, () => {
    assert.ok(html.includes(HEADING), `heading "${HEADING}" is absent from the served HTML`);
    assert.ok(
      !html.includes(BAILOUT_SIGNATURE),
      'the served body still carries the client-side-rendering bailout',
    );
  });

  const stampAt = html.indexOf(STAMP_HANDLE);
  check(`${label}: the root stamp precedes the ground element`, () => {
    assert.ok(stampAt !== -1, 'no root stamp in the served HTML');
    assert.ok(groundAt !== -1, 'no ground element to precede');
    assert.ok(
      stampAt < groundAt,
      `stamp at ${stampAt} does not precede the ground element at ${groundAt}`,
    );
  });

  const stamp = stampAt === -1 ? '' : html.slice(stampAt, html.indexOf('</script>', stampAt));
  check(`${label}: the stamp carries the settled tenant, theme and engine`, () => {
    // Anchored so the negative below cannot pass by matching nothing.
    assert.ok(stamp.includes('r.setAttribute(k,a[k])'), 'the stamp writes no root attribute');
    assert.ok(stamp.includes('"data-theme"'), 'the stamp declares no theme');
    for (const [attribute, value] of Object.entries(expected.attributes)) {
      assert.ok(stamp.includes(`"${attribute}":"${value}"`), `stamp is missing ${attribute}="${value}"`);
    }
  });

  check(`${label}: NEGATIVE — no dark stamp and no dark class`, () => {
    assert.ok(stamp.includes('"data-theme"'), 'no stamp to falsify');
    assert.ok(
      !stamp.includes('"data-theme":"dark"'),
      'the stamp would paint dark before hydration',
    );
    assert.ok(
      !/class="[^"]*\bdark\b/.test(html.slice(0, groundAt)),
      'a dark class reaches the document before the ground element',
    );
  });

  if (expected.css) {
    const cssAt = html.indexOf(expected.css);
    check(`${label}: the compiled artifact CSS precedes the ground element`, () => {
      assert.ok(cssAt !== -1, `the served HTML never carries ${expected.css}`);
      assert.ok(
        cssAt < groundAt,
        `artifact CSS at ${cssAt} does not precede the ground element at ${groundAt}`,
      );
      assert.ok(
        html.slice(0, cssAt).includes('<style'),
        'the artifact CSS is not inside an inline <style>',
      );
    });
  }
}

async function withServer(run) {
  if (!existsSync(path.join(SHOWROOM_ROOT, '.next/BUILD_ID'))) {
    throw new Error(
      'No production build found. Run `pnpm --filter @rottay/showroom build` first.',
    );
  }

  const server = spawn('pnpm', ['exec', 'next', 'start', '--port', String(PORT)], {
    cwd: SHOWROOM_ROOT,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let log = '';
  server.stdout.on('data', (chunk) => {
    log += chunk;
  });
  server.stderr.on('data', (chunk) => {
    log += chunk;
  });

  try {
    const deadline = Date.now() + 60_000;
    for (;;) {
      if (Date.now() > deadline) throw new Error(`next start never became ready:\n${log}`);
      try {
        const probe = await fetch(`${BASE_URL}/probe/whitelabel-torture`);
        if (probe.ok) break;
      } catch {
        // not listening yet
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return await run();
  } finally {
    server.kill('SIGTERM');
  }
}

if (!UNIT_ONLY) {
  await withServer(async () => {
    const fetchHtml = async (url) => {
      const response = await fetch(`${BASE_URL}${url}`);
      assert.ok(response.ok, `${url} responded ${response.status}`);
      return response.text();
    };

    assertServedDocument('bithire', await fetchHtml(BITHIRE_URL), {
      attributes: {
        'data-tenant': 'bithire',
        'data-vertical': 'bithire',
        'data-theme': 'light',
        'data-engine': 'modern',
      },
    });

    assertServedDocument('themanagement/canonical-db', await fetchHtml(MANAGEMENT_URL), {
      attributes: {
        'data-tenant': 'themanagement',
        'data-vertical': 'bithire',
        'data-theme': 'light',
        'data-engine': 'modern',
      },
      css: SPECIMEN_GROUND,
    });

    // The scene routes are the R1 evidence path, so they carry the same proof.
    assertServedDocument('scene:primitives themanagement/canonical-db', await fetchHtml(SCENE_URL), {
      attributes: {
        'data-tenant': 'themanagement',
        'data-theme': 'light',
        'data-engine': 'modern',
      },
      css: SPECIMEN_GROUND,
    });
  });
}

const failed = results.filter((result) => !result.ok);
for (const result of results) {
  console.log(`${result.ok ? '✓' : '✗'} ${result.name}${result.ok ? '' : `\n    ${result.detail}`}`);
}
console.log(
  `\n${results.length - failed.length}/${results.length} assertions passed${UNIT_ONLY ? ' (resolver only)' : ''}`,
);
if (failed.length > 0) process.exitCode = 1;
