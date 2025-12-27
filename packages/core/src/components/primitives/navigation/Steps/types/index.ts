/**
 * @fileoverview Steps Component Types - Rottay Design System
 * @description Type definitions for the Steps navigation component.
 * These types support the multi-engine architecture (Titan, Hermes, Apollo)
 * and multi-tenant theming system.
 *
 * @remarks
 * The Steps types are designed to be engine-agnostic, allowing the same
 * props interface to work across all rendering engines. Each engine
 * adapts these types to its underlying implementation (Ant Design Steps,
 * DaisyUI steps, or vanilla HTML/CSS).
 *
 * @example Using StepsProps
 * ```tsx
 * import type { StepsProps, StepItem } from '@rottay/design-system';
 *
 * const items: StepItem[] = [
 *   { title: 'Step 1', description: 'Description' },
 *   { title: 'Step 2', description: 'Description' },
 * ];
 *
 * const props: StepsProps = {
 *   items,
 *   current: 0,
 *   direction: 'horizontal',
 * };
 * ```
 *
 * @example Using StepStatus
 * ```tsx
 * import type { StepStatus, StepItem } from '@rottay/design-system';
 *
 * const getStatusItem = (status: StepStatus): StepItem => ({
 *   title: 'Dynamic Step',
 *   status,
 * });
 * ```
 *
 * @see {@link StepsProps} for main component props
 * @see {@link StepItem} for individual step configuration
 * @see {@link StepStatus} for step status types
 * @see {@link ProgressDotInfo} for custom progress dot rendering
 *
 * @module Steps/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

// ============================================================================
// Status Types
// ============================================================================

/**
 * Step status for indicating completion state.
 *
 * @description
 * Defines the visual state of a step in the progress sequence.
 * Each status triggers different styling in all engines.
 *
 * @remarks
 * - `wait` - Step is pending, not yet reached
 * - `process` - Step is currently active/in progress
 * - `finish` - Step has been completed successfully
 * - `error` - Step encountered an error or validation failure
 *
 * @example
 * ```tsx
 * const status: StepStatus = 'process';
 *
 * <Steps
 *   items={[
 *     { title: 'Done', status: 'finish' },
 *     { title: 'Current', status: 'process' },
 *     { title: 'Pending', status: 'wait' },
 *   ]}
 *   current={1}
 * />
 * ```
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

// ============================================================================
// Step Item Interface
// ============================================================================

/**
 * Individual step item configuration.
 *
 * @description
 * Defines the content and state of a single step within the Steps component.
 * Each item can have its own title, description, icon, and status.
 *
 * @remarks
 * - Title is required, all other properties are optional
 * - Custom icons override the default step number display
 * - Individual status overrides the automatic status calculation
 * - Disabled steps cannot be clicked when onChange is provided
 *
 * @example Basic Step Item
 * ```tsx
 * const basicStep: StepItem = {
 *   title: 'Account Setup',
 *   description: 'Create your account credentials',
 * };
 * ```
 *
 * @example Step with All Options
 * ```tsx
 * const fullStep: StepItem = {
 *   title: 'Payment',
 *   subTitle: 'Required',
 *   description: 'Enter your payment information',
 *   icon: <CreditCardIcon />,
 *   status: 'process',
 *   disabled: false,
 * };
 * ```
 */
export interface StepItem {
  /**
   * Step title displayed prominently.
   * @required
   */
  title: ReactNode;

  /**
   * Subtitle displayed after the title.
   * Useful for additional context like "Required" or "Optional".
   */
  subTitle?: ReactNode;

  /**
   * Step description text displayed below the title.
   * Provides more detailed information about the step.
   */
  description?: ReactNode;

  /**
   * Custom icon for the step.
   * Replaces the default step number when provided.
   */
  icon?: ReactNode;

  /**
   * Status of this specific step.
   * Overrides the automatically calculated status based on current step.
   */
  status?: StepStatus;

  /**
   * Whether this step is disabled.
   * Disabled steps appear dimmed and cannot be clicked.
   */
  disabled?: boolean;
}

// ============================================================================
// Progress Dot Info Interface
// ============================================================================

/**
 * Information passed to progressDot render function.
 *
 * @description
 * When progressDot is a function, this interface describes the data
 * passed to that function for custom dot rendering.
 *
 * @remarks
 * This allows complete customization of how progress dots are rendered,
 * enabling tooltips, custom icons, or interactive elements.
 *
 * @example Custom Progress Dot
 * ```tsx
 * import type { ProgressDotInfo } from '@rottay/design-system';
 *
 * const customProgressDot = (info: ProgressDotInfo) => (
 *   <Tooltip title={`Step ${info.index + 1}: ${info.title}`}>
 *     <span className={`custom-dot ${info.status}`} />
 *   </Tooltip>
 * );
 *
 * <Steps progressDot={customProgressDot} items={items} current={1} />
 * ```
 */
