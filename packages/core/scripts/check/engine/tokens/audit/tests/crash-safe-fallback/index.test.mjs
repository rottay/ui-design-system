/**
 * The R4 negative drill for the crash-safe fallback allowance.
 *
 * The allowance it replaced was `floor: 8` -- a cardinality threshold that
 * could not tell background from box-shadow and read a fourth unrelated paint
 * property as compliance. Every case below is a way that threshold stayed
 * green while the crash surface drifted, and each one is now red.
 *
 * The positive case runs the REAL configuration against the REAL component, so
 * the drill and the shipped gate cannot disagree about what the floor is.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

import {
  collectSkinExemptionFailures,
} from '../../../../../../libraries/engine/skins/exemptions/index.mjs';
import {
  CRASH_SAFE_ENTRY_KEY,
  CRASH_SAFE_FALLBACK_ALLOWANCE,
} from '../../../../../../libraries/paint/crash-safe/index.mjs';
import { countArc09PaintInFile } from '../../../../../../libraries/paint/inline/index.mjs';
import { ENGINE_TOKEN_EXACT } from '../../../../../../libraries/engine/tokens/index.mjs';

const CORE_ROOT = resolve(import.meta.dirname, '../../../../../../..');
const COMPONENTS_DIR = join(CORE_ROOT, 'src/components');
const EXEMPTIONS_PATH = join(CORE_ROOT, '../../roadmap/skin-exemptions.json');
const BOUNDARY = CRASH_SAFE_FALLBACK_ALLOWANCE.file;
const BOUNDARY_SOURCE = readFileSync(join(COMPONENTS_DIR, BOUNDARY), 'utf8');

/** The shipped allowance, restated so a drill case can mutate one field of it. */
function shippedConfig() {
  return {
    'SKIN-EXEMPT-CRASH-SAFE-FALLBACK': {
      files: {
        [BOUNDARY]: {
          [CRASH_SAFE_ENTRY_KEY]: { ...CRASH_SAFE_FALLBACK_ALLOWANCE.properties },
        },
      },
    },
  };
}

/** A components tree holding just the crash surface, so drills mutate a copy. */
function planted(source = BOUNDARY_SOURCE, config = shippedConfig()) {
  const dir = mkdtempSync(join(tmpdir(), 'crash-safe-drill-'));
  const componentsDir = join(dir, 'components');
  const exemptionsPath = join(dir, 'skin-exemptions.json');
  const full = join(componentsDir, BOUNDARY);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, source);
  writeFileSync(exemptionsPath, JSON.stringify(config, null, 2));
  return {
    dir,
    audit: () => collectSkinExemptionFailures({ exemptionsPath, componentsDir }),
  };
}

