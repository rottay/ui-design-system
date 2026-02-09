'use client';

/**
 * BhOnboardingFlow - Admin Setup Preset
 * Multi-step admin onboarding: Org info, Billing, Provider, Teams, Invite, First Job
 * Includes progress stepper, form validation, live preview sidebar,
 * help tooltips, and celebration animation on completion
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { BhOnboardingFlowProps, FormField } from '../../core';
import {
  Building2, CreditCard, Cpu, Users2, Mail, Briefcase,
  Check, ChevronRight, ChevronLeft, HelpCircle, X,
  Eye, ExternalLink, AlertCircle, Sparkles, ArrowRight, SkipForward
} from 'lucide-react';

const ADMIN_STEP_ICONS: Record<string, React.ReactNode> = {
  'org-info': <Building2 size={18} />,
  billing: <CreditCard size={18} />,
  provider: <Cpu size={18} />,
  teams: <Users2 size={18} />,
  invite: <Mail size={18} />,
  'first-job': <Briefcase size={18} />,
};

export const AdminSetupBhOnboardingFlow = createPreset<BhOnboardingFlowProps>({
  name: 'BhOnboardingFlow.AdminSetup',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhOnboardingFlowProps>) => {
    const { Box, Stack } = primitives;

    const {
      steps,
      currentStep,
      formData = {},
      formFields = [],
      previewItems = [],
      helpTooltips = [],
      onStepChange,
      onFormChange,
      onComplete,
      onSkip,
      title = 'Set Up Your Workspace',
      subtitle = 'Complete these steps to get your BitHire account ready',
      logo,
      nextLabel = 'Continue',
      backLabel = 'Back',
      skipLabel = 'Skip for now',
      completeLabel = 'Complete Setup',
      showPreview = true,
      className,
      style,
    } = props;

    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showCelebration, setShowCelebration] = useState(false);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const isLastStep = currentStep >= steps.length - 1;
    const currentStepData = steps[currentStep];
    const completedCount = steps.filter((s) => s.isComplete).length;
    const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);

    const validateCurrentStep = useCallback((): boolean => {
      const errors: Record<string, string> = {};
      const requiredFields = formFields.filter((f) => f.required);
      for (const field of requiredFields) {
        const val = formData[field.name];
        if (val === undefined || val === null || val === '') {
          errors[field.name] = `${field.label} is required`;
        }
      }
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    }, [formFields, formData]);

    const handleNext = () => {
      if (!validateCurrentStep()) return;
      if (isLastStep) {
        setShowCelebration(true);
        setTimeout(() => {
          onComplete?.();
        }, 2500);
      } else {
        onStepChange?.(currentStep + 1);
      }
    };

    const handleBack = () => {
      if (currentStep > 0) {
        setValidationErrors({});
        onStepChange?.(currentStep - 1);
      }
    };

    const handleSkip = () => {
      if (currentStepData) {
        onSkip?.(currentStepData.key);
        if (!isLastStep) {
          onStepChange?.(currentStep + 1);
        }
      }
    };

    const currentTooltip = helpTooltips.find((t) => t.targetStep === currentStepData?.key);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }),
      minHeight: '100%',
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      overflow: 'hidden',
      ...style,
    };

    /* ── Celebration Animation ─────────────────────────────────── */
    const renderCelebration = () => {
      if (!showCelebration) return null;

      const confettiColors = [
        tokens.colors.primaryScale[400],
        tokens.colors.successScale[400],
        tokens.colors.warningScale[400],
        tokens.colors.infoScale[400],
        tokens.colors.secondaryScale[400],
        tokens.colors.primaryScale[600],
        tokens.colors.successScale[600],
      ];

      const confettiPieces = Array.from({ length: 40 }, (_, i) => {
        const color = confettiColors[i % confettiColors.length];
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 1.2}s`;
        const duration = `${1.5 + Math.random() * 1.5}s`;
        const rotation = `${Math.random() * 360}deg`;
        const size = 6 + Math.random() * 6;

        return (
          <div
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
              animation: `confettiFall ${duration} ease-out ${delay} forwards`,
              opacity: 0.9,
            }}
          />
        );
      });

      return (
        <div style={{
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
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(80vh) rotate(720deg); opacity: 0; }
            }
            @keyframes celebrationPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
          {confettiPieces}
          <div style={{
            textAlign: 'center' as const,
            zIndex: 51,
            animation: 'celebrationPulse 1.5s ease-in-out infinite',
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[4],
            }}>
              <Sparkles size={36} color={tokens.colors.successScale[600]} />
            </div>
            <h2 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
            }}>
              All Set!
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[600],
              marginTop: tokens.spacing[2],
            }}>
              Your workspace is ready. Let&apos;s start hiring.
            </p>
          </div>
        </div>
      );
    };

    /* ── Progress Stepper ──────────────────────────────────────── */
    const renderStepper = () => {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[6]}px ${tokens.spacing[5]}px`,
        }}>
          {steps.map((step, idx) => {
            const isCurrentStep = idx === currentStep;
            const isPast = step.isComplete;
            const stepIcon = ADMIN_STEP_ICONS[step.key] ?? <span style={{ fontSize: tokens.typography.fontSize.sm }}>{idx + 1}</span>;

            return (
              <div key={step.key}>
                <div
                  onClick={() => {
                    if (isPast || isCurrentStep) onStepChange?.(idx);
                  }}
                  style={{
                    ...hoverTransition,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: isPast || isCurrentStep ? 'pointer' : 'default',
                    backgroundColor: isCurrentStep
                      ? tokens.colors.primaryScale[50]
                      : 'transparent',
                    opacity: !isPast && !isCurrentStep ? 0.5 : 1,
                  }}
                >
                  {/* Step Number Circle */}
                  <div style={{
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
                        <path
                          d="M3 8L6.5 11.5L13 4.5"
                          stroke={tokens.colors.common.white}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            strokeDasharray: 20,
                            strokeDashoffset: 0,
                            animation: 'none',
                          }}
                        />
                      </svg>
                    ) : (
                      <span style={{ fontSize: tokens.typography.fontSize.xs }}>{stepIcon}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isCurrentStep ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                      color: isCurrentStep ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                      margin: 0,
                    }}>
                      {step.label}
                    </p>
                    {step.description && isCurrentStep && (
                      <p style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        margin: `${tokens.spacing[0]}px 0 0`,
                      }}>
                        {step.description}
                      </p>
                    )}
                  </div>

                  {isPast && (
                    <Check size={14} color={tokens.colors.successScale[500]} />
                  )}
                </div>

                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div style={{
                    marginLeft: 18 + tokens.spacing[3],
                    width: 2,
                    height: 16,
                    backgroundColor: isPast
                      ? tokens.colors.successScale[300]
                      : tokens.colors.neutral[200],
                    transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      );
    };

    /* ── Form Fields Rendering ─────────────────────────────────── */
    const renderFormField = (field: FormField) => {
      const hasError = !!validationErrors[field.name] || !!field.error;
      const errorMsg = validationErrors[field.name] ?? field.error;
      const inputValue = formData[field.name] ?? field.value ?? '';

      const labelStyle: React.CSSProperties = {
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        color: tokens.colors.neutral[700],
        marginBottom: tokens.spacing[1],
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
      };

      const baseInputStyle: React.CSSProperties = {
        width: '100%',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
        borderRadius: tokens.borderRadius.md,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${hasError ? tokens.colors.errorScale[300] : tokens.colors.neutral[300]}`,
        fontSize: tokens.typography.fontSize.sm,
        color: tokens.colors.neutral[900],
        backgroundColor: tokens.colors.common.white,
        outline: 'none',
        transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
        boxSizing: 'border-box' as const,
      };

      return (
        <div key={field.name} style={{ marginBottom: tokens.spacing[4] }}>
          <label style={labelStyle}>
            {field.label}
            {field.required && (
              <span style={{ color: tokens.colors.errorScale[500], fontSize: tokens.typography.fontSize.xs }}>*</span>
            )}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              value={String(inputValue)}
              placeholder={field.placeholder}
              onChange={(e) => {
                onFormChange?.(field.name, e.target.value);
                if (validationErrors[field.name]) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next[field.name];
                    return next;
                  });
                }
              }}
              rows={3}
              style={{ ...baseInputStyle, resize: 'vertical' as const }}
            />
          ) : field.type === 'select' ? (
            <select
              value={String(inputValue)}
              onChange={(e) => {
                onFormChange?.(field.name, e.target.value);
                if (validationErrors[field.name]) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next[field.name];
                    return next;
                  });
                }
              }}
              style={baseInputStyle}
            >
              <option value="">{field.placeholder ?? 'Select...'}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'toggle' ? (
            <div
              onClick={() => {
                onFormChange?.(field.name, !inputValue);
              }}
              style={{
                ...hoverTransition,
                width: 44,
                height: 24,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: inputValue ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                padding: 2,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.common.white,
                boxShadow: tokens.shadows.sm,
                transform: inputValue ? 'translateX(20px)' : 'translateX(0)',
                transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
              }} />
            </div>
          ) : (
            <input
              type={field.type}
              value={String(inputValue)}
              placeholder={field.placeholder}
              onChange={(e) => {
                onFormChange?.(field.name, e.target.value);
                if (validationErrors[field.name]) {
                  setValidationErrors((prev) => {
                    const next = { ...prev };
                    delete next[field.name];
                    return next;
                  });
                }
              }}
              style={baseInputStyle}
            />
          )}

          {field.helpText && !hasError && (
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              marginTop: tokens.spacing[1],
              margin: `${tokens.spacing[1]}px 0 0`,
            }}>
              {field.helpText}
            </p>
          )}

          {hasError && (
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
              marginTop: tokens.spacing[1],
              margin: `${tokens.spacing[1]}px 0 0`,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <AlertCircle size={12} />
              {errorMsg}
            </p>
          )}
        </div>
      );
    };

    /* ── Step Content Area ──────────────────────────────────────── */
    const renderStepContent = () => {
      return (
        <div style={{ flex: 1, padding: tokens.spacing[6] }}>
          <div style={{ maxWidth: 560 }}>
            {/* Step header */}
            <div style={{ marginBottom: tokens.spacing[6] }}>
              <Stack direction="horizontal" align="center" gap={tokens.spacing[2]} style={{ marginBottom: tokens.spacing[2] }}>
                <span style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  fontSize: tokens.typography.fontSize.xs,
                }}>
                  Step {currentStep + 1} of {steps.length}
                </span>
              </Stack>
              <h2 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                margin: 0,
              }}>
                {currentStepData?.label ?? 'Setup'}
              </h2>
              {currentStepData?.description && (
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  margin: `${tokens.spacing[2]}px 0 0`,
                }}>
                  {currentStepData.description}
                </p>
              )}
            </div>

            {/* Form fields */}
            <div>
              {formFields.map((field) => renderFormField(field))}
            </div>

            {/* Help tooltip card */}
            {currentTooltip && activeTooltip === currentStepData?.key && (
              <div style={{
                ...cardBase,
                padding: tokens.spacing[4],
                marginTop: tokens.spacing[4],
                borderLeft: `4px solid ${tokens.colors.infoScale[500]}`,
                backgroundColor: tokens.colors.infoScale[50],
              }}>
                <Stack direction="horizontal" align="start" justify="space-between">
                  <Stack direction="horizontal" gap={tokens.spacing[2]} align="start">
                    <HelpCircle size={16} color={tokens.colors.infoScale[600]} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      {currentTooltip.title && (
                        <p style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.infoScale[800],
                          margin: 0,
                          marginBottom: tokens.spacing[1],
                        }}>
                          {currentTooltip.title}
                        </p>
                      )}
                      <p style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.infoScale[700],
                        margin: 0,
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        {currentTooltip.content}
                      </p>
                      {currentTooltip.learnMoreUrl && (
                        <a
                          href={currentTooltip.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.infoScale[600],
                            fontWeight: tokens.typography.fontWeight.medium,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            marginTop: tokens.spacing[2],
                            textDecoration: 'none',
                          }}
                        >
                          Learn more <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </Stack>
                  <button
                    onClick={() => setActiveTooltip(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      color: tokens.colors.infoScale[400],
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <X size={14} />
                  </button>
                </Stack>
              </div>
            )}

            {/* Show help toggle */}
            {currentTooltip && activeTooltip !== currentStepData?.key && (
              <button
                onClick={() => setActiveTooltip(currentStepData?.key ?? null)}
                style={{
                  ...hoverTransition,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.infoScale[600],
                  padding: `${tokens.spacing[2]}px 0`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  marginTop: tokens.spacing[2],
                }}
              >
                <HelpCircle size={14} />
                Need help with this step?
              </button>
            )}

            {/* Action buttons */}
            <Stack
              direction="horizontal"
              align="center"
              justify="space-between"
              style={{
                marginTop: tokens.spacing[8],
                paddingTop: tokens.spacing[5],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <div>
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    style={{
                      ...hoverTransition,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[700],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <ChevronLeft size={16} />
                    {backLabel}
                  </button>
                )}
              </div>

              <Stack direction="horizontal" gap={tokens.spacing[3]}>
                {onSkip && (
                  <button
                    onClick={handleSkip}
                    style={{
                      ...hoverTransition,
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <SkipForward size={14} />
                    {skipLabel}
                  </button>
                )}

                <button
                  onClick={handleNext}
                  style={{
                    ...hoverTransition,
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    boxShadow: tokens.shadows.sm,
                  }}
                >
                  {isLastStep ? completeLabel : nextLabel}
                  {isLastStep ? <Sparkles size={14} /> : <ChevronRight size={14} />}
                </button>
              </Stack>
            </Stack>
          </div>
        </div>
      );
    };

    /* ── Preview Sidebar ───────────────────────────────────────── */
    const renderPreviewSidebar = () => {
      if (!showPreview || previewItems.length === 0) return null;

      return (
        <div style={{
          width: 300,
          flexShrink: 0,
          borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: tokens.spacing[5],
          backgroundColor: isGlass && tokens.glass ? tokens.glass.bgLight : tokens.colors.neutral[50],
          backdropFilter: isGlass && tokens.glass ? tokens.glass.blurSm : undefined,
          WebkitBackdropFilter: isGlass && tokens.glass ? tokens.glass.blurSm : undefined,
        }}>
          <Stack direction="horizontal" align="center" gap={tokens.spacing[2]} style={{ marginBottom: tokens.spacing[4] }}>
            <Eye size={16} color={tokens.colors.neutral[500]} />
            <h4 style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[600],
              margin: 0,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Live Preview
            </h4>
          </Stack>

          <div style={{
            ...cardBase,
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.common.white,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {previewItems.map((item, idx) => (
                <div key={idx}>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[400],
                    margin: 0,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.04em',
                  }}>
                    {item.label}
                  </p>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    marginTop: tokens.spacing[1],
                    wordBreak: 'break-word' as const,
                  }}>
                    {item.value || (
                      <span style={{ color: tokens.colors.neutral[300], fontStyle: 'italic' }}>Not set</span>
                    )}
                  </div>
                  {idx < previewItems.length - 1 && (
                    <div style={{
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      marginTop: tokens.spacing[3],
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    /* ── Main Layout ───────────────────────────────────────────── */
    return (
      <div className={className} style={containerStyle}>
        {renderCelebration()}

        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          minHeight: '100%',
        }}>
          {/* Header */}
          <div style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[4]}>
              {logo && <div>{logo}</div>}
              <div>
                <h1 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {title}
                </h1>
                {subtitle && (
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    margin: `${tokens.spacing[1]}px 0 0`,
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {progressPercent}% complete
                  </span>
                  <div style={{
                    width: 120,
                    height: 6,
                    backgroundColor: tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      backgroundColor: progressPercent === 100
                        ? tokens.colors.successScale[500]
                        : tokens.colors.primaryScale[500],
                      borderRadius: tokens.borderRadius.full,
                      transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }} />
                  </div>
                </Stack>
              </div>
            </Stack>
          </div>

          {/* Body */}
          <div style={{
            display: 'flex',
            flex: 1,
          }}>
            {/* Left sidebar: stepper */}
            <div style={{
              width: 280,
              flexShrink: 0,
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              {renderStepper()}
            </div>

            {/* Main content */}
            {renderStepContent()}

            {/* Preview sidebar */}
            {renderPreviewSidebar()}
          </div>
        </div>
      </div>
    );
  },
});
