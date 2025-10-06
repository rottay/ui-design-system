import { Meta, StoryObj } from '@storybook/react';
import { Tour } from './Tour';

declare const meta: Meta<typeof Tour>;
export default meta;
type Story = StoryObj<typeof Tour>;
/**
 * Basic tour component with simple steps.
 * Use for introducing new features or onboarding users.
 */
export declare const Basic: Story;
/**
 * Tour with different types: default and primary.
 * Primary type uses brand color for emphasis.
 */
export declare const Types: Story;
/**
 * Tour without mask overlay.
 * Use when you want less visual prominence or allow interaction.
 */
export declare const WithoutMask: Story;
/**
 * Custom mask styling for branded experience.
 * Adjust mask opacity and color to match your design.
 */
export declare const CustomMask: Story;
/**
 * Tour with custom placement for each step.
 * Control where tooltips appear relative to target elements.
 */
export declare const CustomPlacements: Story;
/**
 * Tour with rich content including images and formatted text.
 * Use for more detailed explanations or visual guides.
 */
export declare const RichContent: Story;
/**
 * Indicators to show tour progress.
 * Helps users understand how many steps remain.
 */
export declare const WithIndicators: Story;
/**
 * Application walkthrough tour.
 * Real-world example of onboarding new users to an app.
 */
export declare const ApplicationWalkthrough: Story;
/**
 * Scrollable content tour.
 * Tour that works with scrolling to reveal elements.
 */
export declare const ScrollableTour: Story;
/**
 * Tour with callbacks for tracking progress.
 * Use to monitor user interaction with the tour.
 */
export declare const WithCallbacks: Story;
/**
 * Non-modal tour that allows interaction.
 * Users can interact with the page while the tour is active.
 */
export declare const NonModal: Story;
//# sourceMappingURL=Tour.stories.d.ts.map