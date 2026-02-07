'use client';

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { ConsentBannerProps } from '../../core';
import { DEFAULT_CATEGORIES, CONSENT_BANNER_DEFAULTS } from '../../core';

export const BarConsentBanner = createPreset<ConsentBannerProps>({
  name: 'ConsentBanner.Bar',
  render: ({ primitives, props, tokens, engine }: PresetContext<ConsentBannerProps>) => {
    const { Box } = primitives;
    const {
      categories = DEFAULT_CATEGORIES,
      onAccept,
      onReject,
      position = CONSENT_BANNER_DEFAULTS.position,
      description = CONSENT_BANNER_DEFAULTS.description,
      acceptLabel = CONSENT_BANNER_DEFAULTS.acceptLabel,
      rejectLabel = CONSENT_BANNER_DEFAULTS.rejectLabel,
      preferencesLabel = CONSENT_BANNER_DEFAULTS.preferencesLabel,
      privacyPolicyLabel,
      cookiePolicyLabel,
      icon,
      visible = true,
      onVisibleChange,
      className,
      style,
    } = props;

    const [showPreferences, setShowPreferences] = useState(false);
    const [consents, setConsents] = useState<Record<string, boolean>>(() => {
      const initial: Record<string, boolean> = {};
      categories.forEach((c) => {
        initial[c.key] = c.required ? true : (c.defaultEnabled ?? false);
      });
      return initial;
    });

    const handleAcceptAll = () => {
      const all: Record<string, boolean> = {};
      categories.forEach((c) => { all[c.key] = true; });
      onAccept?.(all);
      onVisibleChange?.(false);
    };

    const handleRejectAll = () => {
      const minimal: Record<string, boolean> = {};
      categories.forEach((c) => { minimal[c.key] = !!c.required; });
      onReject?.();
      onVisibleChange?.(false);
    };

    const handleSavePreferences = () => {
      const forced: Record<string, boolean> = { ...consents };
      categories.forEach((c) => { if (c.required) forced[c.key] = true; });
      onAccept?.(forced);
      onVisibleChange?.(false);
      setShowPreferences(false);
    };

    if (!visible) return <Box style={{ display: 'none' }} />;

    return (
      <Box
        className={className}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
          zIndex: 1000,
          backgroundColor: tokens.colors.common.white,
          borderTop: position === 'bottom' ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
          borderBottom: position === 'top' ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
          boxShadow: tokens.shadows.lg,
          ...style,
        }}
      >
        {/* Main bar */}
        {!showPreferences && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
            maxWidth: 1200,
            margin: '0 auto',
            flexWrap: 'wrap' as const,
          }}>
            {icon && <span style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.primaryScale[500], flexShrink: 0 }}>{icon}</span>}

            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                {description}
                {privacyPolicyLabel && <span style={{ marginLeft: tokens.spacing[1], color: tokens.colors.primaryScale[600], cursor: 'pointer' }}>{privacyPolicyLabel}</span>}
                {cookiePolicyLabel && <span style={{ marginLeft: tokens.spacing[1], color: tokens.colors.primaryScale[600], cursor: 'pointer' }}>{cookiePolicyLabel}</span>}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
              <button
                onClick={() => setShowPreferences(true)}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[600],
                  backgroundColor: 'transparent',
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {preferencesLabel}
              </button>
              <button
                onClick={handleRejectAll}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  backgroundColor: tokens.colors.neutral[100],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {rejectLabel}
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.common.white,
                  backgroundColor: tokens.colors.primaryScale[600],
                  border: 'none',
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {acceptLabel}
              </button>
            </div>
          </div>
        )}

        {/* Preferences panel (inline) */}
        {showPreferences && (
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}>
              Cookie Preferences
            </div>

            {categories.map((cat, i) => (
              <div key={cat.key} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[3]}px 0`,
                borderBottom: i < categories.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
              }}>
                <input
                  type="checkbox"
                  checked={cat.required ? true : (consents[cat.key] ?? false)}
                  disabled={cat.required}
                  onChange={(e) => setConsents((prev) => ({ ...prev, [cat.key]: e.target.checked }))}
                  style={{ marginTop: 3, accentColor: tokens.colors.primaryScale[600], cursor: cat.required ? 'not-allowed' : 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      {cat.name}
                    </span>
                    {cat.required && (
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>(Required)</span>
                    )}
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                    {cat.description}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
              <button
                onClick={handleRejectAll}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  backgroundColor: tokens.colors.neutral[100],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {rejectLabel}
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.common.white,
                  backgroundColor: tokens.colors.primaryScale[600],
                  border: 'none',
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </Box>
    );
  },
});
