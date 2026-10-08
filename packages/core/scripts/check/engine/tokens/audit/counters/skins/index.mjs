import { readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import postcss from 'postcss';
import { collectSkinFiles } from '../../../../../../libraries/engine/skins/files/index.mjs';
import { FROZEN_ENGINE_MOUNT, FROZEN_ENGINE_SOURCE } from '../../../../../../libraries/engine/frozen-mount/index.mjs';
import { root } from '../../context/paths/index.mjs';

/**
 * WO-SKIN-03: every skin stylesheet must parse.
 *
 * The migration's whole premise is that paint removed from a component is paint
 * a skin now carries. If the skin fails to parse, the browser drops it and the
 * component ships unpainted -- and nothing else in the chain notices: the
 * inline-paint counter reads the component's source, `tsc` does not read CSS,
 * and jsdom suites assert the DOM, not the stylesheet. Only a pixel diff would
 * catch it, and only for a state some baseline happens to photograph.
 *
 * Exact-0: the first unparseable skin fails the build.
 */
function countSkinParseErrors() {
  let errors = 0;
  for (const file of collectSkinFiles()) {
    try {
      postcss.parse(readFileSync(file, 'utf8'), { from: file });
    } catch (err) {
      errors += 1;
      console.error(`  - skin does not parse: ${file.replace(root + sep, '')} -- ${err.message}`);
    }
  }
  return errors;
}

/**
 * WO-SKIN-03: every skin stylesheet must be imported by the one entrypoint.
 *
 * A skin file that exists but is imported nowhere is bytes on disk: the browser
 * never sees it, the component it was written for ships unpainted, and every
 * other signal stays green (the counter reads the component's TSX, `tsc` does
 * not read CSS, jsdom does not read stylesheets).
 *
 * This check used to sweep two entrypoints because a second authored copy of
 * the same graph existed and a skin could be wired into only one of them --
 * dark for half the fleet. WO-CAN-03 removed the copy: `base/index.css` is
 * inlined into every shipped bundle (dist/rottay.css, dist/bithire.css,
 * dist/evnto.css and dist/styles.css), so wiring is now a single fact.
 *
 * Exact-0: the first unwired skin fails the build.
 */
function countUnwiredSkins() {
  const entrypoints = ['src/foundation/tokens/css/facade/entrypoints/base/index.css'].map((rel) => ({
    rel,
    css: readFileSync(join(root, rel), 'utf8'),
  }));
  // Frozen-engine skins ship through the build's mount, the one sheet that must wire them.
  const frozenMountRel = `src/foundation/tokens/css/${FROZEN_ENGINE_MOUNT}`;
  const frozenMount = [{ rel: frozenMountRel, css: readFileSync(join(root, frozenMountRel), 'utf8') }];

  let unwired = 0;
  for (const file of collectSkinFiles()) {
    // The import specifier every entrypoint uses, e.g. `engines/modern/skin/toast.css`
    // or `components/skin/toast-compounds.css` -- matched as a path suffix so the
    // relative prefix (`../`) does not matter.
    const specifier = file
      .slice(file.indexOf(`${sep}tokens${sep}css${sep}`) + `${sep}tokens${sep}css${sep}`.length)
      .split(sep)
      .join('/');
    const frozen = FROZEN_ENGINE_SOURCE.test(file);
    const wanted = frozen
      ? relative(dirname(join(root, frozenMountRel)), file).split(sep).join('/')
      : specifier;
    for (const { rel, css } of frozen ? frozenMount : entrypoints) {
      const imported = new RegExp(`@import\\s+['"][^'"]*${wanted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(
        css
      );
      if (!imported) {
        unwired += 1;
        console.error(`  - skin is not imported by ${rel}: ${specifier}`);
      }
    }
  }
  return unwired;
}

export {
  countSkinParseErrors,
  countUnwiredSkins,
};
