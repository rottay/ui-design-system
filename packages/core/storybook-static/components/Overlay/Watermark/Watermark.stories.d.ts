import { Meta, StoryObj } from '@storybook/react';
import { Watermark } from './Watermark';

declare const meta: Meta<typeof Watermark>;
export default meta;
type Story = StoryObj<typeof Watermark>;
/**
 * Basic text watermark.
 * Use to add simple text overlay to your content.
 */
export declare const Basic: Story;
/**
 * Watermark with multiple lines of text.
 * Use array format to display multi-line watermarks.
 */
export declare const MultiLineText: Story;
/**
 * Image-based watermark.
 * Use your logo or custom image as a watermark.
 */
export declare const ImageWatermark: Story;
/**
 * Custom rotation angle for watermark.
 * Default is -22 degrees, adjust to your preference.
 */
export declare const CustomRotation: Story;
/**
 * Custom gap and offset for watermark density.
 * Adjust spacing between watermark repetitions.
 */
export declare const CustomGapAndOffset: Story;
/**
 * Custom font styling for text watermarks.
 * Adjust color, size, weight, and family.
 */
export declare const CustomFontStyling: Story;
/**
 * Different opacity levels.
 * Control watermark visibility to balance protection and readability.
 */
export declare const OpacityVariations: Story;
/**
 * Watermark on images.
 * Protect images from unauthorized use.
 */
export declare const OnImages: Story;
/**
 * Full page watermark.
 * Apply watermark to entire page or large sections.
 */
export declare const FullPage: Story;
/**
 * Combined text and image watermark.
 * Use both logo and text for comprehensive branding.
 */
export declare const CombinedTextAndImage: Story;
/**
 * Draft document watermark.
 * Clear indication of document status.
 */
export declare const DraftDocument: Story;
/**
 * Confidential document watermark.
 * High-visibility watermark for sensitive content.
 */
export declare const ConfidentialDocument: Story;
/**
 * Sample/Demo watermark.
 * Indicate content is for demonstration purposes.
 */
export declare const SampleWatermark: Story;
/**
 * Custom z-index for layering.
 * Control watermark position in the stacking context.
 */
export declare const CustomZIndex: Story;
/**
 * Watermark with custom height and width.
 * Control the size of each watermark instance.
 */
export declare const CustomDimensions: Story;
/**
 * Real-world use case: Legal document.
 * Complete example for legal/official documents.
 */
export declare const LegalDocument: Story;
//# sourceMappingURL=Watermark.stories.d.ts.map