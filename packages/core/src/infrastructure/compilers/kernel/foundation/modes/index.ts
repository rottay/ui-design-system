/**
 * @fileoverview The default-mode law: which mode a theme, a vertical and a
 * tenant document are compiled, emitted and mounted for.
 *
 * ONE READER, ONE ANSWER. This question used to be answered by thirteen
 * independent light-by-default expressions spread across the ingress, the
 * lowering, the artifact terminal, the SSR projection and the studio. Light
 * was equated with "the body", so on the one vertical whose baseline IS dark
 * every one of them was wrong at the same time and in a different place: the
 * seeds landed in a mode nobody renders, the artifact declared
 * `color-scheme: dark` while the mount stamped `data-theme="light"`, and the
 * preview repainted a canvas the publish would never write.
 *
 * The roster is read FIRST. A vertical's baseline declares the mode its own
 * values are, and that declaration is this module's only source of truth. The
 * remainder -- a theme with no identity the roster knows and no declaration of
 * its own -- resolves to the roster's own `UNDECLARED_VERTICAL_DEFAULT_MODE`,
 * which is the single literal statement of a default mode in the package.
 *
 * @module Compilers/Kernel/Foundation/Modes
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandTheme,
  BrandThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import {
  UNDECLARED_VERTICAL_DEFAULT_MODE,
  getFirstPartyVertical,
} from "@/foundation/presets/verticals/roster";

/** The tenant's declared intent. `auto` selects no mode; it defers to the viewer. */
export type DeclaredThemeMode = BrandThemeMode | "auto";

/** The mode a first-party vertical's baseline values ARE, read from the roster. */
export function verticalDefaultMode(
  vertical: string | undefined
): BrandThemeMode {
  const entry = vertical === undefined ? undefined : getFirstPartyVertical(vertical);
  return entry ? entry.defaultMode : UNDECLARED_VERTICAL_DEFAULT_MODE;
}

/**
 * The mode a Theme's base block IS.
 *
 * A theme states this itself. When it does not, its identity still can: a
 * resolved baseline carries the vertical's own slug, so the roster answers
 * before the literal does.
 */
export function themeDefaultMode(
  theme: Pick<BrandTheme, "appearance"> & { readonly id?: string }
): BrandThemeMode {
  return theme.appearance?.defaultMode ?? verticalDefaultMode(theme.id);
}

/**
 * THE RULE: the mode a document renders, given the mode its baseline IS.
 *
 * A document selects a mode or it does not. `auto` is not a selection -- it
 * hands the choice to the viewer -- so under `auto`, and under no selection at
 * all, the document renders the canvas its vertical already declares.
 */
export function renderedMode(
  defaultMode: BrandThemeMode,
  selection: DeclaredThemeMode | undefined
): BrandThemeMode {
  return selection === "light" || selection === "dark" ? selection : defaultMode;
}

/**
 * The background-mode selection, in the one shape every transport normalizes
 * to. A v1 simple document's `appearance` and an advanced document's
 * `visualFoundation` both reach the terminal as this.
 */
export interface DocumentModeDeclaration {
  readonly general?: {
    readonly palette?: { readonly backgroundMode?: DeclaredThemeMode };
  };
}

/** The declared selection a document carries, or nothing. */
export function documentModeSelection(
  document: DocumentModeDeclaration | undefined
): DeclaredThemeMode | undefined {
  return document?.general?.palette?.backgroundMode;
}

/** THE RULE over the roster: the mode this document renders on this vertical. */
export function resolveDocumentMode(
  vertical: string | undefined,
  document: DocumentModeDeclaration | undefined
): BrandThemeMode {
  return renderedMode(
    verticalDefaultMode(vertical),
    documentModeSelection(document)
  );
}

/**
 * The declared INTENT, `auto` preserved.
 *
 * The mount stamps this as `data-tenant-theme-mode` so the pre-paint script
 * can refine `auto` against the viewer's preference; it is never the mode the
 * server paints, which is {@link resolveDocumentMode}.
 */
export function declaredDocumentMode(
  vertical: string | undefined,
  document: DocumentModeDeclaration | undefined
): DeclaredThemeMode {
  return documentModeSelection(document) ?? verticalDefaultMode(vertical);
}
