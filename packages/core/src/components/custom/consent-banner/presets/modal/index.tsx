'use client';

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { ConsentBannerProps } from '../../core';
import { DEFAULT_CATEGORIES, CONSENT_BANNER_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const ModalConsentBanner = createPreset<ConsentBannerProps>({
  name: 'ConsentBanner.Modal',
  render: ({ primitives, props, tokens, engine }: PresetContext<ConsentBannerProps>) => {
    const { Box } = primitives;
    const {
      categories: rawCategories = DEFAULT_CATEGORIES,
      onAccept,
      onReject,
      title = CONSENT_BANNER_DEFAULTS.title,
      description = CONSENT_BANNER_DEFAULTS.description,
      acceptLabel = CONSENT_BANNER_DEFAULTS.acceptLabel,
      rejectLabel = CONSENT_BANNER_DEFAULTS.rejectLabel,
      icon,
      visible = true,
      onVisibleChange,
      className,
      style,
    } = props;

    const categories = Array.isArray(rawCategories) ? rawCategories : DEFAULT_CATEGORIES;

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
    };

    if (!visible) return <Box style={{ display: 'none' }} />;

    return (
      <>
        {/* Backdrop */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: tokens.overlay?.medium,
          zIndex: 999,
        }} />

        {/* Modal */}
        <Box
          className={className}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            width: 480,
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto',
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.xl,
            boxShadow: tokens.shadows.xl,
            ...style,
          }}
        >
          {/* Header */}
          <div style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[3]}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              {icon && <span style={{ fontSize: tokens.typography.fontSize['2xl'], color: tokens.colors.primaryScale[500] }}>{icon}</span>}
              <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                {title}
              </div>
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], lineHeight: tokens.typography.lineHeight.relaxed }}>
              {description}
            </div>
          </div>

          {/* Categories */}
          <div style={{ padding: `0 ${tokens.spacing[5]}px` }}>
            {categories.map((cat, i) => (
              <div key={cat.key} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[3]}px 0`,
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
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
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.primaryScale[600],
                        backgroundColor: tokens.colors.primaryScale[50],
                        padding: `0 ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                      }}>
                        Required
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1], lineHeight: tokens.typography.lineHeight.relaxed }}>
                    {cat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            <button
              onClick={handleRejectAll}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              {rejectLabel}
            </button>
            <button
              onClick={handleSavePreferences}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.primaryScale[600],
                border: 'none',
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.common.white,
                backgroundColor: tokens.colors.primaryScale[600],
                border: 'none',
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              {acceptLabel}
            </button>
          </div>
        </Box>
      </>
    );
  },
});
