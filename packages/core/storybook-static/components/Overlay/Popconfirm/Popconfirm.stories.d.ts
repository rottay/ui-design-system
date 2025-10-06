import { Meta, StoryObj } from '@storybook/react';
import { Popconfirm } from './Popconfirm';

declare const meta: Meta<typeof Popconfirm>;
export default meta;
type Story = StoryObj<typeof Popconfirm>;
/**
 * Basic confirmation popover.
 * Use for simple yes/no confirmations before destructive actions.
 */
export declare const Basic: Story;
/**
 * Different placements for the confirmation popup.
 * Choose placement based on available space and UI layout.
 */
export declare const Placements: Story;
/**
 * Custom button text and types.
 * Customize the OK and Cancel button appearance.
 */
export declare const CustomButtons: Story;
/**
 * Custom icons for different confirmation types.
 * Use appropriate icons to communicate the action severity.
 */
export declare const CustomIcons: Story;
/**
 * Popconfirm without icon.
 * Clean, minimal confirmation style.
 */
export declare const WithoutIcon: Story;
/**
 * Async confirmation with loading state.
 * Use when confirmation triggers an API call or async operation.
 */
export declare const AsyncConfirmation: Story;
/**
 * Conditional trigger for Popconfirm.
 * Show confirmation only under certain conditions.
 */
export declare const ConditionalTrigger: Story;
/**
 * Delete confirmation pattern.
 * Common pattern for delete operations.
 */
export declare const DeletePattern: Story;
/**
 * Batch action confirmation.
 * Confirm bulk operations on multiple items.
 */
export declare const BatchActionPattern: Story;
/**
 * Status change confirmation.
 * Confirm before changing important status values.
 */
export declare const StatusChangePattern: Story;
/**
 * Logout confirmation pattern.
 * Confirm before logging out or ending session.
 */
export declare const LogoutPattern: Story;
/**
 * Unsaved changes confirmation.
 * Warn before discarding unsaved changes.
 */
export declare const UnsavedChangesPattern: Story;
/**
 * Payment/Purchase confirmation.
 * High-stakes confirmation for financial actions.
 */
export declare const PaymentConfirmation: Story;
/**
 * Controlled Popconfirm.
 * Programmatic control over popup visibility.
 */
export declare const Controlled: Story;
/**
 * With description for more context.
 * Add detailed description to help users make informed decisions.
 */
export declare const WithDescription: Story;
//# sourceMappingURL=Popconfirm.stories.d.ts.map