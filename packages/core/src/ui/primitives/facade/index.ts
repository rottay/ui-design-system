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
export { Empty } from '../display/Empty';
export {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from '../feedback/Modal';
export { MODAL_DEFAULTS, PADDING_MAP as MODAL_PADDING_MAP } from '../feedback/Modal';
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
} from '../feedback/Modal';
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

/**
 * Modern-locked checkbox anatomy.
 *
 * Transfer renders the Modern Checkbox synchronously inside its own Modern
 * engine. Publishing that reviewed anatomy here preserves the existing render
 * contract without reaching sideways into `inputs/Checkbox`'s private engine
 * tree and without introducing a lazy engine boundary inside every row.
 */
export { default as ModernCheckbox } from '../inputs/Checkbox/engines/modern';

/**
 * Modern-locked button anatomy for Modern primitive composition.
 *
 * Exporting the engine-switched Button here would make the facade and
 * `Button.Icon` mutually import one another (the icon compound legitimately
 * resolves ModernTooltip through this facade). Modern overlay engines instead
 * compose the same Modern Button implementation directly through this reviewed
 * boundary, preserving its rendered anatomy without a facade cycle.
 */
export { default as ModernButton } from '../inputs/Button/engines/modern';

/** Engine-locked Modal adapters for the deprecated overlay/Modal paths. */
export { default as ClassicModal } from '../feedback/Modal/engines/classic';
export { default as ModernModal } from '../feedback/Modal/engines/modern';
export { default as RusticModal } from '../feedback/Modal/engines/rustic';
