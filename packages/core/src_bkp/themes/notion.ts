import type { TemplateConfig } from './types';

/**
 * Template Notion - Clean & Minimal Theme
 * Basado en el sistema de diseño de Notion
 */
export const notionTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#000000', // Negro Notion
    colorInfo: '#0B6E99',
    colorSuccess: '#0F7B6C',
    colorWarning: '#FFA344',
    colorError: '#EB5757',
    borderRadius: 3,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 3,
      fontWeight: 500,
      primaryShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset',
    },
    Avatar: {
      containerSize: 32,
      borderRadius: 3,
    },
    Badge: {
      dotSize: 6,
      fontSize: 12,
    },
    Calendar: {
      fullBg: '#FFFFFF',
      itemActiveBg: '#F7F6F3',
    },
    Card: {
      borderRadius: 3,
      boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px',
      headerBg: 'transparent',
    },
    Collapse: {
      headerBg: '#FBFBFA',
      contentBg: '#FFFFFF',
      borderRadius: 3,
    },
    Descriptions: {
      labelBg: '#FBFBFA',
      itemPaddingBottom: 12,
    },
    Table: {
      headerBg: '#FBFBFA',
      headerBorderRadius: 3,
      rowHoverBg: '#F7F6F3',
    },
    Tag: {
      borderRadiusSM: 3,
      defaultBg: '#F7F6F3',
    },
    Timeline: {
      tailColor: '#E3E2E0',
      dotBorderWidth: 2,
    },
    Statistic: {
      contentFontSize: 22,
      titleFontSize: 12,
    },
    List: {
      itemPadding: '8px 0',
    },
    Tree: {
      nodeHoverBg: '#F7F6F3',
      nodeSelectedBg: '#000000',
    },
    // Feedback Components
    Alert: {
      borderRadius: 3,
      fontSize: 14,
      fontSizeLG: 14,
    },
    Message: {
      borderRadius: 3,
      fontSize: 14,
    },
    Modal: {
      borderRadius: 3,
      titleFontSize: 16,
      headerBg: 'transparent',
      boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
    },
    Notification: {
      borderRadius: 3,
      fontSize: 14,
      boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
    },
    Progress: {
      defaultColor: '#000000',
      lineBorderRadius: 3,
      circleTextFontSize: '1em',
    },
    Rate: {
      starSize: 18,
      starColor: '#000000',
    },
    Result: {
      titleFontSize: 20,
      subtitleFontSize: 14,
      iconFontSize: 64,
    },
    Skeleton: {
      borderRadius: 3,
    },
    Spin: {
      dotSize: 16,
      dotSizeSM: 12,
      dotSizeLG: 24,
    },
    // Input Components
    Input: {
      borderRadius: 3,
      controlHeight: 32,
      fontSize: 14,
      paddingBlock: 6,
    },
    InputNumber: {
      borderRadius: 3,
      controlHeight: 32,
    },
    Select: {
      borderRadius: 3,
      controlHeight: 32,
    },
    Cascader: {
      borderRadius: 3,
      controlHeight: 32,
    },
    TreeSelect: {
      borderRadius: 3,
      controlHeight: 32,
    },
    DatePicker: {
      borderRadius: 3,
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
      borderRadius: 3,
      controlHeight: 32,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 18,
      labelHeight: 18,
    },
    Upload: {
      actionsColor: '#000000',
    },
    // Layout Components
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#FFFFFF',
      footerBg: '#FBFBFA',
      siderBg: '#F7F6F3',
      triggerBg: '#000000',
      headerPadding: '0 16px',
    },
    Divider: {
      orientationMargin: 0.05,
      marginLG: 18,
    },
    Splitter: {
      splitBarSize: 2,
    },
    // Navigation Components
    Menu: {
      itemBorderRadius: 3,
      itemHeight: 32,
      itemMarginInline: 2,
      iconSize: 16,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#000000',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 28,
      itemSizeSM: 22,
      borderRadius: 3,
    },
    Steps: {
      iconSize: 28,
      iconSizeSM: 22,
      dotSize: 6,
    },
    Tabs: {
      itemActiveColor: '#000000',
      itemHoverColor: '#000000',
      itemSelectedColor: '#000000',
      inkBarColor: '#000000',
    },
    Anchor: {
      linkPaddingBlock: 3,
      linkPaddingInlineStart: 12,
    },
    Segmented: {
      itemSelectedBg: '#000000',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 3,
      itemColor: 'rgba(0, 0, 0, 0.65)',
    },
    FloatButton: {
      borderRadiusLG: 3,
      borderRadiusSM: 3,
    },
    // Overlay Components
    Drawer: {
      footerPaddingBlock: 12,
      footerPaddingInline: 16,
    },
    Dropdown: {
      borderRadius: 3,
      paddingBlock: 4,
      controlItemBgHover: 'rgba(0, 0, 0, 0.06)',
    },
    Popover: {
      borderRadius: 3,
      fontSize: 14,
    },
    Tooltip: {
      borderRadius: 3,
      fontSize: 14,
    },
    Popconfirm: {
      borderRadius: 3,
      fontSize: 14,
    },
    Tour: {
      borderRadius: 3,
    },
  },
};
