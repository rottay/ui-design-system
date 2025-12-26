/**
 * Card - Core Interface
 * Re-exports from centralized types
 */

export type {
  CardProps,
  CardSize,
  CardVariant,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardCoverProps,
  CardMetaProps,
  CardImageProps,
} from '../../../../../types/primitives/display/Card';

// Default values
export const CARD_DEFAULTS = {
  variant: 'elevated' as const,
  size: 'md' as const,
  shadow: 'md' as const,
  padding: 'md' as const,
  hoverable: false,
  clickable: false,
  bordered: true,
  loading: false,
  radius: 'md' as const,
};

// Size mapping to padding values (matches CSS tokens)
export const PADDING_MAP: Record<string, number> = {
  none: 0,
  sm: 12,   // --card-sm-padding: 0.75rem
  md: 16,   // --card-md-padding: 1rem
  lg: 24,   // --card-lg-padding: 1.5rem
};

// Shadow level mapping
export const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Border radius mapping
export const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};
