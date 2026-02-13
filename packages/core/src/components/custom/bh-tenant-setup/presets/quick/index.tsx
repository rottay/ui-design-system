'use client';

/**
 * BhTenantSetup - Quick Preset
 * Minimal setup flow: only essential steps (Org, Provider, First invite)
 * with a streamlined single-card layout and fewer fields
 */

import {useState, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPersonalityAccentBar,
  createSurfaceStyle,
  getCardPadding,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
} from '../../../helpers';
import type {
  BhTenantSetupProps,
  InvitationItem,
} from '../../core';
import { getIndustryOptions, getRoleOptions } from '../../core';
import {
  Building2, Cpu, Mail, Check, ChevronRight, ChevronLeft,
  X, Zap, Key, Loader2, CheckCircle2, XCircle, Sparkles,
  Rocket, ArrowRight, UserPlus, Plus,
} from 'lucide-react';

/** Quick setup uses only 3 steps */
const QUICK_STEPS = [
  { key: 'basics', label: 'Basics', icon: <Building2 size={16} /> },
  { key: 'ai', label: 'AI Provider', icon: <Cpu size={16} /> },
  { key: 'invite', label: 'Invite', icon: <Mail size={16} /> },
];

export const QuickBhTenantSetup = createPreset<BhTenantSetupProps>({
  name: 'BhTenantSetup.Quick',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTenantSetupProps>) => {
    const { Box, Text } = primitives;

    const {
      formData,
      onChange,
      providerTestResult,
      onTestProvider,
      onComplete,
      onSkip,
      className,
      style,
    } = props;

    /* ── Local State ─────────────────────────────────────────── */
    const [quickStep, setQuickStep] = useState(0);
    const [localFormData, setLocalFormData] = useState(formData);
    const [localTestResult, setLocalTestResult] = useState(providerTestResult);
    const [localInvitations, setLocalInvitations] = useState<InvitationItem[]>(formData.invitations || []);
    const [showComplete, setShowComplete] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const surfaceMd = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const containerStyle: React.CSSProperties = {
      ...surfaceMd,
      minHeight: '100%',
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      ...style,
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
      transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
      boxSizing: 'border-box' as const,
    };

    const selectStyle: React.CSSProperties = {
      ...inputStyle,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `right ${tokens.spacing[3]}px center`,
      paddingRight: tokens.spacing[8],
    };

    const labelStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: tokens.spacing[1],
      display: 'block',
    };

    const buttonPrimaryStyle: React.CSSProperties = {
      ...hoverTransition,
      padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.primaryScale[600],
      color: tokens.colors.common.white,
      border: 'none',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const buttonSecondaryStyle: React.CSSProperties = {
      ...hoverTransition,
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.neutral[700],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
    };

    const updateFormData = useCallback((updates: Record<string, any>) => {
      setLocalFormData((prev) => ({ ...prev, ...updates }));
      onChange?.(updates);
    }, [onChange]);

    const handleNext = () => {
      if (quickStep >= QUICK_STEPS.length - 1) {
        setIsComplete(true);
        setTimeout(() => onComplete?.(), 2500);
      } else {
        setQuickStep(quickStep + 1);
      }
    };

    const handleBack = () => {
      if (quickStep > 0) {
        setQuickStep(quickStep - 1);
      }
    };

    /* ── Step Indicator (horizontal) ─────────────────────────── */
    const renderStepIndicator = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[4]}px`,
      }}>
        {QUICK_STEPS.map((step, idx) => {
          const isPast = idx < quickStep;
          const isCurrent = idx === quickStep;

          return (
            <Box key={step.key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: isCurrent
                  ? tokens.colors.primaryScale[50]
                  : isPast
                    ? tokens.colors.successScale[50]
                    : tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isCurrent
                  ? tokens.colors.primaryScale[300]
                  : isPast
                    ? tokens.colors.successScale[300]
                    : tokens.colors.neutral[200]}`,
              }}>
                {isPast ? (
                  <Check size={14} color={tokens.colors.successScale[600]} />
                ) : (
                  <Text style={{
                    color: isCurrent ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                  }}>
                    {step.icon}
                  </Text>
                )}
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  color: isCurrent
                    ? tokens.colors.primaryScale[700]
                    : isPast
                      ? tokens.colors.successScale[700]
                      : tokens.colors.neutral[500],
                }}>
                  {step.label}
                </Text>
              </Box>

              {idx < QUICK_STEPS.length - 1 && (
                <ArrowRight size={14} color={tokens.colors.neutral[300]} />
              )}
            </Box>
          );
        })}
      </Box>
    );

    /* ── Step 1: Basics ──────────────────────────────────────── */
    const renderBasics = () => (
      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], textAlign: 'center' as const, marginBottom: tokens.spacing[2] }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            Quick Setup
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: `${tokens.spacing[1]}px 0 0 0`,
          }}>
            Just the essentials to get started.
          </Text>
        </Box>

        <Box>
          <Text style={labelStyle}>
            Company Name <Text style={{ color: tokens.colors.errorScale[500] }}>*</Text>
          </Text>
          <input
            type="text"
            aria-label="Company name"
            value={localFormData.orgName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ orgName: e.target.value })}
            placeholder="Your company name"
            style={inputStyle}
          />
        </Box>

        <Box>
          <Text style={labelStyle}>Industry</Text>
          <select
            aria-label="Industry"
            value={localFormData.industry}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ industry: e.target.value })}
            style={selectStyle}
          >
            <option value="">Select industry</option>
            {getIndustryOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Box>
      </Box>
    );

    /* ── Step 2: AI Provider ─────────────────────────────────── */
    const renderAi = () => {
      const testStatus = localTestResult?.status;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], textAlign: 'center' as const, marginBottom: tokens.spacing[2] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
            }}>
              Connect AI Provider
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: `${tokens.spacing[1]}px 0 0 0`,
            }}>
              Power your interviews with AI.
            </Text>
          </Box>

          <Box>
            <Text style={labelStyle}>Provider</Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {['openai', 'anthropic', 'google'].map((prov) => {
                const isSelected = localFormData.providerConfig.provider === prov;
                return (
                  <Box
                    key={prov}
                    onClick={() => updateFormData({
                      providerConfig: { ...localFormData.providerConfig, provider: prov },
                    })}
                    style={{
                      ...hoverTransition,
                      flex: 1,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected
                        ? tokens.colors.primaryScale[400]
                        : tokens.colors.neutral[200]}`,
                      backgroundColor: isSelected
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.common.white,
                      color: isSelected
                        ? tokens.colors.primaryScale[700]
                        : tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isSelected
                        ? tokens.typography.fontWeight.semibold
                        : tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {prov}
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box>
            <Text style={labelStyle}>
              API Key <Text style={{ color: tokens.colors.errorScale[500] }}>*</Text>
            </Text>
            <Box style={{ position: 'relative' as const }}>
              <input
                type="password"
                aria-label="API Key"
                value={localFormData.providerConfig.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({
                  providerConfig: { ...localFormData.providerConfig, apiKey: e.target.value },
                })}
                placeholder="sk-..."
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace',
                  paddingRight: tokens.spacing[10],
                }}
              />
              <Key size={14} color={tokens.colors.neutral[400]} style={{
                position: 'absolute' as const,
                right: tokens.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
              }} />
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box
              onClick={localFormData.providerConfig.apiKey ? () => {
                setLocalTestResult({ provider: localFormData.providerConfig.provider, status: 'testing' });
                onTestProvider?.();
              } : undefined}
              style={{
                ...buttonPrimaryStyle,
                opacity: !localFormData.providerConfig.apiKey ? 0.5 : 1,
                cursor: !localFormData.providerConfig.apiKey ? 'not-allowed' : 'pointer',
              }}
            >
              <Zap size={14} />
              Test
            </Box>

            {testStatus && (
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
              }}>
                {testStatus === 'testing' && (
                  <>
                    <Loader2 size={14} color={tokens.colors.infoScale[600]} style={{
                      animation: 'bhQuickSpin 1s linear infinite',
                    }} />
                    <Text style={{ color: tokens.colors.infoScale[700] }}>Testing...</Text>
                  </>
                )}
                {testStatus === 'success' && (
                  <>
                    <CheckCircle2 size={14} color={tokens.colors.successScale[600]} />
                    <Text style={{ color: tokens.colors.successScale[700] }}>Connected</Text>
                  </>
                )}
                {testStatus === 'failure' && (
                  <>
                    <XCircle size={14} color={tokens.colors.errorScale[600]} />
                    <Text style={{ color: tokens.colors.errorScale[700] }}>
                      {localTestResult?.error ?? 'Failed'}
                    </Text>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    /* ── Step 3: Invite ──────────────────────────────────────── */
    const renderInvite = () => {
      const addInvite = () => {
        setLocalInvitations([...localInvitations, { email: '', role: 'recruiter' }]);
      };

      const removeInvite = (idx: number) => {
        setLocalInvitations(localInvitations.filter((_, i) => i !== idx));
      };

      const updateInvite = (idx: number, updates: Partial<InvitationItem>) => {
        const updated = [...localInvitations];
        updated[idx] = { ...updated[idx], ...updates };
        setLocalInvitations(updated);
        updateFormData({ invitations: updated });
      };

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], textAlign: 'center' as const, marginBottom: tokens.spacing[2] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
            }}>
              Invite Team Members
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: `${tokens.spacing[1]}px 0 0 0`,
            }}>
              Optional. You can always invite more later.
            </Text>
          </Box>

          {localInvitations.map((invite, idx) => (
            <Box key={idx} style={{
              display: 'flex',
              gap: tokens.spacing[2],
              alignItems: 'flex-end',
            }}>
              <Box style={{ flex: 2 }}>
                {idx === 0 && <Text style={labelStyle}>Email</Text>}
                <input
                  type="email"
                  aria-label={`Email for invitation ${idx + 1}`}
                  value={invite.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateInvite(idx, { email: e.target.value })}
                  placeholder="colleague@company.com"
                  style={inputStyle}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                {idx === 0 && <Text style={labelStyle}>Role</Text>}
                <select
                  aria-label={`Role for invitation ${idx + 1}`}
                  value={invite.role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateInvite(idx, { role: e.target.value })}
                  style={selectStyle}
                >
                  {getRoleOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Box>
              <Box
                onClick={() => removeInvite(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  padding: tokens.spacing[2],
                  display: 'flex',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <X size={16} color={tokens.colors.neutral[400]} />
              </Box>
            </Box>
          ))}

          <Box
            onClick={addInvite}
            style={{
              ...buttonSecondaryStyle,
              justifyContent: 'center',
              width: '100%',
              border: `2px dashed ${tokens.colors.neutral[300]}`,
            }}
          >
            <Plus size={14} />
            Add Member
          </Box>
        </Box>
      );
    };

    /* ── Celebration ─────────────────────────────────────────── */
    const renderCelebration = () => (
      <Box style={{
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isGlass && tokens.glass ? tokens.glass.bgHeavy : `${tokens.colors.common.white}ee`,
        backdropFilter: isGlass && tokens.glass ? tokens.glass.blur : undefined,
        WebkitBackdropFilter: isGlass && tokens.glass ? tokens.glass.blur : undefined,
      }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4],
          textAlign: 'center' as const,
          zIndex: 51,
        }}>
          <Box style={{
            width: 64,
            height: 64,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.successScale[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: tokens.spacing[3],
            animation: 'bhQuickScale 0.5s ease-out',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill={tokens.colors.successScale[500]} />
              <polyline
                points="10,16 14,20 22,12"
                stroke={tokens.colors.common.white}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </Box>
          <Text style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            You are all set!
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            margin: `${tokens.spacing[2]}px 0 0 0`,
          }}>
            Your BitHire workspace is ready to go.
          </Text>
        </Box>
      </Box>
    );

    /* ── Step Router ─────────────────────────────────────────── */
    const renderContent = () => {
      switch (quickStep) {
        case 0:
          return renderBasics();
        case 1:
          return renderAi();
        case 2:
          return renderInvite();
        default:
          return renderBasics();
      }
    };

    /* ── Main Render ─────────────────────────────────────────── */
    return (
      <Box className={className} style={containerStyle}>
        <style>{`
          @keyframes bhQuickSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bhQuickScale {
            0% { transform: scale(0); }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>

        {isComplete && renderCelebration()}

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <Box style={{
          flex: 1,
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px ${tokens.spacing[5]}px`,
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box' as const,
        }}>
          {renderContent()}
        </Box>

        {/* Navigation */}
        {!isComplete && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            <Box
              onClick={quickStep === 0 ? undefined : handleBack}
              style={{
                ...buttonSecondaryStyle,
                opacity: quickStep === 0 ? 0.4 : 1,
                cursor: quickStep === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} />
              Back
            </Box>

            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {quickStep === 2 && (
                <Box
                  onClick={() => {
                    setIsComplete(true);
                    setTimeout(() => onComplete?.(), 2500);
                  }}
                  style={{
                    ...buttonSecondaryStyle,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Skip
                </Box>
              )}

              <Box onClick={handleNext} style={buttonPrimaryStyle}>
                {quickStep >= QUICK_STEPS.length - 1 ? 'Finish' : 'Next'}
                {quickStep >= QUICK_STEPS.length - 1
                  ? <Rocket size={14} />
                  : <ChevronRight size={14} />}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
