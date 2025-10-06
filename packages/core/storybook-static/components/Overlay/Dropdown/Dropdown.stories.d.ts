import { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';

declare const meta: Meta<typeof Dropdown>;
export default meta;
type Story = StoryObj<typeof Dropdown>;
/**
 * Basic dropdown with a simple menu.
 * Use this when you need a simple action menu triggered by a button.
 */
export declare const Basic: Story;
/**
 * Dropdown with icon-enhanced menu items.
 * Use this for better visual hierarchy and quick recognition.
 */
export declare const WithIcons: Story;
/**
 * Dropdown using the Dropdown.Button component.
 * Provides a split button with primary action and dropdown menu.
 */
export declare const WithDropdownButton: Story;
/**
 * Different placement options for the dropdown menu.
 * Choose the placement that best fits your layout.
 */
export declare const Placements: Story;
/**
 * Different trigger methods: click, hover, or context menu.
 * Choose based on user interaction patterns.
 */
export declare const Triggers: Story;
/**
 * Nested dropdown menus for hierarchical actions.
 * Use sparingly as deep nesting can harm usability.
 */
export declare const NestedMenus: Story;
/**
 * Dropdown with disabled menu items.
 * Use to show unavailable actions while maintaining context.
 */
export declare const DisabledItems: Story;
/**
 * Dropdown menu with descriptions for complex actions.
 * Helps users understand what each option does.
 */
export declare const WithDescriptions: Story;
/**
 * Context menu pattern with comprehensive actions.
 * Ideal for table rows or card items.
 */
export declare const ContextMenu: Story;
/**
 * Dropdown menu with custom content beyond standard menu items.
 * Use for richer interactions but keep it lightweight.
 */
export declare const CustomContent: Story;
/**
 * Controlled dropdown for programmatic control.
 * Use when you need to control the visibility externally.
 */
export declare const Controlled: Story;
//# sourceMappingURL=Dropdown.stories.d.ts.map