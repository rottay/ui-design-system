/**
 * @fileoverview The family registry: every deriver the one pipeline runs.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../foundation/contract";
import { axesDeriver } from "./axes";
import { chartsDeriver } from "./charts";
import { chromeDeriver } from "./chrome";
import { expressiveDeriver } from "./expressive";
import { motionDeriver } from "./motion";
import { paletteDeriver } from "./palette";
import { rampsDeriver } from "./ramps";
import { recipesDeriver } from "./recipes";
import { seedsDeriver } from "./seeds";
import { surfacesDeriver } from "./surfaces";
import { tenantDeriver } from "./tenant";
import { tintDeriver } from "./tint";
import { typeRolesDeriver } from "./type-roles";
import { typographyDeriver } from "./typography";

/**
 * The registry, in EMISSION order.
 *
 * Emission order decides where a channel's declaration lands in the compiled
 * block; it never decides which value wins -- that is the rank on each
 * deriver, resolved by the pipeline per channel. The two are deliberately
 * independent: a family can be moved in this list without changing a single
 * value, and a rank can be changed without moving a single declaration.
 */
export const FAMILY_DERIVERS: readonly FamilyDeriver[] = Object.freeze([
  expressiveDeriver,
  axesDeriver,
  typographyDeriver,
  paletteDeriver,
  surfacesDeriver,
  rampsDeriver,
  chartsDeriver,
  tintDeriver,
  typeRolesDeriver,
  motionDeriver,
  tenantDeriver,
  chromeDeriver,
  seedsDeriver,
  recipesDeriver,
]);
