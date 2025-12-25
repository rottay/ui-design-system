import type { TemplateConfig } from './types';

/**
 * DaisyUI Theme Colors
 * Extracted from DaisyUI's predefined themes
 */
const daisyuiColors: Record<string, { primary: string; success: string; warning: string; error: string; info: string }> = {
  light: {
    primary: '#570DF8',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  dark: {
    primary: '#661AE6',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  cupcake: {
    primary: '#65C3C8',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#EF9FBC',
    info: '#3ABFF8',
  },
  bumblebee: {
    primary: '#F9D72F',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#E23636',
    info: '#3ABFF8',
  },
  emerald: {
    primary: '#66CC8A',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  corporate: {
    primary: '#4B6BFB',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  synthwave: {
    primary: '#E779C1',
    success: '#36D399',
    warning: '#F3CC30',
    error: '#F87272',
    info: '#58C7F3',
  },
  retro: {
    primary: '#EF9995',
    success: '#A4E8C1',
    warning: '#FBDD74',
    error: '#E8616A',
    info: '#7DD3FC',
  },
  cyberpunk: {
    primary: '#FF7598',
    success: '#36D399',
    warning: '#FFEE58',
    error: '#FF5724',
    info: '#79F8FB',
  },
  valentine: {
    primary: '#E96D7B',
    success: '#88DBAB',
    warning: '#F5C26B',
    error: '#AF4670',
    info: '#AFD7FF',
  },
  halloween: {
    primary: '#F28C18',
    success: '#36D399',
    warning: '#F59E0B',
    error: '#F87272',
    info: '#3ABFF8',
  },
  garden: {
    primary: '#5C7F67',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  forest: {
    primary: '#1EB854',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  aqua: {
    primary: '#09ECEC',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  lofi: {
    primary: '#0D0D0D',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  pastel: {
    primary: '#D1C1D7',
    success: '#A8E6CF',
    warning: '#FFD3B6',
    error: '#FFAAA5',
    info: '#A8D8EA',
  },
  fantasy: {
    primary: '#7828C8',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  wireframe: {
    primary: '#B8B8B8',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  black: {
    primary: '#343232',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  luxury: {
    primary: '#FFFFFF',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  dracula: {
    primary: '#FF79C6',
    success: '#50FA7B',
    warning: '#F1FA8C',
    error: '#FF5555',
    info: '#8BE9FD',
  },
  cmyk: {
    primary: '#45AEEE',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#E44258',
    info: '#3ABFF8',
  },
  autumn: {
    primary: '#8C0327',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  business: {
    primary: '#1C4E80',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  acid: {
    primary: '#FF00F4',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  lemonade: {
    primary: '#519903',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  night: {
    primary: '#38BDF8',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  coffee: {
    primary: '#DB924B',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
  winter: {
    primary: '#047AFF',
    success: '#36D399',
    warning: '#FBBD23',
    error: '#F87272',
    info: '#3ABFF8',
  },
};

/**
 * Generate a DaisyUI theme configuration
 */
function createDaisyUITheme(themeName: string): TemplateConfig {
  const colors = daisyuiColors[themeName] || daisyuiColors.light;

  return {
    token: {
      colorPrimary: colors.primary,
      colorInfo: colors.info,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
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
        borderRadius: 9999,
      },
      Badge: {
        dotSize: 6,
        fontSize: 12,
        borderRadius: 12,
      },
      Card: {
        borderRadius: 16,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        headerBg: 'transparent',
        paddingLG: 32,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 48,
        fontSize: 14,
        paddingBlock: 12,
        paddingInline: 16,
      },
      Modal: {
        borderRadius: 16,
        titleFontSize: 20,
        headerBg: 'transparent',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        paddingContentHorizontal: 32,
      },
      Table: {
        headerBg: '#F3F4F6',
        headerBorderRadius: 8,
        rowHoverBg: '#F9FAFB',
        borderRadius: 8,
      },
      Alert: {
        borderRadius: 8,
        fontSize: 14,
        fontSizeLG: 16,
      },
      Select: {
        borderRadius: 8,
        controlHeight: 48,
      },
      Checkbox: {
        borderRadius: 4,
        controlInteractiveSize: 20,
      },
      Switch: {
        trackHeight: 24,
        trackMinWidth: 48,
        innerMinMargin: 4,
      },
    },
  };
}

// Export all 29 DaisyUI themes
export const daisyuiLightTemplate = createDaisyUITheme('light');
export const daisyuiDarkTemplate = createDaisyUITheme('dark');
export const daisyuiCupcakeTemplate = createDaisyUITheme('cupcake');
export const daisyuiBumblebeeTemplate = createDaisyUITheme('bumblebee');
export const daisyuiEmeraldTemplate = createDaisyUITheme('emerald');
export const daisyuiCorporateTemplate = createDaisyUITheme('corporate');
export const daisyuiSynthwaveTemplate = createDaisyUITheme('synthwave');
export const daisyuiRetroTemplate = createDaisyUITheme('retro');
export const daisyuiCyberpunkTemplate = createDaisyUITheme('cyberpunk');
export const daisyuiValentineTemplate = createDaisyUITheme('valentine');
export const daisyuiHalloweenTemplate = createDaisyUITheme('halloween');
export const daisyuiGardenTemplate = createDaisyUITheme('garden');
export const daisyuiForestTemplate = createDaisyUITheme('forest');
export const daisyuiAquaTemplate = createDaisyUITheme('aqua');
export const daisyuiLofiTemplate = createDaisyUITheme('lofi');
export const daisyuiPastelTemplate = createDaisyUITheme('pastel');
export const daisyuiFantasyTemplate = createDaisyUITheme('fantasy');
export const daisyuiWireframeTemplate = createDaisyUITheme('wireframe');
export const daisyuiBlackTemplate = createDaisyUITheme('black');
export const daisyuiLuxuryTemplate = createDaisyUITheme('luxury');
export const daisyuiDraculaTemplate = createDaisyUITheme('dracula');
export const daisyuiCmykTemplate = createDaisyUITheme('cmyk');
export const daisyuiAutumnTemplate = createDaisyUITheme('autumn');
export const daisyuiBusinessTemplate = createDaisyUITheme('business');
export const daisyuiAcidTemplate = createDaisyUITheme('acid');
export const daisyuiLemonadeTemplate = createDaisyUITheme('lemonade');
export const daisyuiNightTemplate = createDaisyUITheme('night');
export const daisyuiCoffeeTemplate = createDaisyUITheme('coffee');
export const daisyuiWinterTemplate = createDaisyUITheme('winter');
