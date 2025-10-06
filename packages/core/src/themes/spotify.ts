import type { TemplateConfig } from './types';

/**
 * Template Spotify - Dark Theme (solo Button para MVP)
 */
export const spotifyTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#1DB954', // Verde Spotify
  },
  components: {
    Button: {
      borderRadius: 500, // Botones completamente redondos
      controlHeight: 48,
      fontWeight: 700,
      primaryShadow: 'none',
      defaultShadow: 'none',
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
      bodyBg: '#FFFFFF',
      footerBg: '#F7F7F7',
      siderBg: '#000000',
      triggerBg: '#1DB954',
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
