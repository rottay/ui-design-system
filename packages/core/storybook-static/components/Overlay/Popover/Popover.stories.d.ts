import { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';

declare const meta: Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof Popover>;
/**
 * Basic popover with title and content.
 * Use for displaying additional information or context.
 */
export declare const Basic: Story;
/**
 * All 12 placement options for popovers.
 * Choose the placement that best fits your layout.
 */
export declare const Placements: Story;
/**
 * Different trigger methods for showing popovers.
 * Click trigger is most common for interactive popovers.
 */
export declare const Triggers: Story;
/**
 * Controlled popover for programmatic visibility control.
 * Use when you need external control over popover state.
 */
export declare const Controlled: Story;
/**
 * Popover with form content.
 * Use for quick data entry without leaving the current page.
 */
export declare const WithForm: Story;
/**
 * User profile card popover.
 * Common pattern for displaying user information.
 */
export declare const UserCard: Story;
/**
 * Notifications popover.
 * Common pattern for displaying recent notifications or alerts.
 */
export declare const Notifications: Story;
/**
 * Settings menu popover.
 * Use for quick access to configuration options.
 */
export declare const SettingsMenu: Story;
/**
 * Rich content with images and formatting.
 * Popovers can contain complex layouts and media.
 */
export declare const RichContent: Story;
/**
 * Nested popovers for hierarchical information.
 * Use sparingly as multiple layers can be confusing.
 */
export declare const NestedPopovers: Story;
/**
 * Popover with arrow variations.
 * Control arrow visibility and positioning.
 */
export declare const ArrowVariations: Story;
/**
 * Popover with custom close behavior.
 * Prevent closing on content click or customize close triggers.
 */
export declare const CustomCloseBehavior: Story;
/**
 * Help documentation popover.
 * Common pattern for providing contextual help.
 */
export declare const HelpDocumentation: Story;
/**
 * Quick actions menu.
 * Use for context-specific actions in cards or list items.
 */
export declare const QuickActions: Story;
//# sourceMappingURL=Popover.stories.d.ts.map