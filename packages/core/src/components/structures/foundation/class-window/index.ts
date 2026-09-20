/**
 * The class migration window — the sibling mechanism of the channel window.
 *
 * A channel window is a READ arm: `var(--ds-shell-x, var(--ds-app-shell-x))`
 * lets one declaration serve both spellings, so nothing is emitted twice. A
 * class cannot do that — a class is either stamped on the element or it is
 * not — so the class window is an EMISSION arm instead: the component stamps
 * the canonical `ds-` spelling BESIDE the superseded one on the same element,
 * and the skin selects the pair through `:is()`, whose specificity is that of
 * its most specific argument and therefore byte-equal to the single class it
 * replaces.
 *
 * The window is class ADDITION only. No superseded class is ever removed
 * while its window is open, so a consumer pinned to a DS version that never
 * emitted the canonical spelling keeps every selector it authored.
 *
 * WHY IT EXISTS. `ds-app-shell` and `ds-action-dock__*` are absent from every
 * published DS version the apps pin, so no app can migrate its CSS before the
 * DS ships the canonical class. The window is what makes the app-side lot
 * possible at the next bump; its end trigger closes it.
 *
 * HOW IT CLOSES. `tests/index.test.ts` reads the rostered consumer files in
 * the sibling repositories. While any of them still authors a superseded
 * class the drill is green and the window stays open; when the last one
 * migrates the drill turns RED with the closure instruction, which is the
 * only signal that cannot be forgotten. A rostered file that is missing — or
 * a repository that is not checked out — reads ABSENT and keeps the window
 * open rather than being mistaken for a migration.
 */

/** One family's declared window: the superseded spelling and its canonical twin. */
export interface ClassMigrationWindow {
  /** The family id the `family-cut` roster knows this owner by. */
  readonly family: string;
  /** The work order that owns the window and must close it. */
  readonly cut: string;
  /** `superseded class` -> `canonical class`. */
  readonly pairs: Readonly<Record<string, string>>;
}

/**
 * Every open class window in the package, read from this source by
 * `scripts/check/family-cut` so a class vocabulary that is NOT declared here
 * still counts against its family.
 */
export const CLASS_MIGRATION_WINDOWS = [
  {
    family: 'app-shell',
    cut: 'WO-FAM-11',
    pairs: {
      'rottay-app-shell': 'ds-app-shell',
      'rottay-app-shell__skip-link': 'ds-app-shell__skip-link',
      'rottay-app-shell__navigation-sidebar': 'ds-app-shell__navigation-sidebar',
      'rottay-app-shell__navigation-logo': 'ds-app-shell__navigation-logo',
      'rottay-app-shell__navigation-body': 'ds-app-shell__navigation-body',
      'rottay-app-shell__navigation-footer': 'ds-app-shell__navigation-footer',
      'rottay-app-shell__navigation-drawer': 'ds-app-shell__navigation-drawer',
      'rottay-app-shell__navigation-drawer-body': 'ds-app-shell__navigation-drawer-body',
      'rottay-app-shell__navigation-drawer-header': 'ds-app-shell__navigation-drawer-header',
      'rottay-app-shell__navigation-drawer-logo': 'ds-app-shell__navigation-drawer-logo',
      'rottay-app-shell__navigation-close': 'ds-app-shell__navigation-close',
      'rottay-app-shell__navigation-trigger': 'ds-app-shell__navigation-trigger',
      'rottay-app-shell__main': 'ds-app-shell__main',
      'rottay-app-shell__header': 'ds-app-shell__header',
      'rottay-app-shell__header-slot': 'ds-app-shell__header-slot',
      'rottay-app-shell__header-slot--center': 'ds-app-shell__header-slot--center',
      'rottay-app-shell__header-slot--right': 'ds-app-shell__header-slot--right',
      'rottay-app-shell__content': 'ds-app-shell__content',
      'rottay-app-shell__footer': 'ds-app-shell__footer',
    },
  },
  {
    family: 'action-dock',
    cut: 'WO-FAM-11',
    pairs: {
      'rottay-action-dock': 'ds-action-dock',
      'rottay-action-dock__actions': 'ds-action-dock__actions',
      'rottay-action-dock__action': 'ds-action-dock__action',
      'rottay-action-dock__overflow': 'ds-action-dock__overflow',
      'rottay-action-dock__overflow-trigger': 'ds-action-dock__overflow-trigger',
    },
  },
] as const satisfies readonly ClassMigrationWindow[];

type Windows = typeof CLASS_MIGRATION_WINDOWS;
type WindowFor<F extends Windows[number]['family']> = Extract<Windows[number], { family: F }>;

/** The value a `className` takes while a window is open: canonical, then superseded. */
type PairedClasses<P> = { readonly [K in keyof P]: string };

function pairedClasses<P extends Readonly<Record<string, string>>>(pairs: P): PairedClasses<P> {
  const paired: Record<string, string> = {};
  for (const [superseded, canonical] of Object.entries(pairs)) {
    paired[superseded] = `${canonical} ${superseded}`;
  }
  return paired as PairedClasses<P>;
}

function windowFor<F extends Windows[number]['family']>(family: F): WindowFor<F> {
  const found = CLASS_MIGRATION_WINDOWS.find((entry) => entry.family === family);
  if (!found) throw new Error(`class-window: no declared window for "${family}"`);
  return found as WindowFor<F>;
}

/**
 * Keyed by the SUPERSEDED spelling on purpose: the call site still reads the
 * class the estate knows, and the declaration alone decides what is stamped
 * beside it, so the component and the window cannot drift apart.
 */
export const APP_SHELL_CLASSES = pairedClasses(windowFor('app-shell').pairs);

/** The dock's paired spellings; see `APP_SHELL_CLASSES` for the keying. */
export const ACTION_DOCK_CLASSES = pairedClasses(windowFor('action-dock').pairs);
