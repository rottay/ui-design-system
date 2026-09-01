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

export { Dropdown } from '../overlay/dropdown';
export type { DropdownMenuItem } from '../overlay/dropdown';
export { Empty } from '../display/empty';
export {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from '../feedback/modal';
export { MODAL_DEFAULTS, PADDING_MAP as MODAL_PADDING_MAP } from '../feedback/modal';
export type {
  ModalBodyProps,
  ModalButtonConfig,
  ModalCloseButtonProps,
  ModalConfirmProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalPlacement,
  ModalProps,
  ModalSize,
} from '../feedback/modal';
export { Progress } from '../feedback/progress';
export { Tag } from '../display/tag';
export { Tooltip } from '../display/tooltip';

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
export { default as ModernTooltip } from '../display/tooltip/engines/modern';

/**
 * Modern-locked checkbox anatomy.
 *
 * Transfer renders the Modern Checkbox synchronously inside its own Modern
 * engine. Publishing that reviewed anatomy here preserves the existing render
 * contract without reaching sideways into `inputs/Checkbox`'s private engine
 * tree and without introducing a lazy engine boundary inside every row.
 */
export { default as ModernCheckbox } from '../inputs/checkbox/engines/modern';

/**
 * Modern-locked button anatomy for Modern primitive composition.
 *
 * Exporting the engine-switched Button here would make the facade and
 * `Button.Icon` mutually import one another (the icon compound legitimately
 * resolves ModernTooltip through this facade). Modern overlay engines instead
 * compose the same Modern Button implementation directly through this reviewed
 * boundary, preserving its rendered anatomy without a facade cycle.
 */
export { default as ModernButton } from '../inputs/button/engines/modern';
