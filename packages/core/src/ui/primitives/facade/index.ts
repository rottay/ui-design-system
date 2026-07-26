/**
 * Cross-category composition surface for the primitives tier.
 *
 * A primitive category (`inputs`, `display`, `feedback`, `navigation`,
 * `overlay`, `layout`) never addresses another category's owner directly: a
 * category is a peer, not a dependency. When one primitive genuinely composes
 * another, it addresses that primitive here, through the tier's own declared
 * surface, and receives the engine-switched public component — so the active
 * engine, not the composing component, decides the implementation.
 *
 * This is deliberately narrow. It carries only the components that another
 * primitive composes today; it is not a second package barrel and nothing
 * outside `ui/primitives` should import it.
 */

export { Dropdown } from '../overlay/Dropdown';
export { Progress } from '../feedback/Progress';
export { Tag } from '../display/Tag';
export { Tooltip } from '../display/Tooltip';

/**
 * Modern-locked anatomy.
 *
 * `Button.Icon` renders `ModernButton` directly and is asserted against the
 * modern anatomy by contract (`Button.pass2-craft`); its tooltip must resolve
 * in the same synchronous pass, because the engine factory wraps the switched
 * component in `<Suspense>` and would otherwise gate the button itself behind
 * a lazy boundary. The modern tooltip is therefore published here as an
 * explicit, reviewed part of the tier surface instead of being reached for
 * through `display/Tooltip`'s private engine path.
 */
export { default as ModernTooltip } from '../display/Tooltip/engines/modern';
