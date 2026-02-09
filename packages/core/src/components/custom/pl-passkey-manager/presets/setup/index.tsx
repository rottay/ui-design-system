'use client';

/**
 * PlPasskeyManager - Setup Preset
 * Multi-step registration wizard for adding a new WebAuthn passkey.
 * Steps: Choose Type -> Name Device -> Authenticate -> Confirm
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createAccentBarStyle,
} from '../../../helpers';
import type {
  PlPasskeyManagerProps,
  AuthenticatorType,
  SetupStep,
} from '../../core';
import { PL_PASSKEY_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Fingerprint,
  Usb,
  Bluetooth,
  Smartphone,
  Monitor,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  KeyRound,
  Laptop,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Wifi,
  ArrowRight,
  RefreshCw,
  Info,
  Zap,
  Globe,
  Cloud,
  CloudOff,
} from 'lucide-react';

// ─── Step Configuration ──────────────────────────────────────────────────────

interface StepConfig {
  key: SetupStep;
  label: string;
  description: string;
  number: number;
}

const STEPS: StepConfig[] = [
  { key: 'choose-type', label: 'Choose Type', description: 'Select authenticator type', number: 1 },
  { key: 'name-device', label: 'Name Device', description: 'Give your passkey a name', number: 2 },
  { key: 'authenticate', label: 'Authenticate', description: 'Verify your identity', number: 3 },
  { key: 'confirm', label: 'Confirm', description: 'Registration complete', number: 4 },
];

function getStepIndex(step: SetupStep): number {
  return STEPS.findIndex(s => s.key === step);
}

// ─── Authenticator Type Details ──────────────────────────────────────────────

interface AuthTypeDetail {
  type: AuthenticatorType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

function getAuthTypeDetails(tokens: DesignTokens): AuthTypeDetail[] {
  return [
    {
      type: 'platform',
      title: 'Platform Authenticator',
      subtitle: 'Built-in biometric or device PIN',
      description: 'Uses your device\'s built-in biometric sensor (Touch ID, Face ID, Windows Hello) or device PIN for authentication. The passkey is stored on this device.',
      icon: <Fingerprint size={28} />,
      features: [
        'Fast, one-touch authentication',
        'Uses built-in biometrics (Touch ID, Face ID)',
        'Backed up via iCloud Keychain or Google Password Manager',
        'Works without additional hardware',
      ],
      color: tokens.colors.primaryScale[600],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
    },
    {
      type: 'cross-platform',
      title: 'Security Key',
      subtitle: 'External hardware authenticator',
      description: 'Uses a physical security key (YubiKey, Titan Key, etc.) connected via USB, NFC, or Bluetooth. The passkey is stored on the hardware device.',
      icon: <Key size={28} />,
      features: [
        'Highest level of phishing resistance',
        'Works across multiple devices and browsers',
        'Physical possession required for authentication',
        'No reliance on cloud backup services',
      ],
      color: tokens.colors.secondaryScale[600],
      bgColor: tokens.colors.secondaryScale[50],
      borderColor: tokens.colors.secondaryScale[200],
    },
  ];
}

// ─── Device Icon Options ─────────────────────────────────────────────────────

interface DeviceIconOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

function getDeviceIconOptions(tokens: DesignTokens): DeviceIconOption[] {
  return [
    { id: 'laptop', label: 'Laptop', icon: <Laptop size={20} /> },
    { id: 'phone', label: 'Phone', icon: <Smartphone size={20} /> },
    { id: 'monitor', label: 'Desktop', icon: <Monitor size={20} /> },
    { id: 'key', label: 'Security Key', icon: <Key size={20} /> },
    { id: 'fingerprint', label: 'Biometric', icon: <Fingerprint size={20} /> },
    { id: 'usb', label: 'USB Key', icon: <Usb size={20} /> },
  ];
}

// ─── Setup Preset ────────────────────────────────────────────────────────────

export const SetupPlPasskeyManager = createPreset<PlPasskeyManagerProps>({
  name: 'PlPasskeyManager.Setup',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlPasskeyManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      currentStep: controlledStep,
      onNextStep,
      onPrevStep,
      selectedAuthenticatorType: controlledAuthType,
      onAuthenticatorTypeChange,
      passkeyName: controlledName,
      onNameChange,
      isRegistering = false,
      registrationError,
      registrationSuccess = false,
      browserSupportsWebAuthn = true,
      loading = false,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalStep, setInternalStep] = useState<SetupStep>('choose-type');
    const [internalAuthType, setInternalAuthType] = useState<AuthenticatorType | null>(null);
    const [internalName, setInternalName] = useState('');
    const [selectedIconId, setSelectedIconId] = useState('laptop');
    const [hoveredTypeId, setHoveredTypeId] = useState<AuthenticatorType | null>(null);
    const [hoveredIconId, setHoveredIconId] = useState<string | null>(null);

    const currentStep = controlledStep ?? internalStep;
    const selectedAuthType = controlledAuthType ?? internalAuthType;
    const passkeyName = controlledName ?? internalName;
    const currentStepIndex = getStepIndex(currentStep);

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleAuthTypeSelect = useCallback((type: AuthenticatorType) => {
      if (controlledAuthType === undefined) setInternalAuthType(type);
      onAuthenticatorTypeChange?.(type);
    }, [controlledAuthType, onAuthenticatorTypeChange]);

    const handleNameChange = useCallback((name: string) => {
      if (controlledName === undefined) setInternalName(name);
      onNameChange?.(name);
    }, [controlledName, onNameChange]);

    const handleNext = useCallback(() => {
      if (controlledStep === undefined) {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
          setInternalStep(STEPS[nextIndex].key);
        }
      }
      onNextStep?.();
    }, [controlledStep, currentStepIndex, onNextStep]);

    const handleBack = useCallback(() => {
      if (controlledStep === undefined) {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
          setInternalStep(STEPS[prevIndex].key);
        }
      }
      onPrevStep?.();
    }, [controlledStep, currentStepIndex, onPrevStep]);

    const canProceed = useMemo(() => {
      switch (currentStep) {
        case 'choose-type':
          return selectedAuthType !== null;
        case 'name-device':
          return passkeyName.trim().length >= 2;
        case 'authenticate':
          return registrationSuccess;
        case 'confirm':
          return true;
        default:
          return false;
      }
    }, [currentStep, selectedAuthType, passkeyName, registrationSuccess]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading ─────────────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            fontFamily: 'inherit',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...style,
          }}
        >
          <Spinner size="lg" />
        </div>
      );
    }

    // ─── Render: Step Indicator ───────────────────────────────────────────

    const renderStepIndicator = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        marginBottom: tokens.spacing[6],
        padding: `0 ${tokens.spacing[4]}px`,
      }}>
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isComplete = idx < currentStepIndex;
          const isLast = idx === STEPS.length - 1;

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: isLast ? 'none' : 1,
              }}
            >
              {/* Step circle */}
              <div style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: tokens.spacing[1],
                minWidth: 80,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: isComplete
                    ? tokens.colors.successScale[500]
                    : isActive
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[200],
                  color: isComplete || isActive
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: isActive ? tokens.shadows.md : 'none',
                }}>
                  {isComplete ? <Check size={16} /> : step.number}
                </div>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  color: isActive ? tokens.colors.primaryScale[700] : isComplete ? tokens.colors.successScale[700] : tokens.colors.neutral[500],
                  textAlign: 'center' as const,
                  whiteSpace: 'nowrap' as const,
                }}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isComplete
                    ? tokens.colors.successScale[300]
                    : tokens.colors.neutral[200],
                  marginBottom: 20,
                  marginLeft: tokens.spacing[2],
                  marginRight: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.full,
                  transition: `all ${tokens.motion.hover}`,
                }} />
              )}
            </div>
          );
        })}
      </div>
    );

    // ─── Render: Step 1 - Choose Type ────────────────────────────────────

    const renderChooseType = () => {
      const authTypes = getAuthTypeDetails(tokens);

      return (
        <div>
          <div style={{
            textAlign: 'center' as const,
            marginBottom: tokens.spacing[6],
          }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[2],
            }}>
              Choose Authenticator Type
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Select how you want to authenticate. Platform authenticators use built-in biometrics, while security keys are external hardware devices.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[6],
          }}>
            {authTypes.map((authType) => {
              const isSelected = selectedAuthType === authType.type;
              const isHovered = hoveredTypeId === authType.type;

              return (
                <div
                  key={authType.type}
                  onClick={() => handleAuthTypeSelect(authType.type)}
                  onMouseEnter={() => setHoveredTypeId(authType.type)}
                  onMouseLeave={() => setHoveredTypeId(null)}
                  style={{
                    ...createCardStyle(tokens, {
                      elevation: isSelected ? 'md' : 'sm',
                      glass: isModern,
                    }),
                    padding: tokens.spacing[5],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    transform: isHovered ? tokens.motion.transform : 'none',
                    borderColor: isSelected ? authType.borderColor : undefined,
                    backgroundColor: isSelected ? authType.bgColor : undefined,
                    position: 'relative' as const,
                    overflow: 'hidden' as const,
                    ...(isModern && !isSelected ? glassCardStyle : {}),
                  }}
                >
                  {/* Accent bar */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute' as const,
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: authType.color,
                      borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`,
                    }} />
                  )}

                  {/* Selection indicator */}
                  <div style={{
                    position: 'absolute' as const,
                    top: tokens.spacing[3],
                    right: tokens.spacing[3],
                    width: 24,
                    height: 24,
                    borderRadius: tokens.borderRadius.full,
                    border: `2px solid ${isSelected ? authType.color : tokens.colors.neutral[300]}`,
                    backgroundColor: isSelected ? authType.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                    {isSelected && <Check size={14} color={tokens.colors.common.white} />}
                  </div>

                  {/* Icon */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: isSelected ? tokens.colors.common.white : authType.bgColor,
                    color: authType.color,
                    marginBottom: tokens.spacing[4],
                    transition: `all ${tokens.motion.hover}`,
                    boxShadow: isSelected ? tokens.shadows.sm : 'none',
                  }}>
                    {authType.icon}
                  </div>

                  {/* Title + subtitle */}
                  <h3 style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    margin: 0,
                    marginBottom: tokens.spacing[1],
                  }}>
                    {authType.title}
                  </h3>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    margin: 0,
                    marginBottom: tokens.spacing[4],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}>
                    {authType.description}
                  </p>

                  {/* Features list */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: tokens.spacing[2],
                  }}>
                    {authType.features.map((feature, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[2],
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                        }}
                      >
                        <CheckCircle
                          size={14}
                          color={isSelected ? authType.color : tokens.colors.neutral[400]}
                          style={{ flexShrink: 0, marginTop: 1 }}
                        />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Browser compatibility notice */}
          {!browserSupportsWebAuthn && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.errorScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
              marginBottom: tokens.spacing[4],
            }}>
              <AlertTriangle size={18} color={tokens.colors.errorScale[600]} style={{ flexShrink: 0 }} />
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.errorScale[800],
                  marginBottom: tokens.spacing[1],
                }}>
                  Browser Not Supported
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.errorScale[700],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  Your current browser does not support WebAuthn. Please use a modern browser like Chrome, Safari, Firefox, or Edge to register a passkey.
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Step 2 - Name Device ────────────────────────────────────

    const renderNameDevice = () => {
      const iconOptions = getDeviceIconOptions(tokens);
      const nameLength = passkeyName.trim().length;
      const isNameValid = nameLength >= 2;

      return (
        <div>
          <div style={{
            textAlign: 'center' as const,
            marginBottom: tokens.spacing[6],
          }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[2],
            }}>
              Name Your Passkey
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Give your passkey a recognizable name so you can identify it later. Choose an icon that represents the device.
            </p>
          </div>

          <div style={{
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {/* Name input card */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: tokens.spacing[5],
              marginBottom: tokens.spacing[4],
              ...(isModern ? glassCardStyle : {}),
            }}>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[2],
              }}>
                Passkey Name
              </label>
              <input
                type="text"
                value={passkeyName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder='e.g., "MacBook Pro", "YubiKey 5C", "iPhone 15"'
                maxLength={64}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isNameValid ? tokens.colors.successScale[300] : nameLength > 0 ? tokens.colors.errorScale[300] : tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                  boxSizing: 'border-box' as const,
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: tokens.spacing[1],
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: nameLength > 0 && !isNameValid ? tokens.colors.errorScale[600] : tokens.colors.neutral[400],
                }}>
                  {nameLength > 0 && !isNameValid ? 'Name must be at least 2 characters' : 'Choose a name that helps you identify this passkey'}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  {nameLength}/64
                </span>
              </div>
            </div>

            {/* Icon selection card */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: tokens.spacing[5],
              marginBottom: tokens.spacing[4],
              ...(isModern ? glassCardStyle : {}),
            }}>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[3],
              }}>
                Device Icon
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: tokens.spacing[2],
              }}>
                {iconOptions.map((option) => {
                  const isSelected = selectedIconId === option.id;
                  const isIconHovered = hoveredIconId === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelectedIconId(option.id)}
                      onMouseEnter={() => setHoveredIconId(option.id)}
                      onMouseLeave={() => setHoveredIconId(null)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        border: `2px solid ${isSelected ? tokens.colors.primaryScale[400] : isIconHovered ? tokens.colors.neutral[300] : tokens.colors.neutral[200]}`,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        color: isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {option.icon}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                        color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                      }}>
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview card */}
            {passkeyName.trim() && (
              <div style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: tokens.spacing[4],
                ...(isModern ? glassCardStyle : {}),
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[3],
                }}>
                  Preview
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[100],
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {iconOptions.find(o => o.id === selectedIconId)?.icon || <Laptop size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      {passkeyName.trim()}
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}>
                      {selectedAuthType === 'platform' ? 'Platform Authenticator' : 'Security Key'}
                    </div>
                  </div>
                  <span style={{
                    ...createBadgeStyle(tokens, 'success'),
                    padding: `2px ${tokens.spacing[2]}px`,
                    fontSize: '10px',
                  }}>
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Step 3 - Authenticate ───────────────────────────────────

    const renderAuthenticate = () => {
      const isPlatform = selectedAuthType === 'platform';

      return (
        <div>
          <div style={{
            textAlign: 'center' as const,
            marginBottom: tokens.spacing[6],
          }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize['xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[2],
            }}>
              Verify Your Identity
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              {isPlatform
                ? 'Your device will prompt you to verify your identity using biometrics or device PIN.'
                : 'Insert or tap your security key when prompted by your browser.'}
            </p>
          </div>

          <div style={{
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {/* Biometric prompt area */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'md', glass: isModern }),
              padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
              textAlign: 'center' as const,
              marginBottom: tokens.spacing[5],
              position: 'relative' as const,
              overflow: 'hidden' as const,
              ...(isModern ? glassCardStyle : {}),
            }}>
              {/* Accent bar */}
              <div style={{
                position: 'absolute' as const,
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(to right, ${tokens.colors.primaryScale[400]}, ${tokens.colors.secondaryScale[400]})`,
              }} />

              {/* Icon animation area */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: isRegistering
                  ? tokens.colors.primaryScale[50]
                  : registrationSuccess
                    ? tokens.colors.successScale[50]
                    : registrationError
                      ? tokens.colors.errorScale[50]
                      : tokens.colors.neutral[100],
                margin: '0 auto',
                marginBottom: tokens.spacing[4],
                transition: `all ${tokens.motion.hover}`,
                boxShadow: isRegistering ? `0 0 0 4px ${tokens.colors.primaryScale[100]}` : 'none',
              }}>
                {isRegistering ? (
                  <Spinner size="md" />
                ) : registrationSuccess ? (
                  <CheckCircle size={36} color={tokens.colors.successScale[500]} />
                ) : registrationError ? (
                  <AlertCircle size={36} color={tokens.colors.errorScale[500]} />
                ) : isPlatform ? (
                  <Fingerprint size={36} color={tokens.colors.primaryScale[500]} />
                ) : (
                  <Key size={36} color={tokens.colors.secondaryScale[500]} />
                )}
              </div>

              {/* Status text */}
              <div style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: registrationSuccess
                  ? tokens.colors.successScale[700]
                  : registrationError
                    ? tokens.colors.errorScale[700]
                    : tokens.colors.neutral[800],
                marginBottom: tokens.spacing[2],
              }}>
                {isRegistering
                  ? 'Waiting for authentication...'
                  : registrationSuccess
                    ? 'Authentication successful!'
                    : registrationError
                      ? 'Authentication failed'
                      : isPlatform
                        ? 'Ready for biometric verification'
                        : 'Ready for security key'}
              </div>

              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                lineHeight: tokens.typography.lineHeight.relaxed,
                maxWidth: 360,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                {isRegistering
                  ? 'Follow the prompts on your device or browser to complete registration.'
                  : registrationSuccess
                    ? 'Your passkey has been successfully registered and is ready to use.'
                    : registrationError
                      ? registrationError
                      : isPlatform
                        ? 'Click the button below to begin. Your device will ask you to use Touch ID, Face ID, Windows Hello, or your device PIN.'
                        : 'Click the button below to begin. Then insert your security key and tap it when the light blinks.'}
              </div>

              {/* Error details */}
              {registrationError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.errorScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  marginTop: tokens.spacing[4],
                  textAlign: 'left' as const,
                }}>
                  <AlertCircle size={14} color={tokens.colors.errorScale[600]} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.errorScale[700],
                  }}>
                    {registrationError}
                  </span>
                </div>
              )}

              {/* Begin authentication button */}
              {!isRegistering && !registrationSuccess && (
                <button
                  onClick={onNextStep}
                  disabled={!browserSupportsWebAuthn}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    backgroundColor: registrationError
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    border: 'none',
                    cursor: browserSupportsWebAuthn ? 'pointer' : 'not-allowed',
                    transition: `all ${tokens.motion.hover}`,
                    boxShadow: tokens.shadows.md,
                    outline: 'none',
                    marginTop: tokens.spacing[4],
                    opacity: browserSupportsWebAuthn ? 1 : 0.5,
                  }}
                >
                  {isPlatform ? <Fingerprint size={16} /> : <Key size={16} />}
                  {registrationError ? 'Try Again' : 'Begin Authentication'}
                </button>
              )}
            </div>

            {/* Security tips */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: tokens.spacing[4],
              ...(isModern ? glassCardStyle : {}),
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[3],
              }}>
                <Shield size={14} color={tokens.colors.infoScale[600]} />
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  Security Tips
                </span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[2],
              }}>
                {[
                  { icon: <Lock size={12} />, text: 'Your private key never leaves your device' },
                  { icon: <Eye size={12} />, text: 'Biometric data is processed locally, not sent to servers' },
                  { icon: <ShieldCheck size={12} />, text: 'Passkeys are resistant to phishing and credential theft' },
                  { icon: <Zap size={12} />, text: 'Authentication completes in seconds' },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    <div style={{
                      color: tokens.colors.infoScale[500],
                      flexShrink: 0,
                    }}>
                      {tip.icon}
                    </div>
                    {tip.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Step 4 - Confirm ────────────────────────────────────────

    const renderConfirm = () => {
      const isPlatform = selectedAuthType === 'platform';

      return (
        <div>
          <div style={{
            textAlign: 'center' as const,
            marginBottom: tokens.spacing[6],
          }}>
            {/* Success icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[50],
              margin: '0 auto',
              marginBottom: tokens.spacing[4],
              boxShadow: `0 0 0 4px ${tokens.colors.successScale[100]}`,
            }}>
              <CheckCircle size={36} color={tokens.colors.successScale[500]} />
            </div>
            <h2 style={{
              fontSize: tokens.typography.fontSize['xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[2],
            }}>
              Passkey Registered Successfully
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              Your new passkey is ready to use for passwordless authentication.
            </p>
          </div>

          <div style={{
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {/* Passkey details summary card */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: 0,
              overflow: 'hidden' as const,
              marginBottom: tokens.spacing[4],
              ...(isModern ? glassCardStyle : {}),
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <KeyRound size={14} color={tokens.colors.neutral[600]} />
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  Passkey Details
                </span>
              </div>

              {/* Detail rows */}
              <div style={{ padding: 0 }}>
                {[
                  { label: 'Name', value: passkeyName || 'My Passkey', icon: <Edit3 size={14} /> },
                  {
                    label: 'Type',
                    value: isPlatform ? 'Platform Authenticator' : 'Security Key',
                    icon: isPlatform ? <Smartphone size={14} /> : <Key size={14} />,
                  },
                  { label: 'Status', value: 'Active', icon: <CheckCircle size={14} />, valueColor: tokens.colors.successScale[600] },
                  {
                    label: 'Backup',
                    value: isPlatform ? 'Eligible for cloud sync' : 'Not applicable (hardware key)',
                    icon: isPlatform ? <Cloud size={14} /> : <CloudOff size={14} />,
                  },
                  { label: 'Registered', value: 'Just now', icon: <Globe size={14} /> },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderBottom: idx < 4
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                    }}>
                      <div style={{ color: tokens.colors.neutral[400] }}>{row.icon}</div>
                      {row.label}
                    </div>
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: (row as any).valueColor ?? tokens.colors.neutral[800],
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup eligibility info */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
              ...(isModern ? glassCardStyle : {}),
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[3],
              }}>
                {isPlatform ? (
                  <ShieldCheck size={16} color={tokens.colors.successScale[600]} />
                ) : (
                  <Shield size={16} color={tokens.colors.secondaryScale[600]} />
                )}
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  {isPlatform ? 'Backup & Sync Information' : 'Hardware Key Information'}
                </span>
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                lineHeight: tokens.typography.lineHeight.relaxed,
                marginBottom: tokens.spacing[3],
              }}>
                {isPlatform
                  ? 'This passkey is eligible for cloud backup. If your device supports it, the passkey will be synced across your devices via iCloud Keychain, Google Password Manager, or a similar service.'
                  : 'Hardware security keys store credentials on the physical device. If you lose this key, you will need to register a new passkey. Consider registering a backup key.'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isPlatform ? tokens.colors.successScale[50] : tokens.colors.warningScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isPlatform ? tokens.colors.successScale[200] : tokens.colors.warningScale[200]}`,
              }}>
                <Info size={14} color={isPlatform ? tokens.colors.successScale[600] : tokens.colors.warningScale[600]} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: isPlatform ? tokens.colors.successScale[700] : tokens.colors.warningScale[700],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {isPlatform
                    ? 'Tip: Make sure cloud sync is enabled in your device settings for automatic backup.'
                    : 'Tip: Register passkeys on multiple devices to avoid being locked out of your account.'}
                </span>
              </div>
            </div>

            {/* What is next section */}
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: tokens.spacing[4],
              ...(isModern ? glassCardStyle : {}),
            }}>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[3],
              }}>
                What happens next?
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[3],
              }}>
                {[
                  {
                    icon: <Fingerprint size={16} />,
                    title: 'Use your passkey to sign in',
                    desc: 'Next time you log in, choose the passkey option for instant authentication.',
                  },
                  {
                    icon: <KeyRound size={16} />,
                    title: 'Add more passkeys',
                    desc: 'Register passkeys on additional devices for backup and convenience.',
                  },
                  {
                    icon: <Shield size={16} />,
                    title: 'Review your security settings',
                    desc: 'Consider removing old password-based authentication methods.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[600],
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                        marginBottom: 2,
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Step Content ─────────────────────────────────────────────

    const renderStepContent = () => {
      switch (currentStep) {
        case 'choose-type':
          return renderChooseType();
        case 'name-device':
          return renderNameDevice();
        case 'authenticate':
          return renderAuthenticate();
        case 'confirm':
          return renderConfirm();
        default:
          return null;
      }
    };

    // ─── Render: Navigation Footer ───────────────────────────────────────

    const renderNavigation = () => {
      const isFirstStep = currentStepIndex === 0;
      const isLastStep = currentStepIndex === STEPS.length - 1;
      const isAuthStep = currentStep === 'authenticate';

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: tokens.spacing[5],
          marginTop: tokens.spacing[6],
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: tokens.colors.common.white,
              color: isFirstStep ? tokens.colors.neutral[400] : tokens.colors.neutral[700],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              cursor: isFirstStep ? 'not-allowed' : 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              opacity: isFirstStep ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {/* Step counter */}
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
          }}>
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>

          {/* Next / Done button */}
          {isLastStep ? (
            <button
              onClick={onNextStep}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.successScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
                outline: 'none',
              }}
            >
              <CheckCircle size={16} />
              Done
            </button>
          ) : isAuthStep ? (
            <button
              onClick={handleNext}
              disabled={!registrationSuccess}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: registrationSuccess ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: registrationSuccess ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: registrationSuccess ? tokens.shadows.sm : 'none',
                outline: 'none',
              }}
            >
              Continue
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: canProceed ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: canProceed ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: canProceed ? tokens.shadows.sm : 'none',
                outline: 'none',
              }}
            >
              Continue
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      );
    };

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
          alignItems: 'center',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[6],
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.primaryScale[100],
            color: tokens.colors.primaryScale[600],
          }}>
            <KeyRound size={20} />
          </div>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Register New Passkey
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              Set up a new WebAuthn credential for passwordless sign-in
            </p>
          </div>
        </div>

        {/* Main card */}
        <div style={{
          ...createCardStyle(tokens, { elevation: 'md', glass: isModern }),
          padding: tokens.spacing[6],
          ...(isModern ? glassCardStyle : {}),
        }}>
          {renderStepIndicator()}
          {renderStepContent()}
          {renderNavigation()}
        </div>
      </div>
    );
  },
});
