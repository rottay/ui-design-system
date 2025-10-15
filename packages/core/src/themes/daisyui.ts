import type { TemplateConfig } from './types';

/**
 * Template DaisyUI - Modern Component Library Theme
 * Basado en el sistema de diseño de DaisyUI con Tailwind CSS
 */
export const daisyuiTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#570DF8', // Purple primary de DaisyUI
    colorInfo: '#3ABFF8',
    colorSuccess: '#36D399',
    colorWarning: '#FBBD23',
    colorError: '#F87272',
    borderRadius: 8,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 48,
      borderRadius: 8,
      fontWeight: 600,
      primaryShadow: 'none',
      defaultShadow: 'none',
      paddingContentHorizontal: 24,
    },
    Avatar: {
      containerSize: 48,
      borderRadius: 9999, // Fully rounded
    },
    Badge: {
      dotSize: 6,
      fontSize: 12,
      borderRadius: 12,
    },
    Calendar: {
      fullBg: '#FFFFFF',
      itemActiveBg: '#570DF8',
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      headerBg: 'transparent',
      paddingLG: 32,
    },
    Collapse: {
      headerBg: '#F3F4F6',
      contentBg: '#FFFFFF',
      borderRadius: 8,
      headerPadding: '16px',
    },
    Descriptions: {
      labelBg: '#F9FAFB',
      itemPaddingBottom: 16,
    },
    Table: {
      headerBg: '#F3F4F6',
      headerBorderRadius: 8,
      rowHoverBg: '#F9FAFB',
      borderRadius: 8,
    },
    Tag: {
      borderRadiusSM: 4,
      defaultBg: '#E5E7EB',
    },
    Timeline: {
      tailColor: '#D1D5DB',
      dotBorderWidth: 2,
    },
    Statistic: {
      contentFontSize: 32,
      titleFontSize: 14,
    },
    List: {
      itemPadding: '12px 0',
    },
    Tree: {
      nodeHoverBg: '#F3F4F6',
      nodeSelectedBg: '#570DF8',
    },
    // Feedback Components
    Alert: {
      borderRadius: 8,
      fontSize: 14,
      fontSizeLG: 16,
    },
    Message: {
      borderRadius: 8,
      fontSize: 14,
    },
    Modal: {
      borderRadius: 16,
      titleFontSize: 20,
      headerBg: 'transparent',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      paddingContentHorizontal: 32,
    },
    Notification: {
      borderRadius: 12,
      fontSize: 14,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      paddingMD: 24,
    },
    Progress: {
      defaultColor: '#570DF8',
      lineBorderRadius: 12,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 24,
      starColor: '#FBBD23',
    },
    Result: {
      titleFontSize: 24,
      subtitleFontSize: 16,
      iconFontSize: 72,
    },
    Skeleton: {
      borderRadius: 8,
    },
    Spin: {
      dotSize: 20,
      dotSizeSM: 14,
      dotSizeLG: 32,
    },
    // Input Components
    Input: {
      borderRadius: 8,
      controlHeight: 48,
      fontSize: 14,
      paddingBlock: 12,
      paddingInline: 16,
    },
    InputNumber: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Cascader: {
      borderRadius: 8,
      controlHeight: 48,
    },
    TreeSelect: {
      borderRadius: 8,
      controlHeight: 48,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Checkbox: {
      borderRadius: 4,
      controlInteractiveSize: 20,
    },
    Radio: {
      dotSize: 10,
      radioSize: 20,
    },
    Switch: {
      trackHeight: 24,
      trackMinWidth: 48,
      innerMinMargin: 4,
    },
    Slider: {
      railSize: 4,
      handleSize: 16,
      dotSize: 8,
    },
    Transfer: {
      headerHeight: 48,
      itemHeight: 32,
    },
    ColorPicker: {
      controlHeight: 48,
    },
    Mentions: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 24,
      labelHeight: 20,
    },
    Upload: {
      actionsColor: '#570DF8',
    },
    // Layout Components
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#F9FAFB',
      footerBg: '#F9FAFB',
      siderBg: '#FFFFFF',
      triggerBg: '#570DF8',
      headerPadding: '0 32px',
      headerHeight: 64,
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 24,
    },
    Splitter: {
      splitBarSize: 3,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 40,
      itemMarginInline: 4,
      iconSize: 18,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.6)',
      lastItemColor: '#570DF8',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.6)',
    },
    Pagination: {
      itemSize: 32,
      itemSizeSM: 24,
      borderRadius: 8,
    },
    Steps: {
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
    },
    Tabs: {
      itemActiveColor: '#570DF8',
      itemHoverColor: '#570DF8',
      itemSelectedColor: '#570DF8',
      inkBarColor: '#570DF8',
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Segmented: {
      itemSelectedBg: '#570DF8',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 8,
      itemColor: 'rgba(0, 0, 0, 0.6)',
    },
    FloatButton: {
      borderRadiusLG: 12,
      borderRadiusSM: 12,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 32,
    },
    Dropdown: {
      borderRadius: 8,
      paddingBlock: 8,
      controlItemBgHover: 'rgba(87, 13, 248, 0.08)',
    },
    Popover: {
      borderRadius: 8,
      fontSize: 14,
    },
    Tooltip: {
      borderRadius: 6,
      fontSize: 14,
    },
    Popconfirm: {
      borderRadius: 8,
      fontSize: 14,
    },
    Tour: {
      borderRadius: 12,
    },
  },
};
