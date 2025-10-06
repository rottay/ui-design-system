import type { TemplateConfig } from './types';

/**
 * Template Slack - Team Communication Theme
 * Basado en el sistema de diseño de Slack
 */
export const slackTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#4A154B', // Púrpura Slack
    colorInfo: '#1264A3',
    colorSuccess: '#007A5A',
    colorWarning: '#E8912D',
    colorError: '#E01E5A',
    borderRadius: 4,
    fontFamily: 'Lato, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 36,
      borderRadius: 4,
      fontWeight: 700,
      primaryShadow: 'none',
    },
    Avatar: {
      containerSize: 36,
      borderRadius: 4,
    },
    Badge: {
      dotSize: 8,
      fontSize: 12,
    },
    Calendar: {
      fullBg: '#FFFFFF',
      itemActiveBg: '#F8F4F9',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 1px 0 rgba(0, 0, 0, 0.1)',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#F8F8F8',
      contentBg: '#FFFFFF',
      borderRadius: 4,
    },
    Descriptions: {
      labelBg: '#F8F8F8',
      itemPaddingBottom: 12,
    },
    Table: {
      headerBg: '#F8F8F8',
      headerBorderRadius: 4,
      rowHoverBg: '#F8F4F9',
    },
    Tag: {
      borderRadiusSM: 4,
      defaultBg: '#F8F4F9',
    },
    Timeline: {
      tailColor: '#DDDDDD',
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
      nodeHoverBg: '#F8F4F9',
      nodeSelectedBg: '#4A154B',
    },
    // Feedback Components
    Alert: {
      borderRadius: 4,
      fontSize: 14,
      fontSizeLG: 15,
    },
    Message: {
      borderRadius: 4,
      fontSize: 14,
    },
    Modal: {
      borderRadius: 8,
      titleFontSize: 18,
      headerBg: 'transparent',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
    Notification: {
      borderRadius: 4,
      fontSize: 14,
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
    },
    Progress: {
      defaultColor: '#4A154B',
      lineBorderRadius: 4,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 20,
      starColor: '#4A154B',
    },
    Result: {
      titleFontSize: 22,
      subtitleFontSize: 14,
      iconFontSize: 64,
    },
    Skeleton: {
      borderRadius: 4,
    },
    Spin: {
      dotSize: 18,
      dotSizeSM: 12,
      dotSizeLG: 28,
    },
    // Input Components
    Input: {
      borderRadius: 4,
      controlHeight: 36,
      fontSize: 15,
      paddingBlock: 8,
    },
    InputNumber: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Cascader: {
      borderRadius: 4,
      controlHeight: 36,
    },
    TreeSelect: {
      borderRadius: 4,
      controlHeight: 36,
    },
    DatePicker: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Checkbox: {
      borderRadius: 2,
      controlInteractiveSize: 18,
    },
    Radio: {
      dotSize: 10,
      radioSize: 18,
    },
    Switch: {
      trackHeight: 20,
      trackMinWidth: 40,
      innerMinMargin: 3,
    },
    Slider: {
      railSize: 4,
      handleSize: 12,
      dotSize: 8,
    },
    Transfer: {
      headerHeight: 36,
      itemHeight: 28,
    },
    ColorPicker: {
      controlHeight: 36,
    },
    Mentions: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Form: {
      labelFontSize: 15,
      itemMarginBottom: 20,
      labelHeight: 20,
    },
    Upload: {
      actionsColor: '#4A154B',
    },
    // Layout Components
    Layout: {
      headerBg: '#4A154B',
      bodyBg: '#FFFFFF',
      footerBg: '#F8F8F8',
      siderBg: '#4A154B',
      triggerBg: '#1264A3',
      headerPadding: '0 20px',
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 20,
    },
    Splitter: {
      splitBarSize: 3,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 4,
      itemHeight: 36,
      itemMarginInline: 2,
      iconSize: 16,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#4A154B',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 28,
      itemSizeSM: 22,
      borderRadius: 4,
    },
    Steps: {
      iconSize: 28,
      iconSizeSM: 22,
      dotSize: 8,
    },
    Tabs: {
      itemActiveColor: '#4A154B',
      itemHoverColor: '#4A154B',
      itemSelectedColor: '#4A154B',
      inkBarColor: '#4A154B',
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 12,
    },
    Segmented: {
      itemSelectedBg: '#4A154B',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 4,
      itemColor: 'rgba(0, 0, 0, 0.65)',
    },
    FloatButton: {
      borderRadiusLG: 4,
      borderRadiusSM: 4,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 12,
      footerPaddingInline: 20,
    },
    Dropdown: {
      borderRadius: 4,
      paddingBlock: 4,
      controlItemBgHover: 'rgba(74, 21, 75, 0.08)',
    },
    Popover: {
      borderRadius: 4,
      fontSize: 14,
    },
    Tooltip: {
      borderRadius: 4,
      fontSize: 14,
    },
    Popconfirm: {
      borderRadius: 4,
      fontSize: 14,
    },
    Tour: {
      borderRadius: 8,
    },
  },
};
