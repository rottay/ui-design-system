/**
 * @fileoverview `quiet-premium@1`, the first registered style.
 *
 * Composition only: the content is the two JSON siblings and the record is what
 * `defineThemeStyle` makes of them. The real first-party catalogue is WO-DER-09;
 * this publication exists so the registry, the partition, the clearance and the
 * admission are exercised by something real rather than by a fixture.
 *
 * @module Contracts/Theme/Styles/Registry/QuietPremium
 * @category Types
 * @package @rottay/design-system
 */

import { defineThemeStyle } from "@/contracts/theme/runtime/styles/foundation/document";
import document from "./document/index.json";
import manifest from "./manifest/index.json";

export const QUIET_PREMIUM_V1 = defineThemeStyle({ document, manifest });
