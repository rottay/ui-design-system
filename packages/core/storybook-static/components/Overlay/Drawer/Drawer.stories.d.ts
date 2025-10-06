import { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';

declare const meta: Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof Drawer>;
/**
 * Basic drawer that slides in from the right.
 * Most common pattern for detail views and forms.
 */
export declare const Basic: Story;
/**
 * Drawers can slide in from all four directions.
 * Choose based on content type and layout needs.
 */
export declare const Placements: Story;
/**
 * Different drawer sizes for different content needs.
 * Use larger sizes for complex forms or detailed views.
 */
export declare const Sizes: Story;
/**
 * Custom width and height for precise sizing.
 * Use when standard sizes don't fit your needs.
 */
export declare const CustomSize: Story;
/**
 * Nested drawers for hierarchical content.
 * Use sparingly - too many levels can confuse users.
 */
export declare const NestedDrawers: Story;
/**
 * Drawer without header for minimal design.
 * Use when you want full control of the layout.
 */
export declare const WithoutHeader: Story;
/**
 * Drawer with extra actions in the header.
 * Common pattern for providing quick actions.
 */
export declare const ExtraActions: Story;
/**
 * Drawer with custom footer.
 * Use for forms or actions that need confirmation.
 */
export declare const WithFooter: Story;
/**
 * Settings panel drawer.
 * Common pattern for application settings or preferences.
 */
export declare const SettingsPanel: Story;
/**
 * User profile drawer.
 * Display detailed user information in a slide-out panel.
 */
export declare const UserProfile: Story;
/**
 * Shopping cart drawer.
 * Common e-commerce pattern for displaying cart contents.
 */
export declare const ShoppingCart: Story;
/**
 * Notifications drawer.
 * Display a list of notifications or activity feed.
 */
export declare const NotificationsDrawer: Story;
/**
 * Mobile navigation drawer.
 * Common pattern for mobile menus and navigation.
 */
export declare const MobileNavigation: Story;
/**
 * Prevent closing by clicking mask.
 * Use when you need to ensure users complete an action.
 */
export declare const PreventMaskClose: Story;
//# sourceMappingURL=Drawer.stories.d.ts.map