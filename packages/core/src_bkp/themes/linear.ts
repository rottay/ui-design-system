import type { TemplateConfig } from './types';

/**
 * Template Linear - Modern Issue Tracking Theme
 * Basado en el sistema de diseño de Linear
 */
export const linearTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#5E6AD2', // Azul Linear
    colorInfo: '#5E6AD2',
    colorSuccess: '#26B5CE',
    colorWarning: '#F2994A',
    colorError: '#EE5A6F',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 6,
      fontWeight: 500,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Avatar: {
      containerSize: 32,
      borderRadius: 6,
    },
    Badge: {
      dotSize: 6,
      fontSize: 11,
    },
    Calendar: {
      fullBg: '#FFFFFF',
      itemActiveBg: '#F5F6FF',
    },
    Card: {
      borderRadius: 8,
      boxShadow: 'none',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#F9FAFB',
      contentBg: '#FFFFFF',
      borderRadius: 6,
    },
    Descriptions: {
      labelBg: '#F9FAFB',
      itemPaddingBottom: 12,
    },
    Table: {
      headerBg: '#F9FAFB',
      headerBorderRadius: 6,
      rowHoverBg: '#F5F6FF',
    },
    Tag: {
      borderRadiusSM: 4,
      defaultBg: '#F5F6FF',
    },
    Timeline: {
      tailColor: '#E5E7EB',
      dotBorderWidth: 2,
    },
    Statistic: {
      contentFontSize: 24,
      titleFontSize: 13,
    },
    List: {
      itemPadding: '10px 0',
    },
    Tree: {
      nodeHoverBg: '#F5F6FF',
      nodeSelectedBg: '#5E6AD2',
    },
    // Feedback Components
    Alert: {
      borderRadius: 6,
      fontSize: 13,
      fontSizeLG: 14,
    },
    Message: {
      borderRadius: 6,
      fontSize: 13,
    },
    Modal: {
      borderRadius: 8,
      titleFontSize: 16,
      headerBg: 'transparent',
      boxShadow: 'none',
    },
    Notification: {
      borderRadius: 6,
      fontSize: 13,
      boxShadow: 'none',
    },
    Progress: {
      defaultColor: '#5E6AD2',
      lineBorderRadius: 6,
      circleTextFontSize: '0.9em',
    },
    Rate: {
      starSize: 18,
      starColor: '#5E6AD2',
    },
    Result: {
      titleFontSize: 20,
      subtitleFontSize: 13,
      iconFontSize: 64,
    },
    Skeleton: {
      borderRadius: 6,
    },
    Spin: {
      dotSize: 16,
      dotSizeSM: 12,
      dotSizeLG: 24,
    },
    // Input Components
    Input: {
      borderRadius: 6,
      controlHeight: 32,
      fontSize: 14,
      paddingBlock: 6,
    },
    InputNumber: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Cascader: {
      borderRadius: 6,
      controlHeight: 32,
    },
    TreeSelect: {
      borderRadius: 6,
      controlHeight: 32,
    },
    DatePicker: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Checkbox: {
      borderRadius: 3,
      controlInteractiveSize: 16,
    },
    Radio: {
      dotSize: 8,
      radioSize: 16,
    },
    Switch: {
      trackHeight: 18,
      trackMinWidth: 36,
      innerMinMargin: 3,
    },
    Slider: {
      railSize: 3,
      handleSize: 12,
      dotSize: 6,
    },
    Transfer: {
      headerHeight: 32,
      itemHeight: 28,
    },
    ColorPicker: {
      controlHeight: 32,
    },
    Mentions: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Form: {
      labelFontSize: 13,
      itemMarginBottom: 16,
      labelHeight: 18,
    },
    Upload: {
      actionsColor: '#5E6AD2',
    },
    // Layout Components
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#F9FAFB',
      footerBg: '#F9FAFB',
      siderBg: '#FFFFFF',
      triggerBg: '#5E6AD2',
      headerPadding: '0 20px',
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 16,
    },
    Splitter: {
      splitBarSize: 2,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 6,
      itemHeight: 32,
      itemMarginInline: 2,
      iconSize: 16,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#5E6AD2',
      iconFontSize: 13,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 28,
      itemSizeSM: 22,
      borderRadius: 6,
    },
    Steps: {
      iconSize: 28,
      iconSizeSM: 22,
      dotSize: 6,
    },
    Tabs: {
      itemActiveColor: '#5E6AD2',
      itemHoverColor: '#5E6AD2',
      itemSelectedColor: '#5E6AD2',
      inkBarColor: '#5E6AD2',
    },
    Anchor: {
      linkPaddingBlock: 3,
      linkPaddingInlineStart: 12,
    },
    Segmented: {
      itemSelectedBg: '#5E6AD2',
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
      footerPaddingBlock: 12,
      footerPaddingInline: 20,
    },
    Dropdown: {
      borderRadius: 6,
      paddingBlock: 4,
      controlItemBgHover: 'rgba(94, 106, 210, 0.08)',
    },
    Popover: {
      borderRadius: 6,
      fontSize: 13,
    },
    Tooltip: {
      borderRadius: 4,
      fontSize: 13,
    },
    Popconfirm: {
      borderRadius: 6,
      fontSize: 13,
    },
    Tour: {
      borderRadius: 8,
    },
  },
};
