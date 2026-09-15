/**
 * @fileoverview The Rottay vertical theme preset source of WO-DER-06: a v2
 * decision document and its manifest, both JSON, so the gate and the door read
 * the same bytes. Composed and validated by the verticals owner above, never
 * cast here.
 *
 * @module Foundation/Presets/Verticals/Rottay
 * @category Types
 * @package @rottay/design-system
 */

import document from "./document/index.json";
import manifest from "./manifest/index.json";

export const ROTTAY_PRESET_SOURCE: { readonly document: unknown; readonly manifest: unknown } =
  Object.freeze({ document, manifest });
