'use client';

/**
 * @fileoverview Result Component - Rottay Design System
 * @description A feedback component for displaying operation outcomes and status pages.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Result component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - result styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * **Use Cases:**
 * - Success confirmations (purchases, submissions, sign-ups)
 * - Error messages (form failures, API errors)
 * - HTTP status pages (404, 403, 500)
 * - Information and warning notifications
 * - Empty states with call-to-action
 *
 * @example Basic Usage
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <Result
 *       status="success"
 *       title="Payment Successful!"
 *       subTitle="Your order has been confirmed."
 *     />
 *   );
 * }
 * ```
 *
 * @example Success Result with Actions
 * ```tsx
 * import { Result, Button } from '@rottay/design-system';
 *
 * <Result
 *   status="success"
 *   title="Successfully Purchased Cloud Server ECS!"
 *   subTitle="Order number: 2017182818828182881. Configuration takes 1-5 minutes."
 *   extra={[
 *     <Button key="console" variant="primary">Go Console</Button>,
 *     <Button key="buy">Buy Again</Button>,
 *   ]}
 * />
 * ```
 *
 * @example Error Result with Details
 * ```tsx
 * import { Result, Button } from '@rottay/design-system';
 *
 * <Result
 *   status="error"
 *   title="Submission Failed"
 *   subTitle="Please check and modify the following information before resubmitting."
 *   extra={<Button variant="primary">Try Again</Button>}
 * >
 *   <div className="error-details">
 *     <p>The content you submitted has the following errors:</p>
 *     <ul>
 *       <li>Your account has been frozen</li>
 *       <li>Your account is not yet eligible to apply</li>
 *     </ul>
 *   </div>
 * </Result>
 * ```
 *
 * @example 404 Not Found Page
 * ```tsx
 * import { Result, Button } from '@rottay/design-system';
 *
 * <Result
 *   status="404"
 *   title="404"
 *   subTitle="Sorry, the page you visited does not exist."
 *   extra={<Button variant="primary" onClick={() => navigate('/')}>Back Home</Button>}
 * />
 * ```
 *
 * @example 403 Forbidden Page
 * ```tsx
 * import { Result, Button } from '@rottay/design-system';
 *
 * <Result
 *   status="403"
 *   title="403"
 *   subTitle="Sorry, you are not authorized to access this page."
 *   extra={<Button variant="primary" onClick={() => navigate('/login')}>Login</Button>}
 * />
 * ```
 *
 * @example 500 Server Error Page
 * ```tsx
 * import { Result, Button } from '@rottay/design-system';
 *
 * <Result
 *   status="500"
 *   title="500"
 *   subTitle="Sorry, something went wrong on our end."
 *   extra={<Button variant="primary" onClick={() => location.reload()}>Refresh Page</Button>}
 * />
 * ```
 *
 * @example Custom Icon
 * ```tsx
 * import { Result, Button } from '@rottay/design-system';
 *
 * <Result
 *   icon={<span style={{ fontSize: 64 }}>🎉</span>}
 *   title="Congratulations!"
 *   subTitle="You have completed all tasks for today."
 *   extra={<Button variant="primary">Continue</Button>}
 * />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * import { ThemeProvider, Result } from '@rottay/design-system';
 *
 * // Result automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Result
 *     status="success"
 *     title="Welcome to ACME Corp!"
 *     subTitle="Your account has been created."
 *   />
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Result } from '@rottay/design-system';
 *
 * // Force a specific rendering engine
 * <Result engine="modern" status="info" title="Using DaisyUI styling">
 *   Renders with DaisyUI/Tailwind styling
 * </Result>
 * ```
 *
 * @see {@link ResultProps} for complete prop documentation
 * @see {@link ResultStatus} for available status types
 * @see {@link RESULT_DEFAULTS} for default configuration values
 * @see {@link RESULT_ICONS} for status icon mappings
 * @see {@link RESULT_COLORS} for status color mappings
 *
 * @module Result
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { ResultProps } from './Result.types';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type ResultProps,
  type ResultStatus,
  RESULT_DEFAULTS,
  RESULT_ICONS,
  RESULT_COLORS,
} from './Result.types';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Result component with multi-engine support.
 *
 * @description
 * A versatile feedback component for displaying the status of operations. Ideal for:
 * - Success confirmations after form submissions
 * - Error messages when operations fail
 * - HTTP status pages (404, 403, 500)
 * - Warning and informational messages
 * - Empty states with actions
 *
 * @remarks
 * - Supports 7 status types: success, error, info, warning, 404, 403, 500
 * - Includes appropriate icons for each status
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 * - Custom icons can override default status icons
 *
 * @param props - {@link ResultProps}
 * @returns React component displaying operation result status
 *
 * @example
 * ```tsx
 * <Result
 *   status="success"
 *   title="Operation Complete"
 *   subTitle="Your changes have been saved."
 *   extra={<Button onClick={handleContinue}>Continue</Button>}
 * />
 * ```
 */
export const Result = createEngineComponent<ResultProps>('Result', {
  /** Ant Design implementation - full-featured with native result component */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

export default Result;
