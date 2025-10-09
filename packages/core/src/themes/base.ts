import type { TemplateConfig } from './types';

/**
 * Template Base - Ant Design Default
 * El tema clásico de Ant Design con colores azules
 */
export const baseTemplate: TemplateConfig = {
  token: {
    // Colors
    colorPrimary: '#1890ff', // Azul Ant Design
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a',
    colorError: '#ff4d4f',
    colorWarning: '#faad14',

    // Backgrounds
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f0f2f5',

    // Text
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Borders
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',

    // Typography
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 6,
      fontWeight: 400,
    },
    // Display Components
    Avatar: {
      containerSize: 32,
      borderRadius: 4,
    },
    Badge: {
      dotSize: 6,
      fontSize: 12,
    },
    Calendar: {
      fullBg: '#ffffff',
      itemActiveBg: '#e6f4ff',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#fafafa',
      contentBg: '#ffffff',
      borderRadius: 8,
    },
    Descriptions: {
      labelBg: '#fafafa',
      itemPaddingBottom: 16,
    },
    Table: {
      headerBg: '#fafafa',
      headerBorderRadius: 8,
      rowHoverBg: '#fafafa',
    },
    Tag: {
      borderRadiusSM: 4,
      defaultBg: '#fafafa',
    },
    Timeline: {
      tailColor: '#e8e8e8',
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
      nodeHoverBg: '#f5f5f5',
      nodeSelectedBg: '#e6f4ff',
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
      borderRadius: 8,
      titleFontSize: 16,
      headerBg: 'transparent',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
    Notification: {
      borderRadius: 8,
      fontSize: 14,
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
    Progress: {
      defaultColor: '#1890ff',
      lineBorderRadius: 100,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 20,
      starColor: '#fadb14',
    },
    Result: {
      titleFontSize: 24,
      subtitleFontSize: 14,
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
      borderRadius: 6,
      controlHeight: 32,
      fontSize: 14,
      paddingBlock: 4,
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
      borderRadius: 2,
      controlInteractiveSize: 16,
    },
    Radio: {
      dotSize: 8,
      radioSize: 16,
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
      controlHeight: 32,
    },
    Mentions: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 24,
      labelHeight: 20,
    },
    Upload: {
      actionsColor: '#1890ff',
    },
    // Layout Components
    Layout: {
      headerBg: '#001529',
      bodyBg: '#f0f2f5',
      footerBg: '#f0f2f5',
      siderBg: '#001529',
      triggerBg: '#002140',
      headerPadding: '0 50px',
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 24,
    },
    Splitter: {
      splitBarSize: 2,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 40,
      itemMarginInline: 4,
      iconSize: 14,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.45)',
      lastItemColor: 'rgba(0, 0, 0, 0.88)',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.45)',
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
      itemActiveColor: '#1890ff',
      itemHoverColor: '#40a9ff',
      itemSelectedColor: '#1890ff',
      inkBarColor: '#1890ff',
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Segmented: {
      itemSelectedBg: '#1890ff',
      itemSelectedColor: '#ffffff',
      borderRadius: 6,
      itemColor: 'rgba(0, 0, 0, 0.88)',
    },
    FloatButton: {
      borderRadiusLG: 8,
      borderRadiusSM: 8,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 10,
      footerPaddingInline: 16,
    },
    Dropdown: {
      borderRadius: 8,
      paddingBlock: 4,
      controlItemBgHover: '#f5f5f5',
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
      borderRadius: 8,
    },
  },
};
