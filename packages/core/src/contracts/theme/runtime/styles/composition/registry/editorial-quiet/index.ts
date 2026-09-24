/**
 * @fileoverview `editorial-quiet@1`, one of WO-DER-09's two contrasting registry fixtures, drawn from WO-DER-07's
 * measured `editorial-quiet` candidate with its brand rows left to the tenant.
 *
 * @module Contracts/Theme/Styles/Registry/EditorialQuiet
 * @category Types
 * @package @rottay/design-system
 */

import { defineThemeStyle } from "@/contracts/theme/runtime/styles/foundation/document";
import document from "./document/index.json";
import manifest from "./manifest/index.json";

export const EDITORIAL_QUIET_V1 = defineThemeStyle({ document, manifest });
