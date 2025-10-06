import type { TemplateConfig } from './types';

/**
 * Template Stripe - Professional Payment Theme
 * Basado en el sistema de diseño de Stripe
 */
export const stripeTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#635BFF', // Violeta Stripe
    colorInfo: '#635BFF',
    colorSuccess: '#00D924',
    colorError: '#DF1B41',
    borderRadius: 2,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 6,
      fontWeight: 600,
      primaryShadow: '0 1px 3px 0 rgba(99, 91, 255, 0.2)',
    },
    Avatar: {
      containerSize: 40,
      borderRadius: 6,
    },
    Badge: {
      dotSize: 8,
      fontSize: 12,
    },
    Calendar: {
      fullBg: '#FFFFFF',
      itemActiveBg: '#F6F5FF',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#FAFAFA',
      contentBg: '#FFFFFF',
      borderRadius: 6,
    },
    Descriptions: {
      labelBg: '#FAFAFA',
      itemPaddingBottom: 16,
    },
    Table: {
      headerBg: '#FAFAFA',
      headerBorderRadius: 6,
      rowHoverBg: '#F6F5FF',
    },
    Tag: {
      borderRadiusSM: 4,
      defaultBg: '#F6F5FF',
    },
    Timeline: {
      tailColor: '#E0E0E0',
      dotBorderWidth: 2,
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize: 14,
    },
    List: {
      itemPadding: '12px 0',
    },
    Tree: {
      nodeHoverBg: '#F6F5FF',
      nodeSelectedBg: '#635BFF',
    },
    // Feedback Components
    Alert: {
      borderRadius: 6,
      fontSize: 14,
      fontSizeLG: 16,
    },
    Message: {
      borderRadius: 6,
      fontSize: 14,
    },
    Modal: {
      borderRadius: 8,
      titleFontSize: 18,
      headerBg: 'transparent',
      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
    },
    Notification: {
      borderRadius: 6,
      fontSize: 14,
      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.15)',
    },
    Progress: {
      defaultColor: '#635BFF',
      lineBorderRadius: 4,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 20,
      starColor: '#635BFF',
    },
    Result: {
      titleFontSize: 24,
      subtitleFontSize: 14,
      iconFontSize: 72,
    },
    Skeleton: {
      borderRadius: 6,
    },
    Spin: {
      dotSize: 20,
      dotSizeSM: 14,
      dotSizeLG: 32,
    },
    // Input Components
    Input: {
      borderRadius: 6,
      controlHeight: 40,
      fontSize: 14,
      paddingBlock: 10,
    },
    InputNumber: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Cascader: {
      borderRadius: 6,
      controlHeight: 40,
    },
    TreeSelect: {
      borderRadius: 6,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Checkbox: {
      borderRadius: 4,
      controlInteractiveSize: 18,
    },
    Radio: {
      dotSize: 10,
      radioSize: 18,
    },
    Switch: {
      trackHeight: 22,
      trackMinWidth: 44,
      innerMinMargin: 4,
    },
    Slider: {
      railSize: 4,
      handleSize: 12,
      dotSize: 8,
    },
    Transfer: {
      headerHeight: 40,
      itemHeight: 32,
    },
    ColorPicker: {
      controlHeight: 40,
    },
    Mentions: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 24,
      labelHeight: 20,
    },
    Upload: {
      actionsColor: '#635BFF',
    },
    // Layout Components
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#FAFAFA',
      footerBg: '#F6F5FF',
      siderBg: '#FFFFFF',
      triggerBg: '#635BFF',
      headerPadding: '0 24px',
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 24,
    },
    Splitter: {
      splitBarSize: 4,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 6,
      itemHeight: 40,
      itemMarginInline: 4,
      iconSize: 18,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#635BFF',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 32,
      itemSizeSM: 24,
      borderRadius: 6,
    },
    Steps: {
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
    },
    Tabs: {
      itemActiveColor: '#635BFF',
      itemHoverColor: '#635BFF',
      itemSelectedColor: '#635BFF',
      inkBarColor: '#635BFF',
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Segmented: {
      itemSelectedBg: '#635BFF',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 6,
      itemColor: 'rgba(0, 0, 0, 0.65)',
    },
    FloatButton: {
      borderRadiusLG: 8,
      borderRadiusSM: 8,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
    },
    Dropdown: {
      borderRadius: 6,
      paddingBlock: 4,
      controlItemBgHover: 'rgba(99, 91, 255, 0.08)',
    },
    Popover: {
      borderRadius: 6,
      fontSize: 14,
    },
    Tooltip: {
      borderRadius: 4,
      fontSize: 14,
    },
    Popconfirm: {
      borderRadius: 6,
      fontSize: 14,
    },
    Tour: {
      borderRadius: 8,
    },
  },
};
