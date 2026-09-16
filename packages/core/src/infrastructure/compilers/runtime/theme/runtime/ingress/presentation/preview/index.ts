/**
 * @fileoverview The preview ingress: an unsaved tenant customization.
 *
 * @module Compilers/Theme/Ingress/Presentation/Preview
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  isTenantThemeDocumentV2,
  type TenantThemeDocumentAny,
} from "@/contracts/theme/presentation/document";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeVerticalEnvelope } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { admitDocument, baselineFor, type DocumentAdmission } from "../../runtime/document-v2";
import { authoredThemePatch } from "../../foundation/draft-patch";
import { movedThemePatch } from "../../foundation/authorship";
import { draftProvenanceLedger } from "../../foundation/provenance";
import { liftAuthoredTheme, readGovernedTheme } from "../../../lowering/foundation/intake";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { Theme } from "@/foundation/contracts/composition/tenants/themes/iso";

/** What an unsaved document preview needs to name a compile. */
export interface PreviewThemeIntentInput {
  vertical: FirstPartyVerticalId;
  slug: string;
  document: TenantThemeDocumentAny;
  /** As on the persisted producer: preview clamps where publication clamps. */
  ranges?: TenantThemeVerticalEnvelope["ranges"];
}

/** What an unsaved studio draft needs to name a compile. */
export interface DraftPreviewThemeIntentInput {
  vertical: FirstPartyVerticalId;
  slug: string;
  /**
   * The draft, as the governed `Theme` the studio now authors (WO-DER-08).
   *
   * It used to be the flat projection, which made that projection an AUTHORING
   * surface as well as the lowering's read view -- the one claim the flat
   * shape's retirement narrative could not make honestly. The door flattens it
   * once, below, with the canonical `readGovernedTheme`, so the patch, the
   * ledger and the baseline this intent carries are byte-for-byte the ones the
   * flat draft produced: measured leaf by leaf, zero differences in either
   * direction. The lowering's own reads are NOT retyped here; that is the
   * deferred (b) lot with its own write set.
   */
  draft: Theme | FlatTheme;
  /**
   * The baseline the draft is a patch of; the vertical's own unless the caller
   * resolved another.
   *
   * When supplied it is the EFFECTIVE baseline, not merely the prune's
   * yardstick: a leaf equal to it is not authorship AND keeps the carried
   * value in the compiled theme, because the intent hands this same baseline to
   * the resolution. A studio that opens a tenant's customized theme and edits
   * one field therefore keeps every other customization it inherited.
   */
  carriedFrom?: Theme;
}

/**
 * The entitlement a document carries, or none. Identical to the persisted
 * producer's, because preview and publish read one document.
 */
function entitlementOf(
  document: TenantThemeDocumentAny
): Pick<ThemeIntent, "entitlement"> {
  return isTenantThemeDocumentV2(document)
    ? { entitlement: { plan: document.plan } }
    : {};
}

/**
 * The intent an unsaved document preview compiles under.
 *
 * Identical to the persisted producer except for the origin, and deliberately
 * so: `preview` resolves with tenant authorship exactly like `tenant-document`,
 * so a preview that paints is a publish that would have been admitted. The one
 * thing a preview must never be is a cheaper path with fewer laws on it.
 */
export function previewThemeIntent(input: PreviewThemeIntentInput): ThemeIntent {
  return previewThemeAdmission(input).intent;
}

/**
 * The preview admission, with the same report the persisted door emits.
 *
 * Preview and publish share the admission for the same reason they share the
 * patch: an editor that showed a tenant a different "not lit" list from the one
 * publish records would be a second answer about the same document.
 */
export function previewThemeAdmission(
  input: PreviewThemeIntentInput
): { intent: ThemeIntent; admission: DocumentAdmission } {
  const admission = admitDocument({
    vertical: input.vertical,
    document: input.document,
    ranges: input.ranges,
  });
  return {
    intent: {
      vertical: input.vertical,
      slug: input.slug,
      origin: "preview",
      patch: admission.patch,
      ...entitlementOf(input.document),
      ledger: admission.ledger,
    },
    admission,
  };
}

