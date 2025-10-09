import type { TemplateConfig } from './types';

/**
 * Template Spotify - Dark Theme
 * Basado en el sistema de diseño de Spotify
 */
export const spotifyTemplate: TemplateConfig = {
  token: {
    // Colors
    colorPrimary: '#1DB954', // Verde Spotify
    colorInfo: '#509BF5',
    colorSuccess: '#1DB954',
    colorError: '#E22134',
    colorWarning: '#FFA500',

    // Backgrounds
    colorBgContainer: '#121212',
    colorBgElevated: '#181818',
    colorBgLayout: '#000000',

    // Text
    colorText: '#FFFFFF',
    colorTextSecondary: '#B3B3B3',
    colorTextTertiary: '#6A6A6A',
    colorTextQuaternary: '#535353',

    // Borders
    colorBorder: '#282828',
    colorBorderSecondary: '#404040',

    // Typography
    borderRadius: 8,
    fontFamily: 'Circular Std, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      borderRadius: 500, // Botones completamente redondos
      controlHeight: 48,
      fontWeight: 700,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    // Display Components
    Avatar: {
      containerSize: 40,
      borderRadius: 50,
    },
    Badge: {
      dotSize: 8,
      fontSize: 12,
    },
    Calendar: {
      fullBg: '#121212',
      itemActiveBg: 'rgba(29, 185, 84, 0.2)',
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
      headerBg: '#181818',
    },
    Collapse: {
      headerBg: '#181818',
      contentBg: '#121212',
      borderRadius: 8,
    },
    Descriptions: {
      labelBg: '#181818',
      itemPaddingBottom: 16,
    },
    Table: {
      headerBg: '#181818',
      headerBorderRadius: 8,
      rowHoverBg: 'rgba(29, 185, 84, 0.1)',
    },
    Tag: {
      borderRadiusSM: 4,
      defaultBg: 'rgba(29, 185, 84, 0.2)',
    },
    Timeline: {
      tailColor: '#282828',
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
      nodeHoverBg: 'rgba(29, 185, 84, 0.1)',
      nodeSelectedBg: '#1DB954',
    },
    // Feedback Components
    Alert: {
      borderRadius: 8,
      fontSize: 14,
    },
    Message: {
      borderRadius: 8,
      fontSize: 14,
    },
    Modal: {
      borderRadius: 8,
      titleFontSize: 18,
      headerBg: 'transparent',
    },
    Notification: {
      borderRadius: 8,
      fontSize: 14,
    },
    Progress: {
      defaultColor: '#1DB954',
      lineBorderRadius: 100,
    },
    Rate: {
      starSize: 24,
      starColor: '#1DB954',
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
      borderRadius: 4,
      controlHeight: 40,
      fontSize: 14,
    },
    InputNumber: {
      borderRadius: 4,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 4,
      controlHeight: 40,
    },
    Cascader: {
      borderRadius: 4,
      controlHeight: 40,
    },
    TreeSelect: {
      borderRadius: 4,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 4,
      controlHeight: 40,
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
      borderRadius: 4,
      controlHeight: 40,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 24,
    },
    Upload: {
      actionsColor: '#1DB954',
    },
    // Layout Components
    Layout: {
      headerBg: '#000000',
      bodyBg: '#121212',
      footerBg: '#181818',
      siderBg: '#000000',
      triggerBg: '#1DB954',
      headerPadding: '0 32px',
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
      itemBorderRadius: 8,
      itemHeight: 40,
      itemMarginInline: 4,
      iconSize: 18,
    },
    Breadcrumb: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      lastItemColor: '#1DB954',
      iconFontSize: 14,
      linkColor: 'rgba(0, 0, 0, 0.65)',
    },
    Pagination: {
      itemSize: 32,
      itemSizeSM: 24,
      borderRadius: 4,
    },
    Steps: {
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
    },
    Tabs: {
      itemActiveColor: '#1DB954',
      itemHoverColor: '#1DB954',
      itemSelectedColor: '#1DB954',
      inkBarColor: '#1DB954',
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Segmented: {
      itemSelectedBg: '#1DB954',
      itemSelectedColor: '#FFFFFF',
      borderRadius: 4,
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
      borderRadius: 8,
      paddingBlock: 4,
      controlItemBgHover: 'rgba(29, 185, 84, 0.1)',
    },
    Popover: {
      borderRadius: 8,
      fontSize: 14,
    },
    Tooltip: {
      borderRadius: 4,
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
