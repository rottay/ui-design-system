/**
 * @fileoverview Component Token Hooks - Rottay Design System
 * @description React hooks for generating component-specific styling tokens.
 * Each hook provides context-aware, engine-agnostic token generation.
 *
 * @remarks
 * Component hooks follow a consistent pattern:
 *
 * - **Input**: Component props (variant, size, state flags)
 * - **Output**: CSS custom properties + slot-specific styles
 * - **Usage**: Wrap underlying engine component with `.ds-*` classes
 *
 * @example Using component token hooks
 * ```tsx
 * // In an engine implementation
 * function CollapseClassic(props: CollapseProps) {
 *   const { rootStyle, classNames, getSlotStyle } = useCollapseTokens(props);
 *
 *   return (
 *     <div className={classNames.root} style={rootStyle}>
 *       <AntCollapse {...props} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @status active (useCollapseTokens consumed by Collapse)
 * @module System/Hooks/Components
 * @category System
 * @package @rottay/design-system
 */

// Collapse tokens hook -- the first component-level token hook.
// Each hook translates component props into CSS custom properties that
// engines (classic, modern, rustic) consume for styling, keeping the
// engine layer thin and the token logic centralized.
export { useCollapseTokens, type UseCollapseTokensOptions, type UseCollapseTokensResult } from './useCollapseTokens';

// Future component hooks will follow the same pattern:
// export { useButtonTokens } from './useButtonTokens';
// export { useCardTokens } from './useCardTokens';
// export { useInputTokens } from './useInputTokens';