export interface ProgressDotInfo {
  /**
   * Step index (0-based).
   * Use `index + 1` for human-readable step numbers.
   */
  index: number;

  /**
   * Current status of the step.
   * Useful for conditional styling.
   */
  status: StepStatus;

  /**
   * Step title.
   * Can be used in tooltips or accessibility labels.
   */
  title: ReactNode;

  /**
   * Step description.
   * Can be used in tooltips or accessibility labels.
   */
  description: ReactNode;
}

// ============================================================================
// Main Props Interface
// ============================================================================

/**
 * Props for the Steps component.
 *
 * @description
 * Complete configuration options for the Steps navigation component.
 * These props are consistent across all rendering engines.
 *
 * @remarks
 * The Steps component supports both controlled (with `current` and `onChange`)
 * and uncontrolled (with `initial`) modes of operation.
 *
 * @example Controlled Mode
 * ```tsx
 * const [current, setCurrent] = useState(0);
 *
 * <Steps
 *   items={items}
 *   current={current}
 *   onChange={setCurrent}
 * />
 * ```
 *
 * @example Uncontrolled Mode
 * ```tsx
 * <Steps items={items} initial={0} />
 * ```
 *
 * @example Full Configuration
 * ```tsx
 * <Steps
 *   items={items}
 *   current={1}
 *   direction="horizontal"
 *   labelPlacement="vertical"
 *   size="default"
 *   status="process"
 *   type="default"
 *   responsive
 *   onChange={handleChange}
 *   className="my-steps"
 *   style={{ marginTop: 24 }}
 *   engine="titan"
 * />
 * ```
 */
export interface StepsProps {
  /**
   * Current step index (0-based).
   * Used for controlled component mode.
   */
  current?: number;

  /**
   * Direction of the steps layout.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Initial step index for uncontrolled mode.
   * @default 0
   */
  initial?: number;

  /**
   * Label placement relative to the step icon.
   * Only applies when direction is horizontal.
   * @default 'horizontal'
   */
  labelPlacement?: 'horizontal' | 'vertical';

  /**
   * Percentage of current step progress (0-100).
   * Shows a progress indicator within the current step.
   */
  percent?: number;

  /**
   * Show progress dot instead of number/icon.
   * Can be a boolean or a custom render function.
   */
  progressDot?: boolean | ((info: ProgressDotInfo) => ReactNode);

  /**
   * Enable responsive behavior.
   * Automatically adjusts layout on smaller screens.
   * @default true
   */
  responsive?: boolean;

  /**
   * Size of the steps.
   * @default 'default'
   */
  size?: 'default' | 'small';

  /**
   * Overall status of the current step.
   * Applied to the step at the `current` index.
   * @default 'process'
   */
  status?: StepStatus;

  /**
   * Type/style of the steps display.
   * - `default` - Standard step progression
   * - `navigation` - Tab-like navigation style
   * - `inline` - Compact inline display
   * @default 'default'
   */
  type?: 'default' | 'navigation' | 'inline';

  /**
   * Callback when step changes.
   * Enables clickable steps for navigation.
   * @param current - The index of the clicked step
   */
  onChange?: (current: number) => void;

  /**
   * Array of step items to display.
   * @required
   */
  items: StepItem[];

  /**
   * Additional CSS class name.
   * Applied to the root element.
   */
  className?: string;

  /**
   * Inline styles.
   * Applied to the root element.
   */
  style?: CSSProperties;

  /**
   * Rendering engine override.
   * Overrides the global engine setting for this component.
   */
  engine?: 'titan' | 'hermes' | 'apollo';
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Steps props.
 *
 * @description
 * Provides sensible defaults for the Steps component.
 * Used internally by all engine implementations.
 *
 * @example Accessing Defaults
 * ```tsx
 * import { STEPS_DEFAULTS } from '@rottay/design-system';
 *
 * console.log(STEPS_DEFAULTS.direction); // 'horizontal'
 * console.log(STEPS_DEFAULTS.size); // 'default'
 * ```
 */
export const STEPS_DEFAULTS: Partial<StepsProps> = {
  /** Start at first step by default */
  current: 0,
  /** Horizontal layout by default */
  direction: 'horizontal',
  /** Initial step for uncontrolled mode */
  initial: 0,
  /** Labels beside icons by default */
  labelPlacement: 'horizontal',
  /** Enable responsive behavior */
  responsive: true,
  /** Default size variant */
  size: 'default',
  /** Current step shows as in-progress */
  status: 'process',
  /** Standard step display */
  type: 'default',
};
