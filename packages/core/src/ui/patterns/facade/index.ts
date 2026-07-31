/**
 * Cross-group composition surface for the patterns tier.
 *
 * A pattern group (`data`, `forms`, `shell`, ...) never addresses another
 * group's owner directly: a group is a peer, not a dependency. When one
 * pattern genuinely composes another, it addresses that pattern here, through
 * the tier's own declared surface, and receives the engine-switched public
 * component.
 *
 * This is deliberately narrow. It carries only the patterns that another
 * pattern composes today; it is not a second package barrel and nothing
 * outside `ui/patterns` should import it.
 */

export { PatternFilterPanel } from '../forms/filter-panel';
export type { FilterPanelProps } from '../forms/filter-panel';

/**
 * Modern-locked empty-state anatomy.
 *
 * Modern pattern engines use this synchronous implementation where their
 * contract already pins Modern anatomy. The tier facade is the reviewed
 * cross-group boundary; consumers never address the feedback group's private
 * engine path directly.
 */
export { default as ModernEmptyState } from '../feedback/empty-state/engines/modern';
