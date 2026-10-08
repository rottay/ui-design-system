import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { countArc09PaintInFile } from '../../../../../libraries/paint/inline/index.mjs';
import { countEmbeddedCssPaintInFile } from '../../../../../libraries/paint/embedded/index.mjs';
import { argumentValue } from '../context/arguments/index.mjs';

/**
 * Adversarial fixture seam for the `themeCss.*` counter family, the twin of
 * the `--gat07-evasion-fixture` seam below and used by this gate's own
 * injection drill (`tests/theme-css-consumers`).
 *
 * The fixture is appended to ONE engine's consumer corpus -- chosen by
 * `--themecss-consumer-engine=modern|classic|rustic`, default `modern` -- and
 * read by the SAME `buildConsumedClassSet()` the production counter uses (the
 * shared `auditEngineTheme()` scan, for every engine): no toy second scanner,
 * and no test-only counter in the baseline. It exists because every
 * `themeCss.*` dead-selector figure is a computed classification: a scanner
 * that stopped classifying, or one that classified a `//` comment as a render
 * site, reports a plausible number and looks exactly like a clean tree. It
 * reported 0 for months for precisely that reason.
 *
 * The engine selector exists because the modern plane is now DRAINED
 * (`themeCss.unreferencedSelectors === 0`, WO-RET-02, 2026-09-07), so a
 * modern-plane injection has nothing left to lower and a drill anchored there
 * can only assert a floor. The frozen engines still carry a large, stable
 * dead-selector population, which is a measurement plane that stays usable
 * without ever asking anyone to keep dead rules alive on the productive one.
 *
 * The flags are read here and applied where every engine corpus exists, through
 * a record keyed by engine name -- never a branch chain, which would be a second
 * roster. Normal runs pass no fixture and behave identically.
 */
const themeCssConsumerFixture = argumentValue('--themecss-consumer-fixture');
/* The engine this FLAG defaults to when the caller names none. It is not an
 * engine-resolution fallback -- nothing here reads a roster row -- but it was
 * spelled as a nullish-coalescing engine literal, which is the exact shape
 * F-27 forbids, so the sweep that keeps one engine law could not tell the two
 * apart. Named, so it can. */
const THEMECSS_CONSUMER_ENGINE_DEFAULT = 'modern';
const themeCssConsumerEngine =
  argumentValue('--themecss-consumer-engine') ?? THEMECSS_CONSUMER_ENGINE_DEFAULT;

function applyThemeCssConsumerFixture(themeCssConsumerCorpora) {
  if (themeCssConsumerFixture) {
    const corpus = themeCssConsumerCorpora[themeCssConsumerEngine];
    if (!corpus) {
      throw new Error(
        `--themecss-consumer-engine must name one of the swept corpora ` +
          `(${Object.keys(themeCssConsumerCorpora).join(', ')}), got: ${themeCssConsumerEngine}`,
      );
    }
    const fixturePath = resolve(themeCssConsumerFixture);
    if (!existsSync(fixturePath) || !statSync(fixturePath).isFile()) {
      throw new Error(`themeCss consumer fixture does not exist: ${fixturePath}`);
    }
    corpus.push(fixturePath);
  }
}

/**
 * Adversarial fixture seam used only by WO-GAT-07's end-to-end evasion drills.
 *
 * The fixture is parsed by the same production counters as the real component
 * tree, then added to two existing completed-zero keys. This avoids a toy
 * duplicate scanner and avoids adding test-only counters to the 2,922-key
 * baseline. Normal runs have no fixture and therefore no behavior change.
 */
function applyEvasionFixture(counters) {
  const evasionFixture = argumentValue('--gat07-evasion-fixture');
  let evasionProbe = null;
  if (evasionFixture) {
    const fixturePath = resolve(evasionFixture);
    if (!existsSync(fixturePath) || !statSync(fixturePath).isFile()) {
      throw new Error(`WO-GAT-07 evasion fixture does not exist: ${fixturePath}`);
    }
    const fixtureText = readFileSync(fixturePath, 'utf8');
    evasionProbe = {
      fixture: fixturePath,
      inlinePaint: countArc09PaintInFile(fixtureText, fixturePath),
      embeddedCssPaint: countEmbeddedCssPaintInFile(fixtureText, fixturePath),
    };
    counters['arc09.inlinePaint.primitives/display/table/engines/modern/index.tsx'] +=
      evasionProbe.inlinePaint;
    counters['embeddedCssPaint.primitives/display/table/engines/modern/index.tsx'] +=
      evasionProbe.embeddedCssPaint;
  }
  return evasionProbe;
}

export {
  applyThemeCssConsumerFixture,
  applyEvasionFixture,
};
