import type { TemplateConfig } from './types';

/**
 * Template Airbnb - Friendly & Welcoming Theme
 * Basado en el sistema de diseño de Airbnb
 */
export const airbnbTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#FF5A5F', // Rojo Airbnb
    colorInfo: '#008489',
    colorSuccess: '#00A699',
    colorError: '#FF5A5F',
    borderRadius: 8,
    fontFamily: 'Circular, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 48,
      borderRadius: 8,
      fontWeight: 600,
      primaryShadow: '0 2px 4px rgba(0, 0, 0, 0.18)',
    },
    Avatar: {
      containerSize: 48,
      borderRadius: 50,
    },
    Badge: {
      dotSize: 10,
      fontSize: 13,
    },
    Calendar: {
      fullBg: '#FFFFFF',
      itemActiveBg: '#FFF5F5',
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.18)',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#F7F7F7',
      contentBg: '#FFFFFF',
      borderRadius: 8,
    },
    Descriptions: {
      labelBg: '#F7F7F7',
      itemPaddingBottom: 16,
    },
    Table: {
      headerBg: '#F7F7F7',
      headerBorderRadius: 8,
      rowHoverBg: '#FFF5F5',
    },
    Tag: {
      borderRadiusSM: 8,
      defaultBg: '#FFF5F5',
    },
    Timeline: {
      tailColor: '#DDDDDD',
      dotBorderWidth: 3,
    },
    Statistic: {
      contentFontSize: 28,
      titleFontSize: 16,
    },
    List: {
      itemPadding: '16px 0',
    },
    Tree: {
      nodeHoverBg: '#FFF5F5',
      nodeSelectedBg: '#FF5A5F',
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
      borderRadius: 12,
      titleFontSize: 18,
      headerBg: 'transparent',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.18)',
    },
    Notification: {
      borderRadius: 8,
      fontSize: 14,
      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    },
    Progress: {
      defaultColor: '#FF5A5F',
      lineBorderRadius: 8,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 24,
      starColor: '#FF5A5F',
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
      dotSize: 24,
      dotSizeSM: 16,
      dotSizeLG: 36,
    },
    // Input Components
    Input: {
      borderRadius: 8,
      controlHeight: 48,
      fontSize: 16,
      paddingBlock: 12,
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
      dotSize: 12,
      radioSize: 20,
    },
    Switch: {
      trackHeight: 28,
      trackMinWidth: 52,
      innerMinMargin: 4,
    },
    Slider: {
      railSize: 6,
      handleSize: 16,
      dotSize: 10,
    },
    Transfer: {
      headerHeight: 48,
      itemHeight: 36,
    },
    ColorPicker: {
      controlHeight: 48,
    },
    Mentions: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Form: {
      labelFontSize: 16,
      itemMarginBottom: 28,
      labelHeight: 24,
    },
    Upload: {
      actionsColor: '#FF5A5F',
    },
    // Layout Components
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#FFFFFF',
      footerBg: '#F7F7F7',
      siderBg: '#FFFFFF',
      triggerBg: '#FF5A5F',
      headerPadding: '0 32px',
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 28,
    },
    Splitter: {
      splitBarSize: 5,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 48,
      itemMarginInline: 4,
      iconSize: 20,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#FF5A5F',
      iconFontSize: 16,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 40,
      itemSizeSM: 28,
      borderRadius: 8,
    },
    Steps: {
      iconSize: 36,
      iconSizeSM: 28,
      dotSize: 10,
    },
    Tabs: {
      itemActiveColor: '#FF5A5F',
      itemHoverColor: '#FF5A5F',
      itemSelectedColor: '#FF5A5F',
      inkBarColor: '#FF5A5F',
    },
    Anchor: {
      linkPaddingBlock: 6,
      linkPaddingInlineStart: 20,
    },
    Segmented: {
      itemSelectedBg: '#FF5A5F',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 8,
      itemColor: 'rgba(0, 0, 0, 0.65)',
    },
    FloatButton: {
      borderRadiusLG: 50,
      borderRadiusSM: 50,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 20,
      footerPaddingInline: 32,
    },
    Dropdown: {
      borderRadius: 8,
      paddingBlock: 6,
      controlItemBgHover: 'rgba(255, 90, 95, 0.08)',
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