/**
 * The intent an unsaved FlatTheme draft compiles under.
 *
 * The authoring surfaces edit a `FlatTheme`, not a document, so their draft
 * reaches the same door through the draft projection rather than the v1
 * migration. Same origin, same authorship, same admission.
 *
 * It carries the ledger its own door captured, for the same reason the document
 * doors do: a draft states a decision and the leaf that decision expands into at
 * the same level, so without the record the expansion reads as raw authorship
 * and is measured against a ceiling its selection was already cleared past.
 *
 * The vertical goes to the ledger too, because a draft restates values it never
 * touched: only the baseline it was opened on separates a chrome leaf the
 * editor moved from the product's own ink carried along with it.
 *
 * That baseline is computed ONCE here -- `carriedFrom`, or the vertical's own --
 * and travels on the intent, so the station that prunes the patch and the
 * station that resolves the theme cannot disagree about what this draft is a
 * patch OF. A leaf equal to the carried baseline is not authorship and is still
 * in the compiled theme; a leaf the editor moved is authorship and moves.
 */
/**
 * The draft as a governed Theme, lifting the superseded flat transport.
 *
 * A REGISTERED MIGRATION (WO-DER-08), named here so the rename of a serialized
 * boundary is never incidental. The studio's own callers are on the governed
 * Theme; what still arrives flat is test and fixture material, which lifts
 * through the intake's own `liftAuthoredTheme` and therefore compiles the same
 * intent it always did.
 *
 * THE DISCRIMINATOR IS THE GOVERNED WRAPPER, and the first one written here was
 * wrong in a way worth recording: it tested for an `appearance` block, which a
 * lifted Theme does not carry at all, so every governed draft took the flat arm
 * and was lifted twice. The suites stayed green because the second lift is
 * near-idempotent -- a silent wrong arm that happens to work.
 *
 * `liftAuthoredTheme` ALWAYS wraps `motion` as `{ value, disposition }`, even
 * when the draft authored none. A flat draft's `motion` is the raw value and
 * never carries `disposition`. That is a structural difference the lift itself
 * guarantees, not a heuristic.
 */
function governedDraft(draft: Theme | FlatTheme): Theme {
  const motion: unknown = (draft as { motion?: unknown }).motion;
  const governed =
    typeof motion === "object" && motion !== null && "disposition" in motion;
  return governed ? (draft as Theme) : liftAuthoredTheme(draft as FlatTheme);
}

export function draftPreviewThemeIntent(
  input: DraftPreviewThemeIntentInput
): ThemeIntent {
  const carriedFrom =
    input.carriedFrom ?? baselineFor(input.vertical, input.slug);
  // ONE projection, at the door. Everything below reads the same flat view the
  // flat draft used to arrive as, so this move changes the transport's TYPE and
  // nothing about what the door decides.
  const draft = readGovernedTheme(governedDraft(input.draft));
  return {
    vertical: input.vertical,
    slug: input.slug,
    origin: "preview",
    // The patch is the draft MINUS what it carries: a leaf equal to the
    // baseline is the vertical's own, and presenting it as tenant authorship
    // moved the tenant posture floors the compile door never sees.
    patch: movedThemePatch(authoredThemePatch(draft), carriedFrom),
    ledger: draftProvenanceLedger(draft, input.vertical, { carriedFrom }),
    // The SAME baseline the prune measured against, handed down: what the draft
    // carried is carried by the compiled theme too, not re-derived from the
    // preset by the next station.
    baseline: carriedFrom,
  };
}

/**
 * The governed `Theme` a studio draft compiles as (WO-DER-08).
 *
 * WHY THE INGRESS OWNS THESE. The draft has to BE a governed Theme, and building
 * one means calling the lowering's wrap-only lift -- which
 * `tests/architecture/theme-lowering-single-door` confines to
 * `src/infrastructure/compilers/` and `src/entrypoints/` by name. The first
 * attempt put them beside the tenant authoring configuration, which is
 * `infrastructure/runtime/` and therefore outside the law; the gate said so.
 * They belong here anyway: this module is the draft's ingress, and a draft
 * constructor is ingress, not authoring configuration.
 *
 * The studio imports these and never the lift, which is exactly what the law is
 * written to keep true.
 */
export function draftTenantTheme(draft: {
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
}): Theme {
  return liftAuthoredTheme({
    id: draft.slug,
    name: draft.name,
    palette: {
      primaryColor: draft.primaryColor,
      ...(draft.secondaryColor ? { secondaryColor: draft.secondaryColor } : {}),
    },
  });
}

/** Lift an already-flat authored draft into the governed Theme the door takes. */
export function governedTenantTheme(flat: FlatTheme): Theme {
  return liftAuthoredTheme(flat);
}
