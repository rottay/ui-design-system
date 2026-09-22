/**
 * @fileoverview The preview ingress: an unsaved tenant customization.
 *
 * @module Compilers/Theme/Ingress/Presentation/Preview
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  isTenantThemeDocumentVersioned,
  type TenantThemeDocumentAny,
} from "@/contracts/theme/presentation/document";
import type { ThemeStyleReference } from "@/contracts/theme/runtime/styles";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeVerticalEnvelope } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  admitDocument,
  baselineFor,
  styleThemePatch,
  type DocumentAdmission,
} from "../../runtime/document-v2";
import { authoredThemePatch } from "../../foundation/draft-patch";
import { movedThemePatch } from "../../foundation/authorship";
import {
  draftProvenanceLedger,
  draftStyleClaim,
} from "../../foundation/provenance";
import { liftAuthoredTheme, readGovernedTheme } from "../../../lowering/foundation/intake";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  isGovernedActive,
  mergeThemePatches,
  type Governed,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { resolveThemeStyle } from "@/contracts/theme/runtime/styles";

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
  /**
   * The style the tenant this draft belongs to has selected.
   *
   * Without it the door has nothing to resolve from, and a draft opened over a
   * style-bearing tenant measures every style leaf against a baseline that does
   * not contain the style: every one of them enters the patch as tenant
   * authorship and the studio reports the style's ink as the editor's. It is
   * ignored when `carriedFrom` is supplied, because then the caller has already
   * said what the draft is a patch of.
   */
  style?: ThemeStyleReference;
}

/**
 * The entitlement a document carries, or none. Identical to the persisted
 * producer's, because preview and publish read one document.
 */
function entitlementOf(
  document: TenantThemeDocumentAny
): Pick<ThemeIntent, "entitlement"> {
  return isTenantThemeDocumentVersioned(document)
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
 * THIS IS THE ONE DISCRIMINANT. The compile door below and the studio's file
 * import both route through it, so there is no second, export-local reader that
 * could disagree with this one about what a serialized draft IS.
 *
 * THE DISCRIMINATOR IS THE GOVERNED WRAPPER, and the first one written here was
 * wrong in a way worth recording: it tested for an `appearance` block, which a
 * lifted Theme does not carry at all, so every governed draft took the flat arm
 * and was lifted twice. The suites stayed green because the second lift is
 * near-idempotent -- a silent wrong arm that happens to work.
 *
 * The discriminant is the wrapper's key vocabulary (`value` / `disposition`), which
 * serialization preserves; mixed or foreign-keyed families are refused by name.
 */
const GOVERNED_FAMILIES = [
  "motion",
  "charts",
  "recipes",
  "expressive",
  "responsive",
] as const;

const WRAPPER_KEYS: ReadonlySet<string> = new Set(["value", "disposition"]);

type FamilyShape = "absent" | "wrapped" | "flat";

function familyShape(slot: unknown): FamilyShape {
  if (slot === undefined) return "absent";
  if (typeof slot !== "object" || slot === null || Array.isArray(slot)) {
    return "flat";
  }
  const keys = Object.keys(slot);
  if (!keys.some((key) => WRAPPER_KEYS.has(key))) {
    return keys.length === 0 ? "absent" : "flat";
  }
  return keys.every((key) => WRAPPER_KEYS.has(key)) ? "wrapped" : "flat";
}

export function readThemeDraft(
  draft: Theme | FlatTheme,
  projectedFrom?: Theme
): Theme {
  const shapes = GOVERNED_FAMILIES.map((family) => ({
    family,
    shape: familyShape((draft as unknown as Record<string, unknown>)[family]),
  }));
  const wrapped = shapes.filter(({ shape }) => shape === "wrapped");
  if (wrapped.length === 0) {
    return carryDispositions(liftAuthoredTheme(draft as FlatTheme), projectedFrom);
  }
  const unwrapped = shapes.filter(({ shape }) => shape === "flat");
  if (unwrapped.length > 0) {
    throw new Error(
      `readThemeDraft: draft mixes governed families (${wrapped
        .map(({ family }) => family)
        .join(", ")}) with unwrapped ones (${unwrapped
        .map(({ family }) => family)
        .join(", ")}); a draft is either a governed Theme or a FlatTheme`
    );
  }
  return draft as Theme;
}

/**
 * Restore the dispositions {@link projectThemeDraft} could not carry.
 *
 * The projection states WHETHER a family is active, never WHY it is not: an
 * inactive family leaves the flat view (and `charts` leaves it as `{}`), so a
 * naive re-lift republishes every withheld family as `not-authored` and loses
 * the reason the theme actually gave. An editor that round-trips a draft it did
 * not author must not rewrite that reason, so a family the view never carried
 * keeps the slot it came in with.
 *
 * A family the VIEW carries is authorship and outranks the carry: the first
 * edit to a family the incoming draft had not authored is exactly the case an
 * editor exists to serve, so the guard is on the LIFTED slot, not only on the
 * source one. Guarding on the source alone made every governed section of the
 * studio inert for a draft that had not already activated it.
 */
function carryDispositions(lifted: Theme, projectedFrom?: Theme): Theme {
  if (!projectedFrom) return lifted;
  const out = lifted as unknown as Record<string, unknown>;
  const source = projectedFrom as unknown as Record<string, unknown>;
  for (const family of GOVERNED_FAMILIES) {
    const slot = source[family];
    if (familyShape(slot) !== "wrapped") continue;
    if (isGovernedActive(slot as Governed<unknown>)) continue;
    if (liftedFromAuthorship(out[family])) continue;
    out[family] = { ...(slot as Governed<unknown>) };
  }
  return lifted;
}

/**
 * True when the re-lifted slot came from something the view actually carried.
 *
 * `charts` unwraps to `{}` even when it is withheld, so an empty container is
 * the projection's own filler and never authorship; every other family is
 * simply absent from the view when withheld and lifts to `not-authored`.
 */
function liftedFromAuthorship(slot: unknown): boolean {
  if (familyShape(slot) !== "wrapped") return false;
  const governed = slot as Governed<unknown>;
  if (!isGovernedActive(governed)) return false;
  const value = governed.value;
  if (value === undefined) return false;
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return Object.keys(value).length > 0;
  }
  return true;
}

