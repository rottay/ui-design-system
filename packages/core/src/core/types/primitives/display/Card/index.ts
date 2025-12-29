import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, WithChildren, ClickableProps, ShadowedProps, BorderedProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Card specific sizes.
 */
export type CardSize = Size;

/**
 * Card variants - specific to Card component.
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';

/**
 * Card component props.
 */
export interface CardProps extends BaseComponentProps, EngineAwareProps, WithChildren, ClickableProps, ShadowedProps, BorderedProps {
  /**
   * Card size.
   * @default 'md'
   */
  size?: CardSize;

  /**
   * Card color variant.
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Card title.
   */
  title?: ReactNode;

  /**
   * Card description/subtitle.
   */
  description?: ReactNode;

  /**
   * Cover image URL.
   */
  cover?: string;

  /**
   * Cover image position.
   * @default 'top'
   */
  coverPosition?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Card actions (buttons, links, etc).
   */
  actions?: ReactNode[];

  /**
   * Extra content for the header area.
   */
  extra?: ReactNode;

  /**
   * Whether the card is in loading state.
   */
  loading?: boolean;

  /**
   * Whether the card has a hover effect.
   * @default false
   */
  hoverable?: boolean;

  /**
   * Whether the card can be selected.
   */
  selectable?: boolean;

  /**
   * Whether the card is selected.
   */
  selected?: boolean;

  /**
   * Selection change callback.
   */
  onSelect?: (selected: boolean) => void;

  /**
   * Card border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Card content padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Whether to show a divider between header and body.
   * @default false
   */
  divider?: boolean;

  /**
   * Card background color.
   */
  backgroundColor?: string;
}

/**
 * Card.Header component props.
 */
export interface CardHeaderProps extends BaseComponentProps, WithChildren {
  /**
   * Header title.
   */
  title?: ReactNode;

  /**
   * Header subtitle.
   */
  subtitle?: ReactNode;

  /**
   * Header avatar or icon.
   */
  avatar?: ReactNode;

  /**
   * Extra content (typically on the right).
   */
  extra?: ReactNode;

  /**
   * Whether to show a divider below the header.
   * @default false
   */
  divider?: boolean;

  /**
   * Header padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card.Body component props.
 */
export interface CardBodyProps extends BaseComponentProps, WithChildren {
  /**
   * Body padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card.Footer component props.
 */
export interface CardFooterProps extends BaseComponentProps, WithChildren {
  /**
   * Footer actions (array of elements).
   */
  actions?: ReactNode[];

  /**
   * Whether to show a divider above the footer.
   * @default false
   */
  divider?: boolean;

  /**
   * Footer padding.
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Actions alignment.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end' | 'space-between';
}

/**
 * Card.Cover component props (cover image).
 */
export interface CardCoverProps extends BaseComponentProps {
  /**
   * Image URL.
   */
  src: string;

  /**
   * Alternative text.
   */
  alt?: string;

  /**
   * Image height.
   */
  height?: number | string;

  /**
   * Whether the image covers full width.
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Image object-fit.
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  /**
   * Image load error callback.
   */
  onError?: () => void;

  /**
   * Image load success callback.
   */
  onLoad?: () => void;
}

/**
 * Card.Meta component props (card metadata).
 */
export interface CardMetaProps extends BaseComponentProps {
  /**
   * Meta avatar.
   */
  avatar?: ReactNode;

  /**
   * Meta title.
   */
  title?: ReactNode;

  /**
   * Meta description.
   */
  description?: ReactNode;
}

/**
 * Card.Image component props.
 */
export interface CardImageProps extends BaseComponentProps {
  /**
   * Image source URL.
   */
  src: string;

  /**
   * Image alt text.
   */
  alt: string;

  /**
   * Image height.
   * @default 200
   */
  height?: number | string;

  /**
   * Object fit behavior.
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  /**
   * Image position relative to card.
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'cover';

  /**
   * Overlay content to show on top of the image.
   */
  overlay?: ReactNode;

  /**
   * Whether to show a gradient overlay.
   * @default false
   */
  gradient?: boolean;

  /**
   * Border radius for the image.
   * @default 'inherit'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'inherit';

  /**
   * Image load success callback.
   */
  onLoad?: () => void;

  /**
   * Image load error callback.
   */
  onError?: (error: Error) => void;
}
