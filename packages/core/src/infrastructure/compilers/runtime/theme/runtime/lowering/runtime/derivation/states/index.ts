/**
 * @fileoverview The states family: one interaction vocabulary, derived from
 * the two state decisions instead of restated per component.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/states
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * The emphasis postures, as the deltas every state expresses.
 *
 * A delta, never a value: `hover` is "how far the resting ground travels
 * toward the brand", so one number moves every material root and every
 * component channel wired to one. `medium` reproduces the channel values the
 * foundation carried before this family existed, which is what makes an
 * unauthored theme byte-identical rather than merely similar.
 *
 * The cascade catalog also names `pressed`, `checked` and `expanded` deltas.
 * They are NOT emitted: nothing in the tree reads them, and a producer with no
 * reader is a channel that looks customizable and is not -- the exact shape
 * F-09 counts. They enter with the family cut that gives them a consumer.
 */
const EMPHASIS_DELTAS = {
  subtle: {
    hover: "2%",
    active: "4%",
    selected: "5%",
    disabledMix: "88%",
    disabledOpacity: "0.68",
    pressScale: "0.99",
  },
  medium: {
    hover: "4%",
    active: "7%",
    selected: "9%",
    disabledMix: "82%",
    disabledOpacity: "0.6",
    pressScale: "0.98",
  },
  strong: {
    hover: "8%",
    active: "13%",
    selected: "17%",
    disabledMix: "72%",
    disabledOpacity: "0.5",
    pressScale: "0.965",
  },
} as const;

type EmphasisPosture = keyof typeof EMPHASIS_DELTAS;

/**
 * The focus signatures, as the ring the whole product wears.
 *
 * `ring` is the double ring the interaction contract already specifies and is
 * emitted verbatim, so a theme that states nothing keeps the exact shadow it
 * had. The other two are the same two operands arranged differently: nobody
 * re-picks a colour to change the signature.
 */
const FOCUS_SIGNATURES = {
  ring: {
    width: "2px",
    offset: "2px",
    shadow:
      "0 0 0 var(--ds-focus-ring-offset) var(--ds-color-bg-primary), 0 0 0 calc(var(--ds-focus-ring-offset) + var(--ds-focus-ring-width)) var(--ds-focus-ring-color)",
  },
  underline: {
    width: "2px",
    offset: "0px",
    shadow: "inset 0 calc(-1 * var(--ds-focus-ring-width)) 0 0 var(--ds-focus-ring-color)",
  },
  glow: {
    width: "1px",
    offset: "0px",
    shadow:
      "0 0 0 var(--ds-focus-ring-width) var(--ds-focus-ring-color), 0 0 12px 2px color-mix(in srgb, var(--ds-focus-ring-color) 45%, transparent)",
  },
} as const;

type FocusSignature = keyof typeof FOCUS_SIGNATURES;

function readEmphasis(bt: BrandTheme): EmphasisPosture {
  const authored = bt.surfaces?.stateEmphasis;
  return authored !== undefined && authored in EMPHASIS_DELTAS
    ? (authored as EmphasisPosture)
    : "medium";
}

function readFocusStyle(bt: BrandTheme): FocusSignature {
  const authored = bt.surfaces?.focusStyle;
  return authored !== undefined && authored in FOCUS_SIGNATURES
    ? (authored as FocusSignature)
    : "ring";
}

/**
 * One vocabulary for every interaction state.
 *
 * The eight state roots the cascade catalog declares are emitted here and
 * nowhere else, and the materials family expresses its state facets in terms
 * of them, so moving `states.emphasis` moves the whole surface stack through
 * one number per state rather than through the ~370 per-component channels
 * F-10 measured.
 */
export const statesDeriver: FamilyDeriver = {
  family: "states",
  rank: "derived",
  consumes: ["surfaces.stateEmphasis", "surfaces.focusStyle"],
  produces: [
    "--ds-state-*",
    "--ds-focus-ring",
    "--ds-focus-ring-width",
    "--ds-focus-ring-offset",
  ],
  derive: (context) => deriveStateChannels(context.theme),
};

export function deriveStateChannels(bt: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  const emphasis = readEmphasis(bt);
  const delta = EMPHASIS_DELTAS[emphasis];
  const focusStyle = readFocusStyle(bt);
  const focus = FOCUS_SIGNATURES[focusStyle];

  // Written as explicit assignments rather than a loop: the producer census
  // both cascade gates share reads these names out of the source text, so a
  // computed key would leave every state root without a declared producer.
  vars["--ds-state-hover-shift"] = delta.hover;
  vars["--ds-state-active-shift"] = delta.active;
  vars["--ds-state-selected-shift"] = delta.selected;
  vars["--ds-state-disabled-mix"] = delta.disabledMix;
  vars["--ds-state-disabled-opacity"] = delta.disabledOpacity;
  vars["--ds-state-press-scale"] = delta.pressScale;
  vars["--ds-focus-ring-width"] = focus.width;
  vars["--ds-focus-ring-offset"] = focus.offset;
  vars["--ds-focus-ring"] = focus.shadow;
  return vars;
}
