'use client';

/**
 * PlTenantSettings - Form Preset
 * Single-page form with collapsible sections for all tenant configuration.
 * Sections: General, Branding, Security, Integrations, Limits.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createSectionHeaderStyle,
  createFocusRingStyle,
} from '../../../helpers';
import type {
  PlTenantSettingsProps,
  TenantSettingsData,
  BrandingConfig,
  SecurityConfig,
} from '../../core';
import {
  PL_TENANT_SETTINGS_DEFAULTS,
  TIMEZONE_OPTIONS,
  LANGUAGE_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
  COLOR_SWATCHES,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Settings,
  Palette,
  Shield,
  Plug,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  AlertTriangle,
  Upload,
  Globe,
  Clock,
  Languages,
  Lock,
  Key,
  Wifi,
  Zap,
  FileUp,
  Check,
  X,
  Plus,
  Image,
  Link,
  Send,
  Info,
} from 'lucide-react';

// ─── Section Config ──────────────────────────────────────────────────────────

interface SectionConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

function getSections(tokens: DesignTokens): SectionConfig[] {
  const iconSize = 18;
  return [
    {
      id: 'general',
      label: 'General Settings',
      description: 'Basic tenant information including name, timezone, and language',
      icon: <Settings size={iconSize} />,
      iconColor: tokens.colors.primaryScale[600],
      iconBg: tokens.colors.primaryScale[50],
    },
    {
      id: 'branding',
      label: 'Branding',
      description: 'Customize the look and feel with colors, logos, and custom domains',
      icon: <Palette size={iconSize} />,
      iconColor: tokens.colors.secondaryScale[600],
      iconBg: tokens.colors.secondaryScale[50],
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Authentication policies, session rules, and access controls',
      icon: <Shield size={iconSize} />,
      iconColor: tokens.colors.successScale[600],
      iconBg: tokens.colors.successScale[50],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      description: 'Webhook endpoints, API configuration, and third-party connections',
      icon: <Plug size={iconSize} />,
      iconColor: tokens.colors.infoScale[600],
      iconBg: tokens.colors.infoScale[50],
    },
    {
      id: 'limits',
      label: 'Limits',
      description: 'File size restrictions and resource quotas',
      icon: <HardDrive size={iconSize} />,
      iconColor: tokens.colors.warningScale[600],
      iconBg: tokens.colors.warningScale[50],
    },
  ];
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

function isValidUrl(str: string): boolean {
  if (!str) return true;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function isValidDomain(str: string): boolean {
  if (!str) return true;
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(str);
}

function isValidIp(str: string): boolean {
  if (!str) return false;
  return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(str) ||
    /^[a-fA-F0-9:]+$/.test(str);
}

// ─── Form Preset ─────────────────────────────────────────────────────────────

export const FormPlTenantSettings = createPreset<PlTenantSettingsProps>({
  name: 'PlTenantSettings.Form',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlTenantSettingsProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      settings,
      onSave,
      onResetDefaults,
      saving = PL_TENANT_SETTINGS_DEFAULTS.saving,
      loading = PL_TENANT_SETTINGS_DEFAULTS.loading,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [draft, setDraft] = useState<TenantSettingsData>(settings);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
      new Set(['general', 'branding', 'security', 'integrations', 'limits'])
    );
    const [ipInput, setIpInput] = useState('');
    const [webhookTesting, setWebhookTesting] = useState(false);
    const [webhookTestResult, setWebhookTestResult] = useState<'success' | 'error' | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync draft when settings prop changes
    useEffect(() => {
      setDraft(settings);
      setHasChanges(false);
    }, [settings]);

    // Track changes
    const updateDraft = useCallback((updater: (prev: TenantSettingsData) => TenantSettingsData) => {
      setDraft(prev => {
        const next = updater(prev);
        setHasChanges(true);
        return next;
      });
    }, []);

    const sections = useMemo(() => getSections(tokens), [tokens]);

    // ─── Section Toggle ──────────────────────────────────────────────────

    const toggleSection = useCallback((sectionId: string) => {
      setExpandedSections(prev => {
        const next = new Set(prev);
        if (next.has(sectionId)) {
          next.delete(sectionId);
        } else {
          next.add(sectionId);
        }
        return next;
      });
    }, []);

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSave = useCallback(() => {
      onSave?.(draft);
    }, [onSave, draft]);

    const handleReset = useCallback(() => {
      onResetDefaults?.();
    }, [onResetDefaults]);

    const handleAddIp = useCallback(() => {
      const trimmed = ipInput.trim();
      if (trimmed && isValidIp(trimmed) && !draft.security.ipWhitelist.includes(trimmed)) {
        updateDraft(prev => ({
          ...prev,
          security: {
            ...prev.security,
            ipWhitelist: [...prev.security.ipWhitelist, trimmed],
          },
        }));
        setIpInput('');
      }
    }, [ipInput, draft.security.ipWhitelist, updateDraft]);

    const handleRemoveIp = useCallback((ip: string) => {
      updateDraft(prev => ({
        ...prev,
        security: {
          ...prev.security,
          ipWhitelist: prev.security.ipWhitelist.filter(i => i !== ip),
        },
      }));
    }, [updateDraft]);

    const handleTestWebhook = useCallback(() => {
      setWebhookTesting(true);
      setWebhookTestResult(null);
      // Simulate a webhook test
      setTimeout(() => {
        setWebhookTesting(false);
        setWebhookTestResult(draft.webhookUrl && isValidUrl(draft.webhookUrl) ? 'success' : 'error');
        setTimeout(() => setWebhookTestResult(null), 4000);
      }, 1500);
    }, [draft.webhookUrl]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Common Input Style ──────────────────────────────────────────────

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal,
      color: tokens.colors.neutral[800],
      outline: 'none',
      transition: `all ${tokens.motion.hover}`,
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    };

    const readonlyInputStyle: React.CSSProperties = {
      ...inputStyle,
      backgroundColor: tokens.colors.neutral[50],
      color: tokens.colors.neutral[500],
      cursor: 'not-allowed',
    };

    const selectStyle: React.CSSProperties = {
      ...inputStyle,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `right ${tokens.spacing[3]}px center`,
      paddingRight: `${tokens.spacing[8]}px`,
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: tokens.spacing[1],
    };

    const helperStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[500],
      marginTop: tokens.spacing[1],
      fontWeight: tokens.typography.fontWeight.normal,
    };

    const fieldGroupStyle: React.CSSProperties = {
      marginBottom: tokens.spacing[5],
    };

    // ─── Render: Section Header ──────────────────────────────────────────

    const renderSectionHeader = (section: SectionConfig) => {
      const isExpanded = expandedSections.has(section.id);
      return (
        <div
          onClick={() => toggleSection(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            borderBottom: isExpanded
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: section.iconBg,
            color: section.iconColor,
            flexShrink: 0,
          }}>
            {section.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              {section.label}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginTop: 2,
              fontWeight: tokens.typography.fontWeight.normal,
            }}>
              {section.description}
            </div>
          </div>
          <div style={{
            color: tokens.colors.neutral[400],
            transition: `transform ${tokens.motion.hover}`,
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}>
            <ChevronDown size={18} />
          </div>
        </div>
      );
    };

    // ─── Render: General Section ─────────────────────────────────────────

    const renderGeneralSection = () => (
      <div style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[2]}px` }}>
        {/* Tenant Name */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Tenant Name</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => updateDraft(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter tenant name"
            style={inputStyle}
          />
          <div style={helperStyle}>The display name for this tenant across the platform</div>
        </div>

        {/* Slug (readonly) */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              Slug
              <Lock size={12} color={tokens.colors.neutral[400]} />
            </span>
          </label>
          <input
            type="text"
            value={draft.slug}
            readOnly
            style={readonlyInputStyle}
          />
          <div style={helperStyle}>URL-safe identifier. Contact support to change this.</div>
        </div>

        {/* Description */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={draft.description || ''}
            onChange={(e) => updateDraft(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this tenant"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical' as const,
              minHeight: 80,
            }}
          />
        </div>

        {/* Timezone & Language side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[5],
        }}>
          {/* Timezone */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Clock size={14} color={tokens.colors.neutral[500]} />
                Timezone
              </span>
            </label>
            <select
              value={draft.timezone}
              onChange={(e) => updateDraft(prev => ({ ...prev, timezone: e.target.value }))}
              style={selectStyle}
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Languages size={14} color={tokens.colors.neutral[500]} />
                Language
              </span>
            </label>
            <select
              value={draft.language}
              onChange={(e) => updateDraft(prev => ({ ...prev, language: e.target.value }))}
              style={selectStyle}
            >
              {LANGUAGE_OPTIONS.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );

    // ─── Render: Branding Section ────────────────────────────────────────

    const renderBrandingSection = () => (
      <div style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[2]}px` }}>
        {/* Primary Color */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Primary Brand Color</label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[3],
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: draft.branding.primaryColor,
              border: `2px solid ${tokens.colors.neutral[200]}`,
              flexShrink: 0,
              boxShadow: tokens.shadows.sm,
            }} />
            <input
              type="text"
              value={draft.branding.primaryColor}
              onChange={(e) => updateDraft(prev => ({
                ...prev,
                branding: { ...prev.branding, primaryColor: e.target.value },
              }))}
              placeholder="#3B82F6"
              style={{ ...inputStyle, maxWidth: 160, fontFamily: 'monospace' }}
            />
          </div>
          {/* Swatch Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: tokens.spacing[1],
          }}>
            {COLOR_SWATCHES.map(color => (
              <div
                key={color}
                onClick={() => updateDraft(prev => ({
                  ...prev,
                  branding: { ...prev.branding, primaryColor: color },
                }))}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: draft.branding.primaryColor === color
                    ? `2px solid ${tokens.colors.neutral[900]}`
                    : `1px solid ${tokens.colors.neutral[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative' as const,
                }}
              >
                {draft.branding.primaryColor === color && (
                  <Check size={12} color={tokens.colors.common.white} />
                )}
              </div>
            ))}
          </div>
          <div style={helperStyle}>Choose the primary accent color for buttons, links, and highlights</div>
        </div>

        {/* Logo Upload */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Image size={14} color={tokens.colors.neutral[500]} />
              Logo
            </span>
          </label>
          {draft.branding.logoUrl ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}>
              <div style={{
                width: 64,
                height: 40,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden' as const,
              }}>
                <img
                  src={draft.branding.logoUrl}
                  alt="Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' as const }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                  Logo uploaded
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {draft.branding.logoUrl.length > 50 ? draft.branding.logoUrl.substring(0, 50) + '...' : draft.branding.logoUrl}
                </div>
              </div>
              <button
                onClick={() => updateDraft(prev => ({
                  ...prev,
                  branding: { ...prev.branding, logoUrl: undefined },
                }))}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.errorScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `2px dashed ${tokens.colors.neutral[300]}`,
              backgroundColor: tokens.colors.neutral[50],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}>
              <Upload size={24} color={tokens.colors.neutral[400]} />
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                marginTop: tokens.spacing[2],
              }}>
                Click to upload logo
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                SVG, PNG, or JPG (recommended: 200x50px)
              </div>
            </div>
          )}
        </div>

        {/* Favicon Upload */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Image size={14} color={tokens.colors.neutral[500]} />
              Favicon
            </span>
          </label>
          {draft.branding.faviconUrl ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden' as const,
              }}>
                <img
                  src={draft.branding.faviconUrl}
                  alt="Favicon"
                  style={{ width: 24, height: 24, objectFit: 'contain' as const }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                  Favicon uploaded
                </div>
              </div>
              <button
                onClick={() => updateDraft(prev => ({
                  ...prev,
                  branding: { ...prev.branding, faviconUrl: undefined },
                }))}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.errorScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `2px dashed ${tokens.colors.neutral[300]}`,
              backgroundColor: tokens.colors.neutral[50],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}>
              <Upload size={20} color={tokens.colors.neutral[400]} />
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                marginTop: tokens.spacing[2],
              }}>
                Upload favicon
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                ICO or PNG (32x32px)
              </div>
            </div>
          )}
        </div>

        {/* Custom Domain */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Globe size={14} color={tokens.colors.neutral[500]} />
              Custom Domain
            </span>
          </label>
          <input
            type="text"
            value={draft.branding.customDomain || ''}
            onChange={(e) => updateDraft(prev => ({
              ...prev,
              branding: { ...prev.branding, customDomain: e.target.value || undefined },
            }))}
            placeholder="app.yourdomain.com"
            style={inputStyle}
          />
          {draft.branding.customDomain && !isValidDomain(draft.branding.customDomain) && (
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
              marginTop: tokens.spacing[1],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <AlertTriangle size={12} />
              Please enter a valid domain name
            </div>
          )}
          <div style={helperStyle}>Map a custom domain to this tenant. CNAME record required.</div>
        </div>
      </div>
    );

    // ─── Render: Security Section ────────────────────────────────────────

    const renderSecuritySection = () => (
      <div style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[2]}px` }}>
        {/* MFA Toggle */}
        <div style={{
          ...fieldGroupStyle,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          backgroundColor: draft.security.mfaRequired ? tokens.colors.successScale[50] : tokens.colors.neutral[50],
          transition: `all ${tokens.motion.hover}`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[1],
            }}>
              <Key size={16} color={draft.security.mfaRequired ? tokens.colors.successScale[600] : tokens.colors.neutral[500]} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                Require Multi-Factor Authentication
              </span>
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.normal,
              maxWidth: 400,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              When enabled, all users must configure a second authentication factor (TOTP, SMS, or hardware key) before accessing the platform.
            </div>
          </div>
          <button
            onClick={() => updateDraft(prev => ({
              ...prev,
              security: { ...prev.security, mfaRequired: !prev.security.mfaRequired },
            }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: draft.security.mfaRequired ? 'flex-end' : 'flex-start',
              width: 44,
              height: 24,
              padding: 2,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: draft.security.mfaRequired ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              flexShrink: 0,
              marginTop: tokens.spacing[1],
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.common.white,
              boxShadow: tokens.shadows.sm,
              transition: `all ${tokens.motion.hover}`,
            }} />
          </button>
        </div>

        {/* SSO Required Toggle */}
        <div style={{
          ...fieldGroupStyle,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          backgroundColor: draft.security.ssoRequired ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
          transition: `all ${tokens.motion.hover}`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[1],
            }}>
              <Shield size={16} color={draft.security.ssoRequired ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500]} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                Require SSO Login
              </span>
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.normal,
              maxWidth: 400,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Disables password-based login and forces all users to authenticate through the configured SSO provider (SAML/OIDC).
            </div>
          </div>
          <button
            onClick={() => updateDraft(prev => ({
              ...prev,
              security: { ...prev.security, ssoRequired: !prev.security.ssoRequired },
            }))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: draft.security.ssoRequired ? 'flex-end' : 'flex-start',
              width: 44,
              height: 24,
              padding: 2,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: draft.security.ssoRequired ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              flexShrink: 0,
              marginTop: tokens.spacing[1],
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.common.white,
              boxShadow: tokens.shadows.sm,
              transition: `all ${tokens.motion.hover}`,
            }} />
          </button>
        </div>

        {/* Password Min Length Slider */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            Minimum Password Length: <span style={{ fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{draft.security.passwordMinLength}</span> characters
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.normal }}>6</span>
            <input
              type="range"
              min={6}
              max={32}
              step={1}
              value={draft.security.passwordMinLength}
              onChange={(e) => updateDraft(prev => ({
                ...prev,
                security: { ...prev.security, passwordMinLength: parseInt(e.target.value, 10) },
              }))}
              style={{
                flex: 1,
                accentColor: tokens.colors.primaryScale[500],
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.normal }}>32</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[1],
          }}>
            <div style={helperStyle}>Recommended minimum: 12 characters</div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: draft.security.passwordMinLength >= 16
                ? tokens.colors.successScale[600]
                : draft.security.passwordMinLength >= 10
                  ? tokens.colors.warningScale[600]
                  : tokens.colors.errorScale[600],
            }}>
              {draft.security.passwordMinLength >= 16 ? 'Strong' : draft.security.passwordMinLength >= 10 ? 'Moderate' : 'Weak'}
            </div>
          </div>
        </div>

        {/* Session Timeout */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Clock size={14} color={tokens.colors.neutral[500]} />
              Session Timeout
            </span>
          </label>
          <select
            value={draft.security.sessionTimeout}
            onChange={(e) => updateDraft(prev => ({
              ...prev,
              security: { ...prev.security, sessionTimeout: parseInt(e.target.value, 10) },
            }))}
            style={selectStyle}
          >
            {SESSION_TIMEOUT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div style={helperStyle}>Inactive sessions will be automatically terminated after this period</div>
        </div>

        {/* IP Whitelist Tag Input */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Wifi size={14} color={tokens.colors.neutral[500]} />
              IP Whitelist
            </span>
          </label>
          {/* Current IPs */}
          {draft.security.ipWhitelist.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[2],
            }}>
              {draft.security.ipWhitelist.map(ip => (
                <span
                  key={ip}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[700],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    fontFamily: 'monospace',
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  }}
                >
                  {ip}
                  <X
                    size={12}
                    style={{ cursor: 'pointer', color: tokens.colors.primaryScale[500] }}
                    onClick={() => handleRemoveIp(ip)}
                  />
                </span>
              ))}
            </div>
          )}
          {/* Add IP Input */}
          <div style={{
            display: 'flex',
            gap: tokens.spacing[2],
          }}>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddIp();
                }
              }}
              placeholder="e.g., 192.168.1.0/24"
              style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
            />
            <button
              onClick={handleAddIp}
              disabled={!ipInput.trim() || !isValidIp(ipInput.trim())}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: ipInput.trim() && isValidIp(ipInput.trim()) ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200],
                color: ipInput.trim() && isValidIp(ipInput.trim()) ? tokens.colors.common.white : tokens.colors.neutral[500],
                border: 'none',
                cursor: ipInput.trim() && isValidIp(ipInput.trim()) ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>
          {ipInput.trim() && !isValidIp(ipInput.trim()) && (
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
              marginTop: tokens.spacing[1],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <AlertTriangle size={12} />
              Enter a valid IPv4 address or CIDR range
            </div>
          )}
          <div style={helperStyle}>
            {draft.security.ipWhitelist.length === 0
              ? 'No IP restrictions. All addresses can access this tenant.'
              : `${draft.security.ipWhitelist.length} IP rule${draft.security.ipWhitelist.length !== 1 ? 's' : ''} configured`
            }
          </div>
        </div>
      </div>
    );

    // ─── Render: Integrations Section ────────────────────────────────────

    const renderIntegrationsSection = () => (
      <div style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[2]}px` }}>
        {/* Webhook URL */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Link size={14} color={tokens.colors.neutral[500]} />
              Webhook URL
            </span>
          </label>
          <div style={{
            display: 'flex',
            gap: tokens.spacing[2],
          }}>
            <input
              type="url"
              value={draft.webhookUrl || ''}
              onChange={(e) => updateDraft(prev => ({ ...prev, webhookUrl: e.target.value || undefined }))}
              placeholder="https://api.example.com/webhooks"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleTestWebhook}
              disabled={!draft.webhookUrl || webhookTesting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: draft.webhookUrl ? tokens.colors.infoScale[50] : tokens.colors.neutral[100],
                color: draft.webhookUrl ? tokens.colors.infoScale[700] : tokens.colors.neutral[400],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${draft.webhookUrl ? tokens.colors.infoScale[200] : tokens.colors.neutral[200]}`,
                cursor: draft.webhookUrl && !webhookTesting ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                flexShrink: 0,
              }}
            >
              {webhookTesting ? (
                <Spinner size="xs" />
              ) : (
                <Send size={14} />
              )}
              {webhookTesting ? 'Testing...' : 'Test'}
            </button>
          </div>
          {draft.webhookUrl && !isValidUrl(draft.webhookUrl) && (
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
              marginTop: tokens.spacing[1],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <AlertTriangle size={12} />
              Please enter a valid URL
            </div>
          )}
          {webhookTestResult === 'success' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.successScale[600],
              marginTop: tokens.spacing[1],
            }}>
              <Check size={12} />
              Webhook endpoint responded successfully
            </div>
          )}
          {webhookTestResult === 'error' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
              marginTop: tokens.spacing[1],
            }}>
              <X size={12} />
              Webhook test failed. Check the URL and try again.
            </div>
          )}
          <div style={helperStyle}>Events such as user signups, plan changes, and security alerts will be posted here</div>
        </div>

        {/* API Rate Limit */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Zap size={14} color={tokens.colors.neutral[500]} />
              API Rate Limit
            </span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            <input
              type="number"
              min={10}
              max={10000}
              value={draft.apiRateLimit}
              onChange={(e) => updateDraft(prev => ({ ...prev, apiRateLimit: Math.max(10, parseInt(e.target.value, 10) || 10) }))}
              style={{ ...inputStyle, maxWidth: 160 }}
            />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.normal,
              whiteSpace: 'nowrap' as const,
            }}>
              requests / minute
            </span>
          </div>
          <div style={helperStyle}>Maximum API calls per minute across all authenticated users</div>
        </div>
      </div>
    );

    // ─── Render: Limits Section ──────────────────────────────────────────

    const renderLimitsSection = () => (
      <div style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[2]}px` }}>
        {/* Max File Size Slider */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <FileUp size={14} color={tokens.colors.neutral[500]} />
              Maximum File Upload Size: <span style={{ fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], marginLeft: tokens.spacing[1] }}>{draft.maxFileSize} MB</span>
            </span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            marginTop: tokens.spacing[2],
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.normal }}>1 MB</span>
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={draft.maxFileSize}
              onChange={(e) => updateDraft(prev => ({ ...prev, maxFileSize: parseInt(e.target.value, 10) }))}
              style={{
                flex: 1,
                accentColor: tokens.colors.primaryScale[500],
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.normal }}>500 MB</span>
          </div>
          {/* Visual bar indicator */}
          <div style={{
            height: 6,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            marginTop: tokens.spacing[2],
            overflow: 'hidden' as const,
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (draft.maxFileSize / 500) * 100)}%`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: draft.maxFileSize > 250
                ? tokens.colors.warningScale[500]
                : tokens.colors.primaryScale[500],
              transition: `width ${tokens.motion.hover}`,
            }} />
          </div>
          <div style={helperStyle}>Large file limits may impact storage costs and upload performance</div>
        </div>
      </div>
    );

    // ─── Render: Section Content Map ─────────────────────────────────────

    const sectionContentMap: Record<string, () => React.ReactNode> = {
      general: renderGeneralSection,
      branding: renderBrandingSection,
      security: renderSecuritySection,
      integrations: renderIntegrationsSection,
      limits: renderLimitsSection,
    };

    // ─── Loading State ───────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'inherit',
            ...style,
          }}
        >
          <Spinner size="lg" />
        </div>
      );
    }

    // ─── Main Render ─────────────────────────────────────────────────────

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[6],
        }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Tenant Settings
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
              fontWeight: tokens.typography.fontWeight.normal,
            }}>
              Configure branding, security policies, integrations, and resource limits
            </p>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            {onResetDefaults && (
              <button
                onClick={handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <RotateCcw size={14} />
                Reset to Defaults
              </button>
            )}
            {onSave && (
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: hasChanges && !saving ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                  color: hasChanges && !saving ? tokens.colors.common.white : tokens.colors.neutral[500],
                  border: 'none',
                  cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: hasChanges && !saving ? tokens.shadows.sm : 'none',
                  outline: 'none',
                }}
              >
                {saving ? (
                  <Spinner size="xs" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.warningScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
            marginBottom: tokens.spacing[4],
          }}>
            <AlertTriangle size={16} color={tokens.colors.warningScale[600]} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.warningScale[700],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              You have unsaved changes
            </span>
          </div>
        )}

        {/* Collapsible Sections */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          {sections.map(section => (
            <div
              key={section.id}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
                overflow: 'hidden' as const,
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              {renderSectionHeader(section)}
              {expandedSections.has(section.id) && sectionContentMap[section.id]?.()}
            </div>
          ))}
        </div>
      </div>
    );
  },
});
