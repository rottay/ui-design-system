'use client';

/**
 * BhOnboardingFlow - Recruiter Welcome Preset
 * Streamlined onboarding for recruiters joining an existing workspace.
 * Steps: Welcome -> Profile -> Explore Interface -> Create First Job -> Import Candidates
 */

import {useState, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSurfaceStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhOnboardingFlowProps, FormField } from '../../core';
import {
  Sparkles, User, Compass, Briefcase, Upload,
  ChevronRight, ChevronLeft, Check, X, ArrowRight,
  SkipForward, HelpCircle, ExternalLink, AlertCircle,
  Hand, Layout, MousePointerClick, FileText, Users,
  Star, Rocket, Eye, Search, Filter
} from 'lucide-react';

const RECRUITER_STEP_ICONS: Record<string, React.ReactNode> = {
  welcome: <Hand size={18} />,
  profile: <User size={18} />,
  explore: <Compass size={18} />,
  'first-job': <Briefcase size={18} />,
  'import-candidates': <Upload size={18} />,
};

export const RecruiterWelcomeBhOnboardingFlow = createPreset<BhOnboardingFlowProps>({
  name: 'BhOnboardingFlow.RecruiterWelcome',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhOnboardingFlowProps>) => {
    const { Box, Stack } = primitives;

    const {
      steps,
      currentStep,
      formData = {},
      formFields: rawFormFields = [],
      previewItems: rawPreviewItems = [],
      helpTooltips: rawHelpTooltips = [],
      onStepChange,
      onFormChange,
      onComplete,
      onSkip,
      title = 'Welcome to BitHire',
      subtitle,
      logo,
      nextLabel = 'Continue',
      backLabel = 'Back',
      skipLabel = 'Skip for now',
      completeLabel = 'Start Recruiting',
      showPreview = true,
      className,
      style,
    } = props;

    const formFields = Array.isArray(rawFormFields) ? rawFormFields : [];
    const previewItems = Array.isArray(rawPreviewItems) ? rawPreviewItems : [];
    const helpTooltips = Array.isArray(rawHelpTooltips) ? rawHelpTooltips : [];

    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showCelebration, setShowCelebration] = useState(false);
    const [exploredFeatures, setExploredFeatures] = useState<Set<string>>(new Set());

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const isLastStep = currentStep >= steps.length - 1;
    const currentStepData = steps[currentStep];
    const completedCount = steps.filter((s) => s.isComplete).length;
    const progressPercent = steps.length > 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const currentTooltip = helpTooltips.find((t) => t.targetStep === currentStepData?.key);

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
      if (currentStepData?.key !== 'welcome' && currentStepData?.key !== 'explore') {
        if (!validateCurrentStep()) return;
      }
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

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }),
      minHeight: '100%',
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
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

      const confettiPieces = Array.from({ length: 35 }, (_, i) => {
        const color = confettiColors[i % confettiColors.length];
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 1}s`;
        const duration = `${1.5 + Math.random() * 1.5}s`;
        const rotation = `${Math.random() * 360}deg`;
        const size = 5 + Math.random() * 7;

        return (
          <div
            key={i}
            style={{
              position: 'absolute' as const,
              top: -16,
              left,
              width: size,
              height: size * 1.4,
              backgroundColor: color,
              borderRadius: size > 8 ? tokens.borderRadius.sm : '1px',
              transform: `rotate(${rotation})`,
              animation: `recruiterConfettiFall ${duration} ease-out ${delay} forwards`,
              opacity: 0.85,
            }}
          />
        );
      });

      return (
        <div style={{
          position: 'absolute' as const,
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isGlass && tokens.glass ? tokens.glass.bgHeavy : `${tokens.colors.common.white}ee`,
          backdropFilter: isGlass && tokens.glass ? tokens.glass.blur : undefined,
          WebkitBackdropFilter: isGlass && tokens.glass ? tokens.glass.blur : undefined,
        }}>
          <style>{`
            @keyframes recruiterConfettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(80vh) rotate(600deg); opacity: 0; }
            }
            @keyframes recruiterBounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
          `}</style>
          {confettiPieces}
          <div style={{
            textAlign: 'center' as const,
            zIndex: 51,
            animation: 'recruiterBounce 1.5s ease-in-out infinite',
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[4],
            }}>
              <Rocket size={32} color={tokens.colors.primaryScale[600]} />
            </div>
            <h2 style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
            }}>
              You&apos;re Ready!
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[600],
              marginTop: tokens.spacing[2],
            }}>
              Time to find great candidates.
            </p>
          </div>
        </div>
      );
    };

    /* ── Progress Header ───────────────────────────────────────── */
    const renderProgressHeader = () => {
      return (
        <div style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Stack direction="horizontal" align="center" justify="space-between">
            <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
              {logo && <div>{logo}</div>}
              <div>
                <h1 style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  letterSpacing: ptypo.headingLetterSpacing,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}>
                  {title}
                </h1>
                {subtitle && (
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    margin: `${tokens.spacing[0]}px 0 0`,
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </Stack>

            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
            }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </Stack>

          {/* Horizontal step dots */}
          <div style={{
            display: 'flex',
            gap: tokens.spacing[2],
            marginTop: tokens.spacing[4],
          }}>
            {steps.map((step, idx) => (
              <div
                key={step.key}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: idx <= currentStep
                    ? (step.isComplete ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500])
                    : tokens.colors.neutral[200],
                  transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }}
              />
            ))}
          </div>
        </div>
      );
    };

    /* ── Welcome Step (Special) ─────────────────────────────────── */
    const renderWelcomeStep = () => {
      const features = [
        { icon: <Search size={20} />, title: 'AI-Powered Screening', desc: 'Automatically screen and rank candidates' },
        { icon: <Layout size={20} />, title: 'Pipeline Management', desc: 'Track candidates across all stages' },
        { icon: <Users size={20} />, title: 'Team Collaboration', desc: 'Share notes and feedback with your team' },
        { icon: <Star size={20} />, title: 'Smart Matching', desc: 'Find the best candidates for each role' },
      ];

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          textAlign: 'center' as const,
          padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
          maxWidth: 640,
          margin: '0 auto',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${tokens.colors.primaryScale[100]}, ${tokens.colors.primaryScale[200]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing[5],
          }}>
            <Hand size={36} color={tokens.colors.primaryScale[600]} />
          </div>

          <h2 style={{
            fontSize: tokens.typography.fontSize['3xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
          }}>
            Welcome to BitHire!
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.neutral[600],
            margin: `${tokens.spacing[3]}px 0 0`,
            lineHeight: tokens.typography.lineHeight.relaxed,
            maxWidth: 480,
          }}>
            Let&apos;s set up your profile and walk you through the platform. This will only take a few minutes.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[4],
            marginTop: tokens.spacing[7],
            width: '100%',
          }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{
                ...animStyle(idx),
                ...cardBase,
                padding: tokens.spacing[4],
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                textAlign: 'center' as const,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primaryScale[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.primaryScale[600],
                  marginBottom: tokens.spacing[3],
                }}>
                  {feature.icon}
                </div>
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[800],
                  margin: 0,
                }}>
                  {feature.title}
                </p>
                <p style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  margin: `${tokens.spacing[1]}px 0 0`,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    };

    /* ── Explore Interface Step (Special) ──────────────────────── */
    const renderExploreStep = () => {
      const exploreAreas = [
        { key: 'dashboard', icon: <Layout size={20} />, title: 'Dashboard', desc: 'Your home base with pipeline overview and metrics' },
        { key: 'jobs', icon: <Briefcase size={20} />, title: 'Jobs', desc: 'Create and manage job listings' },
        { key: 'candidates', icon: <Users size={20} />, title: 'Candidates', desc: 'Search, filter, and manage your talent pool' },
        { key: 'pipeline', icon: <Filter size={20} />, title: 'Pipeline', desc: 'Drag and drop candidates through hiring stages' },
        { key: 'interviews', icon: <MousePointerClick size={20} />, title: 'Interviews', desc: 'Schedule and track all your interviews' },
        { key: 'reports', icon: <FileText size={20} />, title: 'Reports', desc: 'Analytics and performance insights' },
      ];

      return (
        <div style={{
          padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
          maxWidth: 720,
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[6] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
            }}>
              Explore the Interface
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: `${tokens.spacing[2]}px 0 0`,
            }}>
              Click each area to learn what it does. Explore at least 3 to continue.
            </p>
            <div style={{ marginTop: tokens.spacing[3] }}>
              <span style={{
                ...createBadgeStyle(tokens, exploredFeatures.size >= 3 ? 'success' : 'primary'),
                borderRadius: badgeRadius,
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {exploredFeatures.size}/{Math.min(3, exploreAreas.length)} explored
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[4],
          }}>
            {exploreAreas.map((area, i) => {
              const isExplored = exploredFeatures.has(area.key);
              return (
                <div
                  key={area.key}
                  onClick={() => {
                    const next = new Set(exploredFeatures);
                    next.add(area.key);
                    setExploredFeatures(next);
                  }}
                  style={{
                    ...animStyle(i),
                    ...createCardStyle(tokens, { elevation: isExplored ? 'md' : 'sm', glass: isGlass, interactive: true }),
                    padding: tokens.spacing[4],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    textAlign: 'center' as const,
                    position: 'relative' as const,
                    border: `1px solid ${isExplored ? tokens.colors.successScale[300] : tokens.colors.neutral[100]}`,
                    backgroundColor: isExplored ? tokens.colors.successScale[50] : tokens.colors.common.white,
                  }}
                >
                  {isExplored && (
                    <div style={{
                      position: 'absolute' as const,
                      top: tokens.spacing[2],
                      right: tokens.spacing[2],
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: tokens.colors.successScale[500],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={12} color={tokens.colors.common.white} />
                    </div>
                  )}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: isExplored ? tokens.colors.successScale[100] : tokens.colors.primaryScale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isExplored ? tokens.colors.successScale[600] : tokens.colors.primaryScale[600],
                    margin: '0 auto',
                    marginBottom: tokens.spacing[3],
                  }}>
                    {area.icon}
                  </div>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                    margin: 0,
                  }}>
                    {area.title}
                  </p>
                  <p style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    margin: `${tokens.spacing[1]}px 0 0`,
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}>
                    {area.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ── Form Field Renderer ───────────────────────────────────── */
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
        border: `1px solid ${hasError ? tokens.colors.errorScale[300] : tokens.colors.neutral[200]}`,
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
          ) : field.type === 'file' ? (
            <div style={{
              ...baseInputStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
              border: `2px dashed ${hasError ? tokens.colors.errorScale[300] : tokens.colors.neutral[300]}`,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              textAlign: 'center' as const,
              flexDirection: 'column' as const,
              gap: tokens.spacing[2],
            }}>
              <Upload size={20} color={tokens.colors.neutral[400]} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}>
                {inputValue ? String(inputValue) : 'Click or drag to upload'}
              </span>
            </div>
          ) : field.type === 'toggle' ? (
            <div
              onClick={() => onFormChange?.(field.name, !inputValue)}
              style={{
                ...hoverTransition,
                width: 44,
                height: 24,
                borderRadius: '50%',
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
                borderRadius: '50%',
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
              margin: `${tokens.spacing[1]}px 0 0`,
            }}>
              {field.helpText}
            </p>
          )}

          {hasError && (
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
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

    /* ── Standard Form Step ────────────────────────────────────── */
    const renderFormStep = () => {
      return (
        <div style={{
          padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
          maxWidth: 560,
          margin: '0 auto',
        }}>
          <div style={{ marginBottom: tokens.spacing[5] }}>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]} style={{ marginBottom: tokens.spacing[2] }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: tokens.colors.primaryScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.primaryScale[600],
              }}>
                {RECRUITER_STEP_ICONS[currentStepData?.key ?? ''] ?? <span>{currentStep + 1}</span>}
              </div>
              <div>
                <h2 style={{
                  fontSize: tokens.typography.fontSize.xl,
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
                    margin: `${tokens.spacing[1]}px 0 0`,
                  }}>
                    {currentStepData.description}
                  </p>
                )}
              </div>
            </Stack>
          </div>

          <div style={{
            ...cardBase,
            padding: tokens.spacing[5],
          }}>
            {formFields.map((field) => renderFormField(field))}
          </div>

          {/* Help tooltip */}
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
                  <HelpCircle size={16} color={tokens.colors.infoScale[600]} style={{ marginTop: tokens.spacing[1], flexShrink: 0 }} />
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
              Need help?
            </button>
          )}
        </div>
      );
    };

    /* ── Step Content Switcher ──────────────────────────────────── */
    const renderStepContent = () => {
      if (currentStepData?.key === 'welcome') return renderWelcomeStep();
      if (currentStepData?.key === 'explore') return renderExploreStep();
      return renderFormStep();
    };

    /* ── Footer Actions ────────────────────────────────────────── */
    const renderFooter = () => {
      return (
        <div style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Stack direction="horizontal" align="center" justify="space-between">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  style={{
                    ...hoverTransition,
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
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
              {onSkip && currentStepData?.key !== 'welcome' && (
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
                {isLastStep ? completeLabel : (currentStepData?.key === 'welcome' ? "Let's Go" : nextLabel)}
                {isLastStep ? <Rocket size={14} /> : <ChevronRight size={14} />}
              </button>
            </Stack>
          </Stack>
        </div>
      );
    };

    /* ── Main Layout ───────────────────────────────────────────── */
    return (
      <div className={className} style={containerStyle}>
        {accentBar && <Box style={accentBar} />}
        {renderCelebration()}
        {renderProgressHeader()}
        <div style={{ flex: 1, overflowY: 'auto' as const }}>
          {renderStepContent()}
        </div>
        {renderFooter()}
      </div>
    );
  },
});
