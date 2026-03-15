'use client';

/**
 * BhTenantSetup - Full Preset
 * Complete multi-step tenant onboarding: Organization, Billing, AI Provider,
 * Teams, Invitations, First Job, and Celebration animation
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
  createProgressBarStyle,
  createSurfaceStyle,
  getCardPadding,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,

  createCardHoverStyles,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhTenantSetupProps,
  SetupStep,
  TeamSetup,
  InvitationItem,
  BillingMode,
} from '../../core';
import { getIndustryOptions, getSizeOptions, getTimezoneOptions, getRoleOptions } from '../../core';
import {
  Building2, CreditCard, Cpu, Users2, Mail, Briefcase,
  Check, ChevronRight, ChevronLeft, X, Upload, Plus,
  Minus, AlertCircle, Sparkles, Coins, Key, Zap,
  Globe, Tag, Loader2, CheckCircle2, XCircle, SkipForward,
  Rocket, ArrowRight, Trash2, UserPlus,
} from 'lucide-react';

const STEP_ICONS: Record<string, React.ReactNode> = {
  organization: <Building2 size={18} />,
  billing: <CreditCard size={18} />,
  'ai-provider': <Cpu size={18} />,
  teams: <Users2 size={18} />,
  invitations: <Mail size={18} />,
  'first-job': <Briefcase size={18} />,
};

export const FullBhTenantSetup = createPreset<BhTenantSetupProps>({
  name: 'BhTenantSetup.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTenantSetupProps>) => {
    const { Box, Text } = primitives;

    const {
      steps,
      currentStep,
      onStepChange,
      formData,
      onChange,
      providerTestResult,
      onTestProvider,
      onComplete,
      onSkip,
      isComplete: propIsComplete,
      className,
      style,
    } = props;

    /* ── Local State ─────────────────────────────────────────── */
    const [localCurrentStep, setLocalCurrentStep] = useState(currentStep);
    const [localFormData, setLocalFormData] = useState(formData);
    const [localProviderTestResult, setLocalProviderTestResult] = useState(providerTestResult);
    const [localInvitations, setLocalInvitations] = useState<InvitationItem[]>(formData.invitations || []);
    const [showSkip, setShowSkip] = useState(false);
    const [localIsComplete, setLocalIsComplete] = useState(propIsComplete);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const surfaceMd = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverLift = getHoverTransform(tokens);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const paddingVal = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);
    const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const isLastStep = localCurrentStep >= steps.length - 1;
    const currentStepData = steps[localCurrentStep];
    const completedCount = steps.filter((s) => s.isComplete).length;
    const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    const containerStyle: React.CSSProperties = {
      ...surfaceMd,
      minHeight: '100%',
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      overflow: 'hidden',
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: tokens.spacing[1],
      display: 'block',
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
      if (isLastStep) {
        setLocalIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 3000);
      } else {
        const next = localCurrentStep + 1;
        setLocalCurrentStep(next);
        onStepChange?.(next);
      }
    };

    const handleBack = () => {
      if (localCurrentStep > 0) {
        const prev = localCurrentStep - 1;
        setLocalCurrentStep(prev);
        onStepChange?.(prev);
      }
    };

    const handleSkip = () => {
      if (!isLastStep) {
        const next = localCurrentStep + 1;
        setLocalCurrentStep(next);
        onStepChange?.(next);
        onSkip?.();
      }
    };

    /* ── Progress Stepper ────────────────────────────────────── */
    const renderStepper = () => (
      <Box style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: tokens.spacing[1],
        padding: `${tokens.spacing[6]}px ${tokens.spacing[5]}px`,
      }}>
        {/* Progress bar */}
        <Box style={{
          marginBottom: tokens.spacing[4],
        }}>
          <Box style={{ display: 'flex',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[2],
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[700],
            }}>
              {progressPercent}% Complete
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
            }}>
              Step {localCurrentStep + 1} of {steps.length}
            </Text>
          </Box>
          <Box style={{
            height: 6,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[200],
            overflow: 'hidden',
          }}>
            <Box style={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[500],
              transition: `width 0.4s ${tokens.motion.spring}`,
            }} />
          </Box>
        </Box>

        {steps.map((step, idx) => {
          const isCurrentStep = idx === localCurrentStep;
          const isPast = step.isComplete;
          const stepIcon = STEP_ICONS[step.key] ?? <Text style={{ fontSize: tokens.typography.fontSize.sm }}>{idx + 1}</Text>;
          return (
            <Box key={step.key}>
              <Box
                onClick={() => {
                  if (isPast || isCurrentStep) {
                    setLocalCurrentStep(idx);
                    onStepChange?.(idx);
                  }
                }}
                onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                style={{
                  ...hoverTransition,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: isPast || isCurrentStep ? 'pointer' : 'default',
                  backgroundColor: isCurrentStep ? tokens.colors.primaryScale[50] : 'transparent',
                  opacity: !isPast && !isCurrentStep ? 0.5 : 1,
                }}
              >
                {/* Step circle with SVG check */}
                <Box style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: isPast
                    ? tokens.colors.successScale[500]
                    : isCurrentStep
                      ? tokens.colors.primaryScale[500]
                      : tokens.colors.neutral[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: isPast || isCurrentStep ? tokens.colors.common.white : tokens.colors.neutral[500],
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  {isPast ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="none" />
                      <polyline
                        points="4,8 7,11 12,5"
                        stroke={tokens.colors.common.white}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{stepIcon}</Text>
                  )}
                </Box>

                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isCurrentStep ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                    color: isCurrentStep ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                    margin: 0,
                  }}>
                    {step.label}
                  </Text>
                  {step.description && isCurrentStep && (
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      margin: `${tokens.spacing[1]}px 0 0 0`,
                    }}>
                      {step.description}
                    </Text>
                  )}
                </Box>

                {isPast && <Check size={14} color={tokens.colors.successScale[500]} />}
              </Box>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <Box style={{
                  marginLeft: 18 + tokens.spacing[3],
                  width: 2,
                  height: 12,
                  backgroundColor: isPast ? tokens.colors.successScale[300] : tokens.colors.neutral[200],
                  transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }} />
              )}
            </Box>
          );
        })}
      </Box>
    );

    /* ── Step 1: Organization ────────────────────────────────── */
    const renderOrganization = () => (
      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        <Text style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
          margin: 0,
        }}>
          Tell us about your company
        </Text>
        <Text style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          margin: 0,
        }}>
          This information helps us customize your BitHire experience.
        </Text>

        {/* Company Name */}
        <Box>
          <Text style={labelStyle}>
            Company Name <Text style={{ color: tokens.colors.errorScale[500] }}>*</Text>
          </Text>
          <input
            type="text"
            value={localFormData.orgName}
            onChange={(e) => updateFormData({ orgName: e.target.value })}
            placeholder="Enter your company name"
            style={inputStyle}
          />
        </Box>

        {/* Logo Upload */}
        <Box>
          <Text style={labelStyle}>Company Logo</Text>
          <Box style={{ 
            ...hoverTransition,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${tokens.spacing[6]}px`,
            borderRadius: tokens.borderRadius.lg,
            border: `2px dashed ${tokens.colors.neutral[300]}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            {localFormData.logo ? (
              <Box style={{ textAlign: 'center' as const }}>
                <img
                  src={localFormData.logo}
                  alt="Company logo"
                  style={{
                    maxWidth: 120,
                    maxHeight: 60,
                    objectFit: 'contain' as const,
                    marginBottom: tokens.spacing[2],
                  }}
                />
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.primaryScale[600],
                  margin: 0,
                }}>
                  Click to change
                </Text>
              </Box>
            ) : (
              <>
                <Upload size={28} color={tokens.colors.neutral[400]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  margin: `${tokens.spacing[2]}px 0 0 0`,
                }}>
                  Drop your logo here or click to upload
                </Text>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  margin: `${tokens.spacing[1]}px 0 0 0`,
                }}>
                  SVG, PNG or JPG (max 2MB)
                </Text>
              </>
            )}
          </Box>
        </Box>

        {/* Industry */}
        <Box>
          <Text style={labelStyle}>Industry</Text>
          <select
            value={localFormData.industry}
            onChange={(e) => updateFormData({ industry: e.target.value })}
            style={selectStyle}
          >
            <option value="">Select industry</option>
            {getIndustryOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Box>

        {/* Company Size */}
        <Box>
          <Text style={labelStyle}>Company Size</Text>
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[2],
          }}>
            {getSizeOptions().map((opt) => (
              <Box
                key={opt.value}
                onClick={() => updateFormData({ size: opt.value })}
                style={{
                  ...hoverTransition,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${localFormData.size === opt.value
                    ? tokens.colors.primaryScale[300]
                    : tokens.colors.neutral[200]}`,
                  backgroundColor: localFormData.size === opt.value
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.common.white,
                  color: localFormData.size === opt.value
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: localFormData.size === opt.value
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  textAlign: 'center' as const,
                }}
              >
                {opt.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Timezone */}
        <Box>
          <Text style={labelStyle}>Timezone</Text>
          <select
            value={localFormData.timezone}
            onChange={(e) => updateFormData({ timezone: e.target.value })}
            style={selectStyle}
          >
            <option value="">Select timezone</option>
            {getTimezoneOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Box>
      </Box>
    );

    /* ── Step 2: Billing ─────────────────────────────────────── */
    const renderBilling = () => {
      const billingOptions: Array<{
        mode: BillingMode;
        title: string;
        description: string;
        features: string[];
        icon: React.ReactNode;
        recommended?: boolean;
      }> = [
        {
          mode: 'token_pool',
          title: 'Token Pool',
          description: 'Pre-purchase AI tokens and use them across all interviews',
          features: [
            'Pay-as-you-go flexibility',
            'Shared pool across all jobs',
            'Volume discounts available',
            'Automatic top-up option',
            'Usage analytics dashboard',
          ],
          icon: <Coins size={24} />,
          recommended: true,
        },
        {
          mode: 'byoc',
          title: 'Bring Your Own Credits',
          description: 'Connect your own AI provider API key for full control',
          features: [
            'Use your existing API key',
            'No token purchasing needed',
            'Full provider control',
            'Custom model selection',
            'Direct billing from provider',
          ],
          icon: <Key size={24} />,
        },
      ];

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            Choose your billing model
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Select how you want to pay for AI-powered interviews.
          </Text>

          <Box style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[4],
          }}>
            {billingOptions.map((option, i) => {
              const isSelected = localFormData.billingMode === option.mode;

              return (
                <Box
                  key={option.mode}
                  onClick={() => updateFormData({ billingMode: option.mode })}
                  style={{
                    ...animStyle(i),
                    ...cardBase,
                    ...hoverTransition,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected
                      ? tokens.colors.primaryScale[400]
                      : tokens.colors.neutral[200]}`,
                    backgroundColor: isSelected
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.common.white,
                    position: 'relative' as const,
                  }}
                >
                  {option.recommended && (
                    <Box style={{
                      position: 'absolute' as const,
                      top: -1,
                      right: tokens.spacing[3],
                      ...createBadgeStyle(tokens, 'primary'),
                      borderRadius: `0 0 ${tokens.borderRadius.md} ${tokens.borderRadius.md}`,
                    }}>
                      Recommended
                    </Box>
                  )}

                  <Box style={{
                    width: 48,
                    height: 48,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: isSelected
                      ? tokens.colors.primaryScale[100]
                      : tokens.colors.neutral[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[3],
                  }}>
                    {option.icon}
                  </Box>

                  <Text style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    margin: `0 0 ${tokens.spacing[1]}px 0`,
                  }}>
                    {option.title}
                  </Text>

                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    margin: `0 0 ${tokens.spacing[3]}px 0`,
                  }}>
                    {option.description}
                  </Text>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: tokens.spacing[2],
                  }}>
                    {option.features.map((feature, fIdx) => (
                      <li key={fIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}>
                        <Check size={14} color={isSelected
                          ? tokens.colors.primaryScale[500]
                          : tokens.colors.neutral[400]} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Selection indicator */}
                  <Box style={{
                    marginTop: tokens.spacing[4],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: isSelected
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[100],
                    color: isSelected
                      ? tokens.colors.common.white
                      : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                  }}>
                    {isSelected ? 'Selected' : 'Select'}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    };

    /* ── Step 3: AI Provider ─────────────────────────────────── */
    const renderAiProvider = () => {
      const providers = [
        { value: 'openai', label: 'OpenAI', description: 'GPT-4o, GPT-4.5' },
        { value: 'anthropic', label: 'Anthropic', description: 'Claude Opus, Claude Sonnet' },
        { value: 'google', label: 'Google AI', description: 'Gemini Pro, Gemini Ultra' },
      ];

      const testStatus = localProviderTestResult?.status;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            Connect your AI Provider
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Configure the AI service that will power your interviews.
          </Text>

          {/* Provider Selection */}
          <Box>
            <Text style={labelStyle}>AI Provider</Text>
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: tokens.spacing[3],
            }}>
              {providers.map((prov, i) => {
                const isSelected = localFormData.providerConfig.provider === prov.value;

                return (
                  <Box
                    key={prov.value}
                    onClick={() => updateFormData({
                      providerConfig: { ...localFormData.providerConfig, provider: prov.value },
                    })}
                    style={{
                      ...animStyle(i),
                      ...cardBase,
                      ...hoverTransition,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected
                        ? tokens.colors.primaryScale[400]
                        : tokens.colors.neutral[200]}`,
                      backgroundColor: isSelected
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.common.white,
                      textAlign: 'center' as const,
                    }}
                  >
                    <Cpu size={20} color={isSelected
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[400]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      margin: `${tokens.spacing[2]}px 0 0 0`,
                    }}>
                      {prov.label}
                    </Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      margin: `${tokens.spacing[1]}px 0 0 0`,
                    }}>
                      {prov.description}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* API Key Input */}
          <Box>
            <Text style={labelStyle}>
              API Key <Text style={{ color: tokens.colors.errorScale[500] }}>*</Text>
            </Text>
            <Box style={{ position: 'relative' as const }}>
              <input
                type="password"
                value={localFormData.providerConfig.apiKey}
                onChange={(e) => updateFormData({
                  providerConfig: { ...localFormData.providerConfig, apiKey: e.target.value },
                })}
                placeholder="sk-••••••••••••••••"
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace',
                  paddingRight: tokens.spacing[12],
                }}
              />
              <Key size={16} color={tokens.colors.neutral[400]} style={{
                position: 'absolute' as const,
                right: tokens.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
              }} />
            </Box>
          </Box>

          {/* Test Connection */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
          }}>
            <Box
              onClick={localFormData.providerConfig.apiKey ? () => {
                setLocalProviderTestResult({ provider: localFormData.providerConfig.provider, status: 'testing' });
                onTestProvider?.();
              } : undefined}
              style={{
                ...buttonPrimaryStyle,
                opacity: !localFormData.providerConfig.apiKey ? 0.5 : 1,
                cursor: !localFormData.providerConfig.apiKey ? 'not-allowed' : 'pointer',
              }}
            >
              <Zap size={14} />
              Test Connection
            </Box>

            {/* Live test status */}
            {testStatus && (
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: testStatus === 'testing'
                  ? tokens.colors.infoScale[50]
                  : testStatus === 'success'
                    ? tokens.colors.successScale[50]
                    : tokens.colors.errorScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${testStatus === 'testing'
                  ? tokens.colors.infoScale[200]
                  : testStatus === 'success'
                    ? tokens.colors.successScale[200]
                    : tokens.colors.errorScale[200]}`,
              }}>
                {testStatus === 'testing' && (
                  <>
                    <Loader2 size={16} color={tokens.colors.infoScale[600]} style={{
                      animation: 'bhTenantSpin 1s linear infinite',
                    }} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.infoScale[700],
                    }}>
                      Testing connection...
                    </Text>
                  </>
                )}
                {testStatus === 'success' && (
                  <>
                    <CheckCircle2 size={16} color={tokens.colors.successScale[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.successScale[700],
                    }}>
                      Connected successfully
                      {localProviderTestResult?.latencyMs ? ` (${localProviderTestResult.latencyMs}ms)` : ''}
                    </Text>
                  </>
                )}
                {testStatus === 'failure' && (
                  <>
                    <XCircle size={16} color={tokens.colors.errorScale[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.errorScale[700],
                    }}>
                      {localProviderTestResult?.error ?? 'Connection failed'}
                    </Text>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    /* ── Step 4: Teams ───────────────────────────────────────── */
    const renderTeams = () => {
      const [localTeams, setLocalTeams] = useState<TeamSetup[]>(localFormData.teams || []);
      const [newTag, setNewTag] = useState('');

      const addTeam = () => {
        setLocalTeams([...localTeams, { name: '', specializations: [], capacity: 5 }]);
      };

      const removeTeam = (idx: number) => {
        setLocalTeams(localTeams.filter((_, i) => i !== idx));
      };

      const updateTeam = (idx: number, updates: Partial<TeamSetup>) => {
        const updated = [...localTeams];
        updated[idx] = { ...updated[idx], ...updates };
        setLocalTeams(updated);
        updateFormData({ teams: updated });
      };

      const addSpecialization = (teamIdx: number, tag: string) => {
        if (!tag.trim()) return;
        const updated = [...localTeams];
        if (!updated[teamIdx].specializations.includes(tag.trim())) {
          updated[teamIdx] = {
            ...updated[teamIdx],
            specializations: [...updated[teamIdx].specializations, tag.trim()],
          };
          setLocalTeams(updated);
          updateFormData({ teams: updated });
        }
      };

      const removeSpecialization = (teamIdx: number, specIdx: number) => {
        const updated = [...localTeams];
        updated[teamIdx] = {
          ...updated[teamIdx],
          specializations: updated[teamIdx].specializations.filter((_, i) => i !== specIdx),
        };
        setLocalTeams(updated);
        updateFormData({ teams: updated });
      };

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            Create your hiring teams
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Organize your recruiters and hiring managers into teams.
          </Text>

          {localTeams.map((team, teamIdx) => (
            <Box key={teamIdx} style={{
              ...animStyle(teamIdx),
              ...cardBase,
              position: 'relative' as const,
            }}>
              <Box
                onClick={() => removeTeam(teamIdx)}
                style={{
                  position: 'absolute' as const,
                  top: tokens.spacing[3],
                  right: tokens.spacing[3],
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  padding: tokens.spacing[1],
                  borderRadius: tokens.borderRadius.sm,
                  display: 'flex',
                }}
              >
                <Trash2 size={16} color={tokens.colors.neutral[400]} />
              </Box>

              {/* Team Name */}
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Text style={labelStyle}>Team Name</Text>
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeam(teamIdx, { name: e.target.value })}
                  placeholder="e.g., Engineering Hiring"
                  style={inputStyle}
                />
              </Box>

              {/* Specializations Multi-Tag Input */}
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Text style={labelStyle}>Specializations</Text>
                <Box style={{
                  display: 'flex',
                  flexWrap: 'wrap' as const,
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  minHeight: 42,
                  alignItems: 'center',
                }}>
                  {team.specializations.map((spec, sIdx) => (
                    <Text key={sIdx} style={{
                      ...animStyle(sIdx),
                      ...createBadgeStyle(tokens, 'primary'),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <Tag size={10} />
                      {spec}
                      <Box
                        onClick={() => removeSpecialization(teamIdx, sIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          padding: 0,
                          display: 'flex',
                          marginLeft: tokens.spacing[1],
                        }}
                      >
                        <X size={10} color={tokens.colors.primaryScale[600]} />
                      </Box>
                    </Text>
                  ))}
                  <input
                    type="text"
                    placeholder="Type and press Enter"
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[900],
                      flex: 1,
                      minWidth: 100,
                      padding: `${tokens.spacing[1]}px`,
                      backgroundColor: 'transparent',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialization(teamIdx, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}

                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                      e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                    }}
                  />
                </Box>
              </Box>

              {/* Capacity Slider */}
              <Box>
                <Text style={labelStyle}>
                  Team Capacity: <strong>{team.capacity}</strong> members
                </Text>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={team.capacity}
                  onChange={(e) => updateTeam(teamIdx, { capacity: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    accentColor: tokens.colors.primaryScale[600],
                    height: 6,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                />
                <Box style={{ display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  <Text>1</Text>
                  <Text>50</Text>
                </Box>
              </Box>
            </Box>
          ))}

          <Box
            onClick={addTeam}
            style={{
              ...buttonSecondaryStyle,
              width: '100%',
              justifyContent: 'center',
              padding: `${tokens.spacing[3]}px`,
              border: `2px dashed ${tokens.colors.neutral[300]}`,
            }}
          >
            <Plus size={16} />
            Add Team
          </Box>
        </Box>
      );
    };

    /* ── Step 5: Invitations ─────────────────────────────────── */
    const renderInvitations = () => {
      const addInvitation = () => {
        setLocalInvitations([...localInvitations, { email: '', role: 'recruiter', message: '' }]);
      };

      const removeInvitation = (idx: number) => {
        setLocalInvitations(localInvitations.filter((_, i) => i !== idx));
      };

      const updateInvitation = (idx: number, updates: Partial<InvitationItem>) => {
        const updated = [...localInvitations];
        updated[idx] = { ...updated[idx], ...updates };
        setLocalInvitations(updated);
        updateFormData({ invitations: updated });
      };

      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            Invite your team
          </Text>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Send invitations to get your team onboard.
          </Text>

          {localInvitations.map((invite, idx) => (
            <Box key={idx} style={{
              ...animStyle(idx),
              ...cardBase,
              position: 'relative' as const,
            }}>
              <Box
                onClick={() => removeInvitation(idx)}
                style={{
                  position: 'absolute' as const,
                  top: tokens.spacing[3],
                  right: tokens.spacing[3],
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  padding: tokens.spacing[1],
                  display: 'flex',
                }}
              >
                <X size={16} color={tokens.colors.neutral[400]} />
              </Box>

              <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                {/* Email */}
                <Box>
                  <Text style={labelStyle}>Email</Text>
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(e) => updateInvitation(idx, { email: e.target.value })}
                    placeholder="colleague@company.com"
                    style={inputStyle}
                  />
                </Box>
                {/* Role */}
                <Box>
                  <Text style={labelStyle}>Role</Text>
                  <select
                    value={invite.role}
                    onChange={(e) => updateInvitation(idx, { role: e.target.value })}
                    style={selectStyle}
                  >
                    {getRoleOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </Box>
              </Box>

              {/* Personal Message */}
              <Box>
                <Text style={labelStyle}>Welcome Message (optional)</Text>
                <textarea
                  value={invite.message ?? ''}
                  onChange={(e) => updateInvitation(idx, { message: e.target.value })}
                  placeholder="Add a personal welcome message..."
                  rows={2}
                  style={{
                    ...inputStyle,
                    resize: 'vertical' as const,
                  }}
                />
              </Box>
            </Box>
          ))}

          <Box
            onClick={addInvitation}
            style={{
              ...buttonSecondaryStyle,
              width: '100%',
              justifyContent: 'center',
              padding: `${tokens.spacing[3]}px`,
              border: `2px dashed ${tokens.colors.neutral[300]}`,
            }}
          >
            <UserPlus size={16} />
            Add Another Invitation
          </Box>
        </Box>
      );
    };

    /* ── Step 6: First Job ───────────────────────────────────── */
    const renderFirstJob = () => (
      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        <Text style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
          margin: 0,
        }}>
          Create your first job
        </Text>
        <Text style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          margin: 0,
        }}>
          Optionally create your first job posting or skip to finish setup.
        </Text>

        <Box style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[4],
        }}>
          {/* Create Job Card */}
          <Box
            onClick={handleNext}
            style={{
              ...cardBase,
              ...hoverTransition,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              textAlign: 'center' as const,
              padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
            }}
          >
            <Box style={{
              width: 56,
              height: 56,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[3],
            }}>
              <Briefcase size={24} color={tokens.colors.primaryScale[600]} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: `0 0 ${tokens.spacing[1]}px 0`,
            }}>
              Create a Job
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              Use the guided wizard to post your first position
            </Text>
          </Box>

          {/* Skip Card */}
          <Box
            onClick={() => {
              setLocalIsComplete(true);
              setTimeout(() => onComplete?.(), 3000);
            }}
            style={{
              ...cardBase,
              ...hoverTransition,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              textAlign: 'center' as const,
              padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box style={{
              width: 56,
              height: 56,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[3],
            }}>
              <SkipForward size={24} color={tokens.colors.neutral[500]} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: `0 0 ${tokens.spacing[1]}px 0`,
            }}>
              Skip for Now
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              You can create jobs later from the dashboard
            </Text>
          </Box>
        </Box>
      </Box>
    );

    /* ── Celebration ─────────────────────────────────────────── */
    const renderCelebration = () => {
      const confettiColors = [
        tokens.colors.primaryScale[400],
        tokens.colors.successScale[400],
        tokens.colors.warningScale[400],
        tokens.colors.infoScale[400],
        tokens.colors.secondaryScale[400],
        tokens.colors.primaryScale[600],
        tokens.colors.successScale[600],
      ];

      const confettiPieces = Array.from({ length: 35 }, (_, i) => {
        const color = confettiColors[i % confettiColors.length];
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 1.2}s`;
        const duration = `${1.5 + Math.random() * 1.5}s`;
        const rotation = `${Math.random() * 360}deg`;
        const size = 6 + Math.random() * 6;

        return (
          <Box
            key={i}
            style={{
              position: 'absolute' as const,
              top: -20,
              left,
              width: size,
              height: size * 1.5,
              backgroundColor: color,
              borderRadius: size > 9 ? tokens.borderRadius.sm : '1px',
              transform: `rotate(${rotation})`,
              animation: `bhTenantConfetti ${duration} ease-out ${delay} forwards`,
              opacity: 0.9,
            }}
          />
        );
      });

      const nextSteps = [
        { icon: <Briefcase size={18} />, title: 'Post a Job', description: 'Create your first job posting' },
        { icon: <Users2 size={18} />, title: 'Build Your Team', description: 'Add more team members' },
        { icon: <Cpu size={18} />, title: 'Configure AI', description: 'Fine-tune interview settings' },
      ];

      return (
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
          overflow: 'hidden',
        }}>
          {confettiPieces}

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4],
            textAlign: 'center' as const,
            zIndex: 51,
            maxWidth: 500,
            padding: tokens.spacing[5],
          }}>
            {/* Animated green check circle */}
            <Box style={{
              width: 80,
              height: 80,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[4],
              animation: 'bhTenantScale 0.5s ease-out',
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill={tokens.colors.successScale[500]} />
                <polyline
                  points="12,20 18,26 28,14"
                  stroke={tokens.colors.common.white}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: 0,
                    animation: 'bhTenantCheckDraw 0.6s ease-out 0.3s both',
                  }}
                />
              </svg>
            </Box>

            <Text style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
            }}>
              Your BitHire is ready!
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[600],
              margin: `${tokens.spacing[2]}px 0 ${tokens.spacing[5]}px 0`,
            }}>
              Everything is set up. Here are some next steps to get started.
            </Text>

            {/* Next steps guide cards */}
            <Box style={{
              display: 'flex',
              gap: tokens.spacing[3],
              justifyContent: 'center',
            }}>
              {nextSteps.map((step, idx) => (
                <Box key={idx} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2],
                  ...animStyle(idx),
                  ...cardBase,
                  ...hoverTransition,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  flex: 1,
                  textAlign: 'center' as const,
                }}>
                  <Box style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    marginBottom: tokens.spacing[2],
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {step.icon}
                  </Box>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    margin: 0,
                  }}>
                    {step.title}
                  </Text>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    margin: `${tokens.spacing[1]}px 0 0 0`,
                  }}>
                    {step.description}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    };

    /* ── Step Content Router ─────────────────────────────────── */
    const renderStepContent = () => {
      if (!currentStepData) return null;

      switch (currentStepData.key) {
        case 'organization':
          return renderOrganization();
        case 'billing':
          return renderBilling();
        case 'ai-provider':
          return renderAiProvider();
        case 'teams':
          return renderTeams();
        case 'invitations':
          return renderInvitations();
        case 'first-job':
          return renderFirstJob();
        default:
          return renderOrganization();
      }
    };

    /* ── Navigation Footer ───────────────────────────────────── */
    const renderNavigation = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
      }}>
        <Box
          onClick={localCurrentStep === 0 ? undefined : handleBack}
          style={{
            ...buttonSecondaryStyle,
            opacity: localCurrentStep === 0 ? 0.4 : 1,
            cursor: localCurrentStep === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} />
          Back
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {currentStepData?.key !== 'first-job' && (
            <Box
              onClick={handleSkip}
              style={{
                ...buttonSecondaryStyle,
                color: tokens.colors.neutral[500],
              }}
            >
              <SkipForward size={14} />
              Skip
            </Box>
          )}

          {currentStepData?.key !== 'first-job' && (
            <Box onClick={handleNext} style={buttonPrimaryStyle}>
              {isLastStep ? 'Complete Setup' : 'Continue'}
              {isLastStep ? <Rocket size={14} /> : <ChevronRight size={14} />}
            </Box>
          )}
        </Box>
      </Box>
    );

    /* ── Main Render ─────────────────────────────────────────── */
    return (
      <Box className={className} style={containerStyle}>
        <style>{`
          @keyframes bhTenantSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bhTenantConfetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(80vh) rotate(720deg); opacity: 0; }
          }
          @keyframes bhTenantScale {
            0% { transform: scale(0); }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes bhTenantCheckDraw {
            0% { stroke-dashoffset: 30; }
            100% { stroke-dashoffset: 0; }
          }
        `}</style>

        {localIsComplete && renderCelebration()}

        <Box style={{
          display: 'flex',
          minHeight: '100%',
        }}>
          {/* Sidebar Stepper */}
          <Box style={{
            width: 280,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            flexShrink: 0,
          }}>
            {renderStepper()}
          </Box>

          {/* Main Content Area */}
          <Box style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
            {/* Step Content */}
            <Box style={{
              flex: 1,
              padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
              overflowY: 'auto' as const,
            }}>
              {renderStepContent()}
            </Box>

            {/* Navigation Footer */}
            {!localIsComplete && renderNavigation()}
          </Box>
        </Box>
      </Box>
    );
  },
});
