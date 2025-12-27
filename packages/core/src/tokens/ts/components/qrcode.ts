/**
 * QRCode Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of QRCode CSS custom properties.
 * Use these for type-safe QRCode token references.
 */

// QRCode sizes
export const qrcodeSize = {
  xs: {
    size: 'var(--qrcode-xs-size)',
    iconSize: 'var(--qrcode-xs-icon-size)',
  },
  sm: {
    size: 'var(--qrcode-sm-size)',
    iconSize: 'var(--qrcode-sm-icon-size)',
  },
  md: {
    size: 'var(--qrcode-md-size)',
    iconSize: 'var(--qrcode-md-icon-size)',
  },
  lg: {
    size: 'var(--qrcode-lg-size)',
    iconSize: 'var(--qrcode-lg-icon-size)',
  },
  xl: {
    size: 'var(--qrcode-xl-size)',
    iconSize: 'var(--qrcode-xl-icon-size)',
  },
  '2xl': {
    size: 'var(--qrcode-2xl-size)',
    iconSize: 'var(--qrcode-2xl-icon-size)',
  },
} as const;

// QRCode colors
export const qrcodeColor = {
  foreground: 'var(--qrcode-foreground-color)',
  background: 'var(--qrcode-background-color)',
  border: 'var(--qrcode-border-color)',
} as const;

// QRCode border settings
export const qrcodeBorder = {
  color: 'var(--qrcode-border-color)',
  width: 'var(--qrcode-border-width)',
  radius: 'var(--qrcode-border-radius)',
} as const;

// QRCode status states
export const qrcodeStatus = {
  active: {
    opacity: 'var(--qrcode-status-active-opacity)',
  },
  loading: {
    opacity: 'var(--qrcode-status-loading-opacity)',
    bg: 'var(--qrcode-status-loading-bg)',
  },
  expired: {
    opacity: 'var(--qrcode-status-expired-opacity)',
    overlayBg: 'var(--qrcode-status-expired-overlay-bg)',
    textColor: 'var(--qrcode-status-expired-text-color)',
  },
  scanned: {
    opacity: 'var(--qrcode-status-scanned-opacity)',
    overlayBg: 'var(--qrcode-status-scanned-overlay-bg)',
    iconColor: 'var(--qrcode-status-scanned-icon-color)',
  },
} as const;

// QRCode refresh button
export const qrcodeRefreshButton = {
  bg: 'var(--qrcode-refresh-button-bg)',
  color: 'var(--qrcode-refresh-button-color)',
  size: 'var(--qrcode-refresh-button-size)',
  radius: 'var(--qrcode-refresh-button-radius)',
} as const;

// QRCode icon settings
export const qrcodeIcon = {
  bg: 'var(--qrcode-icon-bg)',
  padding: 'var(--qrcode-icon-padding)',
  borderRadius: 'var(--qrcode-icon-border-radius)',
} as const;

// QRCode transitions
export const qrcodeTransition = {
  duration: 'var(--qrcode-transition-duration)',
  timing: 'var(--qrcode-transition-timing)',
} as const;

// Combined qrcode tokens
export const qrcodeTokens = {
  size: qrcodeSize,
  color: qrcodeColor,
  border: qrcodeBorder,
  status: qrcodeStatus,
  refreshButton: qrcodeRefreshButton,
  icon: qrcodeIcon,
  transition: qrcodeTransition,
  defaultSize: 'var(--qrcode-default-size)',
  defaultIconSize: 'var(--qrcode-default-icon-size)',
} as const;

// Type exports
export type QRCodeSize = keyof typeof qrcodeSize;
export type QRCodeStatus = keyof typeof qrcodeStatus;
