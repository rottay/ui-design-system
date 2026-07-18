import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";

/**
 * Consumer signal for the motion recipe canon (WO-CRA-15 adoption floor):
 * a render-owned source file calling the recipe seam. Matches both the raw
 * resolver hook and the component-facing presentation wrapper
 * (`useMotionRecipe(...)` / `useMotionRecipePresentation(...)`), and only as
 * a CALL, so a re-export or a string mention does not count.
 */
export const MOTION_RECIPE_CONSUMER_RE = /\buseMotionRecipe(?:Presentation)?\s*\(/;

/**
 * Map a source file under `src/ui` to its owning COMPONENT, so a component
 * with several engine implementations counts once. The owner is the first
 * three relative segments (`<tier>/<group>/<Component>`); a shallower file
 * maps to its own path and still counts once.
 */
export function componentOwnerOf(file, componentsDir) {
  const rel = relative(componentsDir, file).split(sep).join("/");
  return rel.split("/").slice(0, 3).join("/");
}

/**
 * Count DISTINCT components under `componentsDir` whose render-owned source
 * consumes a motion recipe. `sourceFiles` are pre-filtered TS/TSX production
 * files (no tests/stories); paths are de-duplicated before scanning.
 */
export function countMotionRecipeConsumers({ sourceFiles = [], componentsDir }) {
  const owners = new Set();
  for (const file of new Set(sourceFiles)) {
    const text = readFileSync(file, "utf8");
    if (MOTION_RECIPE_CONSUMER_RE.test(text)) {
      owners.add(componentOwnerOf(file, componentsDir));
    }
  }
  return owners.size;
}
