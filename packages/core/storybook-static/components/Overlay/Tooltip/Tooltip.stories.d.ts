import { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

declare const meta: Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof Tooltip>;
/**
 * Basic tooltip that appears on hover.
 * Use for providing additional context or help text.
 */
export declare const Basic: Story;
/**
 * All 12 placement options for tooltips.
 * Choose the placement that best fits your layout and prevents overflow.
 */
export declare const Placements: Story;
/**
 * Tooltips with different colored backgrounds.
 * Use colors to indicate status or category.
 */
export declare const Colors: Story;
/**
 * Different trigger methods for showing tooltips.
 * Choose based on the user interaction pattern you need.
 */
export declare const Triggers: Story;
/**
 * Control tooltip arrow visibility.
 * Hiding the arrow can create a cleaner look for certain designs.
 */
export declare const ArrowVariations: Story;
/**
 * Tooltips with rich, multiline content.
 * Use for more detailed explanations or help text.
 */
export declare const RichContent: Story;
/**
 * Tooltips on different types of elements.
 * Tooltips work with any HTML element, not just buttons.
 */
export declare const DifferentElements: Story;
/**
 * Status tooltips with semantic colors and icons.
 * Use to indicate validation states or status information.
 */
export declare const StatusTooltips: Story;
/**
 * Controlled tooltip visibility.
 * Use when you need programmatic control over tooltip display.
 */
export declare const Controlled: Story;
/**
 * Tooltip with custom delay timing.
 * Adjust delays to prevent tooltips from appearing too quickly or slowly.
 */
export declare const CustomDelay: Story;
/**
 * Tooltip with custom overlay styling.
 * Use to match your brand or design requirements.
 */
export declare const CustomStyling: Story;
/**
 * Real-world example: Form field helpers.
 * Common pattern for providing contextual help in forms.
 */
export declare const FormFieldHelpers: Story;
/**
 * Long content tooltip with text wrapping.
 * For detailed explanations that need more space.
 */
export declare const LongContent: Story;
/**
 * Disabled state handling.
 * Show tooltips even when the wrapped element is disabled.
 */
export declare const DisabledElement: Story;
//# sourceMappingURL=Tooltip.stories.d.ts.map