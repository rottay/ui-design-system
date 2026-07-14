import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { collectSkinExemptionFailures, countSkinExemptionBreaches } from './lib/skin-exemption-audit.mjs';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'skin-exemption-audit-'));
  const componentsDir = join(dir, 'components');
  const exemptionsPath = join(dir, 'skin-exemptions.json');
  mkdirSync(componentsDir);

  return {
    dir,
    componentsDir,
    exemptionsPath,
    writeComponent(path, source = 'paint paint paint\n') {
      const full = join(componentsDir, path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, source);
      return full;
    },
    writeConfig(document) {
      writeFileSync(exemptionsPath, JSON.stringify(document, null, 2));
    },
    audit(options = {}) {
      return collectSkinExemptionFailures({
        exemptionsPath,
        componentsDir,
        countPaint: (source) => source.match(/paint/g)?.length ?? 0,
        countRuntimeSvgPaint: (source) => source.match(/runtime/g)?.length ?? 0,
        countEmbeddedCssPaint: (source) => source.match(/embedded/g)?.length ?? 0,
        ...options,
      });
    },
  };
}

function family(files) {
  return { files };
}

test('floors for one canonical path are summed across exemption families', () => {
  const f = fixture();
  try {
    f.writeComponent('shared.tsx', 'paint paint paint paint paint paint paint paint\n');
    f.writeConfig({
      'RUNTIME-VALUE': family({ 'shared.tsx': { floor: 1 } }),
      'NOT-PAINT': family({ 'shared.tsx': { floor: 8 } }),
    });

    let countCalls = 0;
    const failures = f.audit({
      countPaint(source) {
        countCalls += 1;
        return source.match(/paint/g)?.length ?? 0;
      },
    });

    assert.equal(countCalls, 1, 'the shared file must be measured once');
    assert.equal(failures.length, 1);
    assert.match(failures[0], /combined floor of 9/);
    assert.match(failures[0], /RUNTIME-VALUE=1 \+ NOT-PAINT=8/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('a file at the sum of all of its floors passes', () => {
  const f = fixture();
  try {
    f.writeComponent('shared.tsx', 'paint '.repeat(9));
    f.writeConfig({
      A: family({ 'shared.tsx': { floor: 4 } }),
      B: family({ 'shared.tsx': { floor: 5 } }),
    });

    assert.deepEqual(f.audit(), []);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('inline exemption counting receives the canonical target path', () => {
  const f = fixture();
  try {
    const target = f.writeComponent('nested/target.tsx', 'paint\n');
    f.writeConfig({ A: family({ 'nested/target.tsx': { floor: 1 } }) });

    let observedPath;
    const failures = f.audit({
      countPaint(source, canonicalPath) {
        observedPath = canonicalPath;
        return source.match(/paint/g)?.length ?? 0;
      },
    });

    assert.deepEqual(failures, []);
    assert.equal(observedPath, realpathSync(target));
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('runtime SVG floors are measured independently from inline floors', () => {
  const f = fixture();
  try {
    f.writeComponent('shared.tsx', 'paint paint runtime runtime runtime\n');
    f.writeConfig({
      A: family({
        'shared.tsx': { floor: 2, runtimeSvgFloor: 1 },
      }),
      B: family({ 'shared.tsx': { runtimeSvgFloor: 3 } }),
    });

    let inlineCalls = 0;
    let runtimeCalls = 0;
    const failures = f.audit({
      countPaint(source) {
        inlineCalls += 1;
        return source.match(/paint/g)?.length ?? 0;
      },
      countRuntimeSvgPaint(source) {
        runtimeCalls += 1;
        return source.match(/runtime/g)?.length ?? 0;
      },
    });

    assert.equal(inlineCalls, 1, 'the inline channel is measured once');
    assert.equal(runtimeCalls, 1, 'the runtime SVG channel is measured once');
    assert.equal(failures.length, 1);
    assert.match(failures[0], /exemption breached \(runtime SVG\)/);
    assert.match(failures[0], /combined runtimeSvgFloor of 4/);
    assert.match(failures[0], /A=1 \+ B=3/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test("one paint channel cannot satisfy the other channel's floor", () => {
  const f = fixture();
  try {
    f.writeComponent('target.tsx', 'paint '.repeat(20));
    f.writeConfig({
      A: family({ 'target.tsx': { floor: 1, runtimeSvgFloor: 1 } }),
    });

    const failures = f.audit();
    assert.equal(failures.length, 1);
    assert.match(failures[0], /runtime SVG.*is at 0/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('embedded CSS floors are independent from inline and runtime SVG floors', () => {
  const f = fixture();
  try {
    f.writeComponent('target.tsx', 'paint '.repeat(20) + 'runtime '.repeat(20));
    f.writeConfig({
      A: family({
        'target.tsx': {
          floor: 1,
          runtimeSvgFloor: 1,
          embeddedCssFloor: 1,
        },
      }),
    });

    const failures = f.audit();
    assert.equal(failures.length, 1);
    assert.match(failures[0], /embedded CSS.*is at 0/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('embedded CSS floors sum separately across exemption families', () => {
  const f = fixture();
  try {
    f.writeComponent('target.tsx', 'embedded embedded embedded\n');
    f.writeConfig({
      A: family({ 'target.tsx': { embeddedCssFloor: 1 } }),
      B: family({ 'target.tsx': { embeddedCssFloor: 3 } }),
    });

    let countCalls = 0;
    const failures = f.audit({
      countEmbeddedCssPaint(source) {
        countCalls += 1;
        return source.match(/embedded/g)?.length ?? 0;
      },
    });
    assert.equal(countCalls, 1);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /combined embeddedCssFloor of 4/);
    assert.match(failures[0], /A=1 \+ B=3/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('an embedded-CSS-only exemption entry is valid', () => {
  const f = fixture();
  try {
    f.writeComponent('target.tsx', 'embedded\n');
    f.writeConfig({
      A: family({ 'target.tsx': { embeddedCssFloor: 1 } }),
    });

    assert.deepEqual(f.audit(), []);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('a runtime-only exemption entry is valid', () => {
  const f = fixture();
  try {
    f.writeComponent('target.tsx', 'runtime\n');
    f.writeConfig({
      A: family({ 'target.tsx': { runtimeSvgFloor: 1 } }),
    });

    assert.deepEqual(f.audit(), []);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('the floor gate intentionally proves aggregate cardinality, not source identity', () => {
  const f = fixture();
  try {
    f.writeComponent('target.tsx', 'ordinary paint\n');
    f.writeConfig({
      A: family({
        'target.tsx': {
          floor: 1,
          why: 'Checkpoint contracts and visual tests identify the protected expression.',
        },
      }),
    });

    assert.deepEqual(f.audit(), []);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('a missing exemption configuration is a breach instead of a vacuous zero', () => {
  const f = fixture();
  try {
    const messages = [];
    const breaches = countSkinExemptionBreaches({
      exemptionsPath: f.exemptionsPath,
      componentsDir: f.componentsDir,
      log: (message) => messages.push(message),
    });

    assert.equal(breaches, 1);
    assert.match(messages[0], /configuration does not exist/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('a configured path that does not exist fails explicitly', () => {
  const f = fixture();
  try {
    f.writeConfig({ A: family({ 'missing.tsx': { floor: 1 } }) });

    const failures = f.audit();
    assert.equal(failures.length, 1);
    assert.match(failures[0], /file that does not exist/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('an unresolved glob fails even when it would match files', () => {
  const f = fixture();
  try {
    f.writeComponent('charts/bar.tsx');
    f.writeConfig({ A: family({ 'charts/**': { floor: 1 } }) });

    const failures = f.audit();
    assert.equal(failures.length, 1);
    assert.match(failures[0], /unresolved glob/);
    assert.match(failures[0], /concrete per-file floors/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('invalid floors cannot silently disable comparison', async (t) => {
  const invalidFloors = [
    ['missing', undefined],
    ['string', '1'],
    ['zero', 0],
    ['negative', -1],
    ['fractional', 1.5],
    ['null', null],
  ];

  for (const [label, floor] of invalidFloors) {
    await t.test(label, () => {
      const f = fixture();
      try {
        f.writeComponent('target.tsx');
        const entry = floor === undefined ? {} : { floor };
        f.writeConfig({ A: family({ 'target.tsx': entry }) });

        const failures = f.audit();
        assert.equal(failures.length, 1);
        assert.match(
          failures[0],
          floor === undefined ? /must declare floor, runtimeSvgFloor, and\/or embeddedCssFloor/ : /invalid floor/
        );
      } finally {
        rmSync(f.dir, { recursive: true, force: true });
      }
    });
  }
});

test('invalid runtime SVG floors cannot silently disable comparison', async (t) => {
  const invalidFloors = ['1', 0, -1, 1.5, null];

  for (const runtimeSvgFloor of invalidFloors) {
    await t.test(JSON.stringify(runtimeSvgFloor), () => {
      const f = fixture();
      try {
        f.writeComponent('target.tsx');
        f.writeConfig({
          A: family({ 'target.tsx': { runtimeSvgFloor } }),
        });

        const failures = f.audit();
        assert.equal(failures.length, 1);
        assert.match(failures[0], /invalid runtimeSvgFloor/);
      } finally {
        rmSync(f.dir, { recursive: true, force: true });
      }
    });
  }
});

test('invalid embedded CSS floors cannot silently disable comparison', async (t) => {
  const invalidFloors = ['1', 0, -1, 1.5, null];

  for (const embeddedCssFloor of invalidFloors) {
    await t.test(JSON.stringify(embeddedCssFloor), () => {
      const f = fixture();
      try {
        f.writeComponent('target.tsx');
        f.writeConfig({
          A: family({ 'target.tsx': { embeddedCssFloor } }),
        });

        const failures = f.audit();
        assert.equal(failures.length, 1);
        assert.match(failures[0], /invalid embeddedCssFloor/);
      } finally {
        rmSync(f.dir, { recursive: true, force: true });
      }
    });
  }
});

test('malformed families, files maps, and entries are reported rather than skipped', async (t) => {
  const cases = [
    ['non-object family', { A: null }, /family A must be an object/],
    ['missing files map', { A: {} }, /missing its files map/],
    ['non-object files map', { A: { files: [] } }, /A\.files must be an object/],
    ['empty files map', { A: { files: {} } }, /A\.files must not be empty/],
    ['non-object entry', { A: family({ 'target.tsx': null }) }, /entry .* must be an object/],
  ];

  for (const [label, document, expected] of cases) {
    await t.test(label, () => {
      const f = fixture();
      try {
        f.writeComponent('target.tsx');
        f.writeConfig(document);

        const failures = f.audit();
        assert.equal(failures.length, 1);
        assert.match(failures[0], expected);
      } finally {
        rmSync(f.dir, { recursive: true, force: true });
      }
    });
  }
});

test('unknown executable keys are breaches while $metadata and entry why remain allowed', async (t) => {
  await t.test('family typo beside a valid files map', () => {
    const f = fixture();
    try {
      f.writeComponent('target.tsx');
      f.writeConfig({
        A: {
          files: { 'target.tsx': { floor: 1 } },
          fiels: { 'silently-ignored.tsx': { floor: 8 } },
        },
      });

      const failures = f.audit();
      assert.equal(failures.length, 1);
      assert.match(failures[0], /family A has unknown key "fiels"/);
    } finally {
      rmSync(f.dir, { recursive: true, force: true });
    }
  });

  await t.test('entry typo beside a valid floor', () => {
    const f = fixture();
    try {
      f.writeComponent('target.tsx');
      f.writeConfig({
        A: family({ 'target.tsx': { floor: 1, whi: 'typo' } }),
      });

      const failures = f.audit();
      assert.equal(failures.length, 1);
      assert.match(failures[0], /entry \(A: target\.tsx\) has unknown key "whi"/);
    } finally {
      rmSync(f.dir, { recursive: true, force: true });
    }
  });

  await t.test('metadata at every schema level and entry why', () => {
    const f = fixture();
    try {
      f.writeComponent('target.tsx');
      f.writeConfig({
        $comment: 'root metadata',
        A: {
          $why: 'family metadata',
          files: {
            'target.tsx': {
              floor: 1,
              why: 'human-readable reason',
              $note: 'entry metadata',
            },
          },
        },
      });

      assert.deepEqual(f.audit(), []);
    } finally {
      rmSync(f.dir, { recursive: true, force: true });
    }
  });
});

test('invalid JSON, a non-object root, and a vacuous document fail explicitly', async (t) => {
  await t.test('invalid JSON', () => {
    const f = fixture();
    try {
      writeFileSync(f.exemptionsPath, '{');
      const failures = f.audit();
      assert.equal(failures.length, 1);
      assert.match(failures[0], /not valid JSON/);
    } finally {
      rmSync(f.dir, { recursive: true, force: true });
    }
  });

  await t.test('array root', () => {
    const f = fixture();
    try {
      f.writeConfig([]);
      const failures = f.audit();
      assert.equal(failures.length, 1);
      assert.match(failures[0], /root must be an object/);
    } finally {
      rmSync(f.dir, { recursive: true, force: true });
    }
  });

  await t.test('metadata-only root', () => {
    const f = fixture();
    try {
      f.writeConfig({
        $comment: 'all executable families were accidentally omitted',
      });
      const failures = f.audit();
      assert.equal(failures.length, 1);
      assert.match(failures[0], /at least one exemption family/);
    } finally {
      rmSync(f.dir, { recursive: true, force: true });
    }
  });
});

test('targets outside the components tree cannot be exempted', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.dir, 'outside.tsx'), 'paint\n');
    f.writeConfig({ A: family({ '../outside.tsx': { floor: 1 } }) });

    const failures = f.audit();
    assert.equal(failures.length, 1);
    assert.match(failures[0], /outside the components directory/);
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});