/**
 * The flat view of a governed draft, for a caller that reads leaves rather than
 * transporting them. It is the intake's own projection, so a component never
 * has to name the lowering's lift to describe the draft it is editing.
 */
export function projectThemeDraft(draft: Theme): FlatTheme {
  return readGovernedTheme(draft);
}

export function draftPreviewThemeIntent(
  input: DraftPreviewThemeIntentInput
): ThemeIntent {
  // The baseline the draft is a patch OF, composed in THEME space. It is not
  // the underlay: that writes v1 document keypaths and a `carriedFrom` is a
  // Theme. The style's patch comes from the same projection and the same
  // `documentThemePatch` the compile door runs, so the draft measures against
  // exactly the baseline publishing it will produce.
  const carriedFrom =
    input.carriedFrom ?? composedBaseline(input.vertical, input.slug, input.style);
  // ONE projection, at the door. Everything below reads the same flat view the
  // flat draft used to arrive as, so this move changes the transport's TYPE and
  // nothing about what the door decides.
  const draft = readGovernedTheme(readThemeDraft(input.draft));
  const styleClaim = input.style
    ? draftStyleClaim({
        ref: input.style,
        decisions: resolveThemeStyle(input.style).document.decisions as Record<
          string,
          unknown
        >,
        draft,
      })
    : undefined;
  return {
    vertical: input.vertical,
    slug: input.slug,
    origin: "preview",
    // The patch is the draft MINUS what it carries: a leaf equal to the
    // baseline is the vertical's own, and presenting it as tenant authorship
    // moved the tenant posture floors the compile door never sees.
    patch: movedThemePatch(authoredThemePatch(draft), carriedFrom),
    ledger: draftProvenanceLedger(draft, input.vertical, {
      carriedFrom,
      styleClaim,
    }),
    // The SAME baseline the prune measured against, handed down: what the draft
    // carried is carried by the compiled theme too, not re-derived from the
    // preset by the next station.
    baseline: carriedFrom,
  };
}

/**
 * The vertical's baseline with the style the tenant selected composed onto it.
 *
 * A style-bearing tenant's draft is a patch of the vertical PLUS its style, and
 * the two are composed here rather than carried: `carriedFrom` is what the
 * prune measures against and what the intent hands down as `baseline`, so a
 * baseline missing the style turns every inherited leaf into tenant authorship.
 * The plan is `pro` because a plan limits EDITING, never inheritance, and this
 * composition is not an edit.
 */
function composedBaseline(
  vertical: FirstPartyVerticalId,
  slug: string,
  style: ThemeStyleReference | undefined
): Theme {
  const baseline = baselineFor(vertical, slug);
  if (style === undefined) return baseline;
  return mergeThemePatches(
    baseline,
    styleThemePatch({ vertical, plan: "pro", style })
  );
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