function drill(source, config = shippedConfig()) {
  const fixture = planted(source, config);
  try {
    return fixture.audit();
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
}

/** The floor's three declarations, verbatim, as the drill mutates them. */
const BACKGROUND = "backgroundColor:\n          'var(--ds-surface-lifecycle-error-bg, light-dark(#fef2f2, #2a1215))',";
const BORDER =
  "border: '1px solid var(--ds-surface-lifecycle-error-border, light-dark(#fca5a5, #8c3a42))',";

test('the shipped configuration and the real crash surface are green', () => {
  assert.deepEqual(
    collectSkinExemptionFailures({ exemptionsPath: EXEMPTIONS_PATH, componentsDir: COMPONENTS_DIR }),
    [],
  );
});

test('the real crash surface paints exactly the three named properties', () => {
  assert.equal(countArc09PaintInFile(BOUNDARY_SOURCE, BOUNDARY), 3);
  assert.deepEqual(Object.keys(CRASH_SAFE_FALLBACK_ALLOWANCE.properties).sort(), [
    'backgroundColor',
    'border',
    'color',
  ]);
});

test('the counting pin and the naming pin agree on three', () => {
  assert.equal(ENGINE_TOKEN_EXACT[`fleet.inlinePaint.${BOUNDARY}`], 3);
});

test('NEGATIVE DRILL: a fourth unrelated paint property on the crash surface fails', () => {
  const planted4th = BOUNDARY_SOURCE.replace(
    BORDER,
    `${BORDER}\n        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',`,
  );
  assert.notEqual(planted4th, BOUNDARY_SOURCE, 'the drill must actually plant a fourth property');
  assert.equal(countArc09PaintInFile(planted4th, BOUNDARY), 4);

  const failures = drill(planted4th);
  assert.ok(failures.some((f) => /paints boxShadow, which the allowance does not name/.test(f)), failures.join('\n'));
  assert.ok(failures.some((f) => /counter reads 4 site\(s\); the named allowance is 3/.test(f)), failures.join('\n'));
});

test('NEGATIVE DRILL: a fourth property that is one of the three named, duplicated, fails', () => {
  const duplicated = BOUNDARY_SOURCE.replace(BORDER, `${BORDER}\n        ${BORDER}`);
  const failures = drill(duplicated);
  assert.ok(failures.some((f) => /border is painted twice/.test(f)), failures.join('\n'));
});

test('dropping one of the three properties fails; the floor is not a maximum', () => {
  const failures = drill(BOUNDARY_SOURCE.replace(BORDER, ''));
  assert.ok(failures.some((f) => /border is missing/.test(f)), failures.join('\n'));
});

test('a bare literal instead of the governed channel fails', () => {
  const ungoverned = BOUNDARY_SOURCE.replace(BACKGROUND, "backgroundColor: '#fef2f2',");
  const failures = drill(ungoverned);
  assert.ok(
    failures.some((f) => /backgroundColor does not read a governed channel/.test(f)),
    failures.join('\n'),
  );
});

test('the wrong governed channel fails', () => {
  const wrongChannel = BOUNDARY_SOURCE.replace(
    BACKGROUND,
    "backgroundColor: 'var(--ds-color-bg-primary, light-dark(#fef2f2, #2a1215))',",
  );
  const failures = drill(wrongChannel);
  assert.ok(
    failures.some((f) => /reads --ds-color-bg-primary; the allowance names --ds-surface-lifecycle-error-bg/.test(f)),
    failures.join('\n'),
  );
});

test('a light-only fallback fails: it measured 1.7-2.5:1 in dark scopes', () => {
  const lightOnly = BOUNDARY_SOURCE.replace(
    BACKGROUND,
    "backgroundColor: 'var(--ds-surface-lifecycle-error-bg, #fef2f2)',",
  );
  const failures = drill(lightOnly);
  assert.ok(
    failures.some((f) => /requires the documented per-mode light-dark\(\) pair/.test(f)),
    failures.join('\n'),
  );
});

test('a missing fallback fails: the channel is unset in exactly this failure', () => {
  const noFallback = BOUNDARY_SOURCE.replace(
    BACKGROUND,
    "backgroundColor: 'var(--ds-surface-lifecycle-error-bg)',",
  );
  const failures = drill(noFallback);
  assert.ok(failures.some((f) => /has no fallback/.test(f)), failures.join('\n'));
});

test('colour smuggled outside the governed channel fails', () => {
  const smuggled = BOUNDARY_SOURCE.replace(
    BORDER,
    "border: '1px solid var(--ds-surface-lifecycle-error-border, light-dark(#fca5a5, #8c3a42)) #ff0000',",
  );
  const failures = drill(smuggled);
  assert.ok(
    failures.some((f) => /carries colour outside its governed channel/.test(f)),
    failures.join('\n'),
  );
});

test('paint the name walk cannot read fails on the cardinality cross-check', () => {
  const setter = BOUNDARY_SOURCE.replace(
    "  const i18n = useOptionalTranslation('components');",
    "  const i18n = useOptionalTranslation('components');\n  document.documentElement.style.color = 'red';",
  );
  const failures = drill(setter);
  assert.ok(
    failures.some((f) => /counter reads 4 site\(s\); the named allowance is 3/.test(f)),
    failures.join('\n'),
  );
});

test('NO OTHER COMPONENT MAY COPY IT: the key is refused on any other path', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crash-safe-drill-'));
  try {
    const componentsDir = join(dir, 'components');
    const copycat = 'primitives/display/Card/engines/modern/index.tsx';
    for (const path of [BOUNDARY, copycat]) {
      const full = join(componentsDir, path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, BOUNDARY_SOURCE);
    }
    const config = shippedConfig();
    config['SKIN-EXEMPT-CRASH-SAFE-FALLBACK'].files[copycat] = {
      [CRASH_SAFE_ENTRY_KEY]: { ...CRASH_SAFE_FALLBACK_ALLOWANCE.properties },
    };
    const exemptionsPath = join(dir, 'skin-exemptions.json');
    writeFileSync(exemptionsPath, JSON.stringify(config, null, 2));

    const failures = collectSkinExemptionFailures({ exemptionsPath, componentsDir });
    assert.ok(
      failures.some((f) => /no other component may copy it/.test(f) && f.includes(copycat)),
      failures.join('\n'),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the configuration cannot widen the allowance to a fourth property', () => {
  const config = shippedConfig();
  config['SKIN-EXEMPT-CRASH-SAFE-FALLBACK'].files[BOUNDARY][CRASH_SAFE_ENTRY_KEY].boxShadow =
    '--ds-surface-lifecycle-error-shadow';
  const failures = drill(BOUNDARY_SOURCE, config);
  assert.ok(
    failures.some((f) => /the approved allowance is exactly \[backgroundColor, border, color\]/.test(f)),
    failures.join('\n'),
  );
});

test('the configuration cannot re-admit a threshold beside the named allowance', () => {
  const config = shippedConfig();
  config['SKIN-EXEMPT-CRASH-SAFE-FALLBACK'].files[BOUNDARY].floor = 8;
  const failures = drill(BOUNDARY_SOURCE, config);
  assert.ok(
    failures.some((f) => /the named allowance replaces the threshold/.test(f)),
    failures.join('\n'),
  );
});

test('a second family cannot sum a numeric floor onto the crash surface', () => {
  const config = shippedConfig();
  config['SKIN-EXEMPT-RUNTIME-VALUE'] = { files: { [BOUNDARY]: { floor: 8 } } };
  const failures = drill(BOUNDARY_SOURCE, config);
  assert.ok(
    failures.some((f) => /carries both the named crash-safe allowance and a numeric floor/.test(f)),
    failures.join('\n'),
  );
});

test('deleting the allowance while the crash surface exists fails', () => {
  const config = { 'SKIN-EXEMPT-RUNTIME-VALUE': { files: { [BOUNDARY]: { floor: 3 } } } };
  const failures = drill(BOUNDARY_SOURCE, config);
  assert.ok(
    failures.some((f) => /must stay declared while the crash surface does/.test(f)),
    failures.join('\n'),
  );
});
