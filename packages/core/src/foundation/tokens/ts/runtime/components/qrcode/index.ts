/**
 * @fileoverview QR code component token mirrors.
 *
 * Covers 6 size tiers (xs-2xl), foreground/background/border colors,
 * status states (active/loading/expired/scanned), refresh button,
 * center icon styling, and transition tokens.
 */

// QRCode sizes
export const qrcodeSize = {
  xs: {
    size: 'var(--ds-qrcode-xs-size)',
    iconSize: 'var(--ds-qrcode-xs-icon-size)',
  },
  sm: {
    size: 'var(--ds-qrcode-sm-size)',
    iconSize: 'var(--ds-qrcode-sm-icon-size)',
  },
  md: {
    size: 'var(--ds-qrcode-md-size)',
    iconSize: 'var(--ds-qrcode-md-icon-size)',
  },
  lg: {
    size: 'var(--ds-qrcode-lg-size)',
    iconSize: 'var(--ds-qrcode-lg-icon-size)',
  },
  xl: {
    size: 'var(--ds-qrcode-xl-size)',
    iconSize: 'var(--ds-qrcode-xl-icon-size)',
  },
  '2xl': {
    size: 'var(--ds-qrcode-2xl-size)',
    iconSize: 'var(--ds-qrcode-2xl-icon-size)',
  },
} as const;

// QRCode colors
export const qrcodeColor = {
  foreground: 'var(--ds-qrcode-foreground-color)',
  background: 'var(--ds-qrcode-background-color)',
  border: 'var(--ds-qrcode-border-color)',
} as const;

// QRCode border settings
export const qrcodeBorder = {
  color: 'var(--ds-qrcode-border-color)',
  width: 'var(--ds-qrcode-border-width)',
  radius: 'var(--ds-qrcode-border-radius)',
} as const;

// QRCode status states
export const qrcodeStatus = {
  active: {
    opacity: 'var(--ds-qrcode-status-active-opacity)',
  },
  loading: {
    opacity: 'var(--ds-qrcode-status-loading-opacity)',
    bg: 'var(--ds-qrcode-status-loading-bg)',
  },
  expired: {
    opacity: 'var(--ds-qrcode-status-expired-opacity)',
    overlayBg: 'var(--ds-qrcode-status-expired-overlay-bg)',
    textColor: 'var(--ds-qrcode-status-expired-text-color)',
  },
  scanned: {
    opacity: 'var(--ds-qrcode-status-scanned-opacity)',
    overlayBg: 'var(--ds-qrcode-status-scanned-overlay-bg)',
    iconColor: 'var(--ds-qrcode-status-scanned-icon-color)',
  },
} as const;

// QRCode refresh button
export const qrcodeRefreshButton = {
  bg: 'var(--ds-qrcode-refresh-button-bg)',
  color: 'var(--ds-qrcode-refresh-button-color)',
  size: 'var(--ds-qrcode-refresh-button-size)',
  radius: 'var(--ds-qrcode-refresh-button-radius)',
} as const;

// QRCode icon settings
export const qrcodeIcon = {
  bg: 'var(--ds-qrcode-icon-bg)',
  padding: 'var(--ds-qrcode-icon-padding)',
  borderRadius: 'var(--ds-qrcode-icon-border-radius)',
} as const;

// QRCode transitions
export const qrcodeTransition = {
  duration: 'var(--ds-qrcode-transition-duration)',
  timing: 'var(--ds-qrcode-transition-timing)',
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
  defaultSize: 'var(--ds-qrcode-default-size)',
  defaultIconSize: 'var(--ds-qrcode-default-icon-size)',
} as const;

// Type exports
export type QRCodeSize = keyof typeof qrcodeSize;
export type QRCodeStatus = keyof typeof qrcodeStatus;
