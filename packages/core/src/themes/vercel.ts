import type { TemplateConfig } from './types';

/**
 * Template Vercel - Minimalist Deployment Theme
 * Basado en el sistema de diseño de Vercel
 */
export const vercelTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#000000', // Negro Vercel
    colorInfo: '#0070F3',
    colorSuccess: '#0070F3',
    colorWarning: '#F5A623',
    colorError: '#EE0000',
    borderRadius: 5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 5,
      fontWeight: 500,
      primaryShadow: 'none',
      defaultShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    },
    Avatar: {
      containerSize: 40,
      borderRadius: 50,
    },
    Badge: {
      dotSize: 8,
      fontSize: 12,
    },
    Calendar: {
      fullBg: '#FAFAFA',
      itemActiveBg: '#F5F5F5',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#FAFAFA',
      contentBg: '#FFFFFF',
      borderRadius: 5,
    },
    Descriptions: {
      labelBg: '#FAFAFA',
      itemPaddingBottom: 16,
    },
    Table: {
      headerBg: '#FAFAFA',
      headerBorderRadius: 5,
      rowHoverBg: '#F5F5F5',
    },
    Tag: {
      borderRadiusSM: 5,
      defaultBg: '#F5F5F5',
    },
    Timeline: {
      tailColor: '#EAEAEA',
      dotBorderWidth: 2,
    },
    Statistic: {
      contentFontSize: 26,
      titleFontSize: 14,
    },
    List: {
      itemPadding: '14px 0',
    },
    Tree: {
      nodeHoverBg: '#F5F5F5',
      nodeSelectedBg: '#000000',
    },
    // Feedback Components
    Alert: {
      borderRadius: 5,
      fontSize: 14,
      fontSizeLG: 16,
    },
    Message: {
      borderRadius: 5,
      fontSize: 14,
    },
    Modal: {
      borderRadius: 8,
      titleFontSize: 18,
      headerBg: 'transparent',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    },
    Notification: {
      borderRadius: 5,
      fontSize: 14,
      boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    },
    Progress: {
      defaultColor: '#000000',
      lineBorderRadius: 5,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 20,
      starColor: '#000000',
    },
    Result: {
      titleFontSize: 24,
      subtitleFontSize: 14,
      iconFontSize: 72,
    },
    Skeleton: {
      borderRadius: 5,
    },
    Spin: {
      dotSize: 20,
      dotSizeSM: 14,
      dotSizeLG: 32,
    },
    // Input Components
    Input: {
      borderRadius: 5,
      controlHeight: 40,
      fontSize: 14,
      paddingBlock: 10,
    },
    InputNumber: {
      borderRadius: 5,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 5,
      controlHeight: 40,
    },
    Cascader: {
      borderRadius: 5,
      controlHeight: 40,
    },
    TreeSelect: {
      borderRadius: 5,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 5,
      controlHeight: 40,
    },
    Checkbox: {
      borderRadius: 3,
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
      handleSize: 14,
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
      borderRadius: 5,
      controlHeight: 40,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 24,
      labelHeight: 22,
    },
    Upload: {
      actionsColor: '#000000',
    },
    // Layout Components
    Layout: {
      headerBg: '#000000',
      bodyBg: '#FAFAFA',
      footerBg: '#000000',
      siderBg: '#FFFFFF',
      triggerBg: '#000000',
      headerPadding: '0 24px',
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
      itemBorderRadius: 5,
      itemHeight: 40,
      itemMarginInline: 4,
      iconSize: 18,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#000000',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 32,
      itemSizeSM: 24,
      borderRadius: 5,
    },
    Steps: {
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
    },
    Tabs: {
      itemActiveColor: '#000000',
      itemHoverColor: '#000000',
      itemSelectedColor: '#000000',
      inkBarColor: '#000000',
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Segmented: {
      itemSelectedBg: '#000000',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 5,
      itemColor: 'rgba(0, 0, 0, 0.65)',
    },
    FloatButton: {
      borderRadiusLG: 50,
      borderRadiusSM: 50,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
    },
    Dropdown: {
      borderRadius: 5,
      paddingBlock: 4,
      controlItemBgHover: 'rgba(0, 0, 0, 0.06)',
    },
    Popover: {
      borderRadius: 5,
      fontSize: 14,
    },
    Tooltip: {
      borderRadius: 5,
      fontSize: 14,
    },
    Popconfirm: {
      borderRadius: 5,
      fontSize: 14,
    },
    Tour: {
      borderRadius: 8,
    },
  },
};
