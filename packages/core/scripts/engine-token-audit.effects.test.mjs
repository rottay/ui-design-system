import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  collectBelowFloorFailures,
  countPremiumEffectConsumers,
} from "./lib/effect-consumer-counter.mjs";

function fixtureFiles() {
  const dir = mkdtempSync(join(tmpdir(), "engine-effect-consumers-"));
  const source = join(dir, "render.tsx");
  const skin = join(dir, "skin.css");
  return {
    dir,
    source,
    skin,
    writeSource(text) {
      writeFileSync(source, text);
    },
    writeSkin(text) {
      writeFileSync(skin, text);
    },
  };
}

test("a live skin declaration counts once even when its path is supplied twice", () => {
  const fixture = fixtureFiles();
  try {
    fixture.writeSource("export const Component = () => <div />;\n");
    fixture.writeSkin(".banner { box-shadow: var(--ds-shadow-glow-primary); }\n");

    assert.deepEqual(
      countPremiumEffectConsumers({
        sourceFiles: [fixture.source],
        skinFiles: [fixture.skin, fixture.skin],
      }),
      { gradient: 0, glass: 0, glow: 1 },
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("a token definition is not a render consumer", () => {
  const fixture = fixtureFiles();
  try {
    fixture.writeSkin(`
      :root {
        --ds-shadow-glow-primary: 0 0 1rem currentColor;
        --local-glow-alias: var(--ds-shadow-glow-primary);
      }
    `);

    assert.equal(
      countPremiumEffectConsumers({ skinFiles: [fixture.skin] }).glow,
      0,
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("removing the only live glow use trips the existing minimum floor", () => {
  const fixture = fixtureFiles();
  try {
    fixture.writeSkin(".banner { box-shadow: var(--ds-shadow-glow-primary); }\n");
    const before = countPremiumEffectConsumers({ skinFiles: [fixture.skin] });
    assert.deepEqual(
      collectBelowFloorFailures(
        { "effects.glowConsumers": before.glow },
        { "effects.glowConsumers": 1 },
      ),
      [],
    );

    fixture.writeSkin(".banner { box-shadow: var(--ds-elevation-1); }\n");
    const after = countPremiumEffectConsumers({ skinFiles: [fixture.skin] });
    assert.deepEqual(
      collectBelowFloorFailures(
        { "effects.glowConsumers": after.glow },
        { "effects.glowConsumers": 1 },
      ),
      ["effects.glowConsumers: 0 < required >= 1"],
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});
