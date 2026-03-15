'use client';

/**
 * PlSsoConnectionManager - Setup Preset
 * Multi-step setup wizard for creating a new SSO connection
 * Steps: Select Protocol -> Configure Provider -> Enter Endpoints -> Upload Certificate -> Test & Activate
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type {
  PlSsoConnectionManagerProps,
  SsoProtocol,
  SsoProvider,
  UserRole,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Shield,
  Key,
  Lock,
  Database,
  Server,
  Globe,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  XCircle,
  Upload,
  FileKey,
  AlertTriangle,
  Loader2,
  Play,
  Users,
  Zap,
  Settings,
  Link,
  ExternalLink,
  Copy,
  ShieldCheck,
} from 'lucide-react';

// ─── Step Definitions ────────────────────────────────────────────────────────

type WizardStep = 'protocol' | 'provider' | 'endpoints' | 'certificate' | 'test';

interface StepDefinition {
  id: WizardStep;
  label: string;
  description: string;
  number: number;
}

const WIZARD_STEPS: StepDefinition[] = [
  { id: 'protocol', label: 'Select Protocol', description: 'Choose your SSO protocol', number: 1 },
  { id: 'provider', label: 'Configure Provider', description: 'Set up identity provider details', number: 2 },
  { id: 'endpoints', label: 'Enter Endpoints', description: 'Configure SSO endpoint URLs', number: 3 },
  { id: 'certificate', label: 'Upload Certificate', description: 'Add signing certificate', number: 4 },
  { id: 'test', label: 'Test & Activate', description: 'Verify and enable connection', number: 5 },
];

// ─── Protocol Card Config ────────────────────────────────────────────────────

interface ProtocolCardConfig {
  protocol: SsoProtocol;
  label: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  colorKey: string;
}

function getProtocolCards(tokens: DesignTokens): ProtocolCardConfig[] {
  return [
    {
      protocol: 'SAML',
      label: 'SAML 2.0',
      description: 'Security Assertion Markup Language for enterprise SSO with XML-based assertions',
      features: ['XML Assertions', 'SP/IdP Metadata', 'Certificate Signing', 'Attribute Mapping'],
      icon: <Shield size={28} />,
      colorKey: 'primaryScale',
    },
    {
      protocol: 'OIDC',
      label: 'OpenID Connect',
      description: 'Modern identity layer on top of OAuth 2.0 using JSON Web Tokens',
      features: ['JWT Tokens', 'Discovery Endpoint', 'PKCE Support', 'Scope-based Claims'],
      icon: <Key size={28} />,
      colorKey: 'infoScale',
    },
    {
      protocol: 'OAuth2',
      label: 'OAuth 2.0',
      description: 'Industry-standard authorization framework for delegated access',
      features: ['Authorization Code', 'Client Credentials', 'Refresh Tokens', 'Custom Scopes'],
      icon: <Lock size={28} />,
      colorKey: 'secondaryScale',
    },
    {
      protocol: 'LDAP',
      label: 'LDAP',
      description: 'Lightweight Directory Access Protocol for on-premise directory integration',
      features: ['Directory Bind', 'Search Filters', 'Group Sync', 'Nested Groups'],
      icon: <Database size={28} />,
      colorKey: 'warningScale',
    },
  ];
}

// ─── Provider Options ────────────────────────────────────────────────────────

interface ProviderOption {
  id: SsoProvider;
  label: string;
  description: string;
  colorKey: string;
  protocols: SsoProtocol[];
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  { id: 'okta', label: 'Okta', description: 'Enterprise identity and access management', colorKey: 'primaryScale', protocols: ['SAML', 'OIDC', 'OAuth2'] },
  { id: 'microsoft', label: 'Microsoft Entra ID', description: 'Azure Active Directory cloud identity', colorKey: 'infoScale', protocols: ['SAML', 'OIDC', 'OAuth2'] },
  { id: 'google', label: 'Google Workspace', description: 'Google Cloud Identity for organizations', colorKey: 'errorScale', protocols: ['SAML', 'OIDC', 'OAuth2'] },
  { id: 'auth0', label: 'Auth0', description: 'Flexible authentication and authorization', colorKey: 'warningScale', protocols: ['SAML', 'OIDC', 'OAuth2'] },
  { id: 'onelogin', label: 'OneLogin', description: 'Unified access management platform', colorKey: 'successScale', protocols: ['SAML', 'OIDC'] },
  { id: 'ping', label: 'PingIdentity', description: 'Intelligent identity platform for enterprise', colorKey: 'secondaryScale', protocols: ['SAML', 'OIDC', 'OAuth2'] },
  { id: 'jumpcloud', label: 'JumpCloud', description: 'Open directory platform for IT teams', colorKey: 'infoScale', protocols: ['SAML', 'OIDC', 'LDAP'] },
  { id: 'custom', label: 'Custom Provider', description: 'Configure any SAML/OIDC compliant provider', colorKey: 'neutral', protocols: ['SAML', 'OIDC', 'OAuth2', 'LDAP'] },
];

// ─── Test Status ─────────────────────────────────────────────────────────────

type TestStatus = 'idle' | 'testing' | 'success' | 'failure';

// ─── Setup Preset ────────────────────────────────────────────────────────────

export const SetupPlSsoConnectionManager = createPreset<PlSsoConnectionManagerProps>({
  name: 'PlSsoConnectionManager.Setup',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSsoConnectionManagerProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const { className, style } = props;

    // ─── Wizard State ────────────────────────────────────────────────────

    const [currentStep, setCurrentStep] = useState<WizardStep>('protocol');
    const [selectedProtocol, setSelectedProtocol] = useState<SsoProtocol | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<SsoProvider | null>(null);
    const [hoveredProtocol, setHoveredProtocol] = useState<SsoProtocol | null>(null);
    const [hoveredProvider, setHoveredProvider] = useState<SsoProvider | null>(null);
    const [connectionName, setConnectionName] = useState('');
    const [domain, setDomain] = useState('');
    const [entityId, setEntityId] = useState('');
    const [metadataUrl, setMetadataUrl] = useState('');
    const [ssoUrl, setSsoUrl] = useState('');
    const [acsUrl, setAcsUrl] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [discoveryUrl, setDiscoveryUrl] = useState('');
    const [ldapHost, setLdapHost] = useState('');
    const [ldapPort, setLdapPort] = useState('389');
    const [ldapBaseDn, setLdapBaseDn] = useState('');
    const [ldapBindDn, setLdapBindDn] = useState('');
    const [certificateUploaded, setCertificateUploaded] = useState(false);
    const [certificateIssuer, setCertificateIssuer] = useState('');
    const [certificateExpiry, setCertificateExpiry] = useState('');
    const [autoProvision, setAutoProvision] = useState(false);
    const [defaultRole, setDefaultRole] = useState<UserRole>('member');
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');

    // ─── Step Navigation ─────────────────────────────────────────────────

    const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

    const canGoNext = useMemo(() => {
      switch (currentStep) {
        case 'protocol':
          return selectedProtocol !== null;
        case 'provider':
          return selectedProvider !== null && connectionName.trim() !== '' && domain.trim() !== '';
        case 'endpoints':
          if (selectedProtocol === 'SAML') return entityId.trim() !== '' && ssoUrl.trim() !== '';
          if (selectedProtocol === 'OIDC') return discoveryUrl.trim() !== '' || (clientId.trim() !== '' && clientSecret.trim() !== '');
          if (selectedProtocol === 'OAuth2') return clientId.trim() !== '' && clientSecret.trim() !== '';
          if (selectedProtocol === 'LDAP') return ldapHost.trim() !== '' && ldapBaseDn.trim() !== '';
          return false;
        case 'certificate':
          return selectedProtocol === 'LDAP' || selectedProtocol === 'OAuth2' || certificateUploaded;
        case 'test':
          return testStatus === 'success';
        default:
          return false;
      }
    }, [currentStep, selectedProtocol, selectedProvider, connectionName, domain, entityId, ssoUrl, discoveryUrl, clientId, clientSecret, ldapHost, ldapBaseDn, certificateUploaded, testStatus]);

    const goNext = useCallback(() => {
      if (currentStepIndex < WIZARD_STEPS.length - 1) {
        setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
      }
    }, [currentStepIndex]);

    const goBack = useCallback(() => {
      if (currentStepIndex > 0) {
        setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
      }
    }, [currentStepIndex]);

    const handleTest = useCallback(() => {
      setTestStatus('testing');
      // Simulate test — in real usage, the parent would handle this via callback
      setTimeout(() => {
        setTestStatus('success');
      }, 2000);
    }, []);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Shared Input Style ──────────────────────────────────────────────

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[800],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
      transition: `all ${tokens.motion.hover}`,
      boxSizing: 'border-box' as const,
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: tokens.spacing[1],
    };

    const fieldGroupStyle: React.CSSProperties = {
      marginBottom: tokens.spacing[4],
    };

    const hintStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[400],
      marginTop: tokens.spacing[1],
    };

    // ─── Render: Step Indicator ──────────────────────────────────────────

    const renderStepIndicator = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing[1],
        marginBottom: tokens.spacing[6],
        padding: `${tokens.spacing[4]}px 0`,
      }}>
        {WIZARD_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = idx < currentStepIndex;
          const isUpcoming = idx > currentStepIndex;

          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              {/* Step circle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: isCompleted
                    ? tokens.colors.successScale[500]
                    : isActive
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[100],
                  color: isCompleted || isActive
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[400],
                  transition: `all ${tokens.motion.hover}`,
                  border: isActive
                    ? `2px solid ${tokens.colors.primaryScale[300]}`
                    : '2px solid transparent',
                }}>
                  {isCompleted ? <Check size={16} /> : step.number}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                    color: isActive
                      ? tokens.colors.primaryScale[700]
                      : isCompleted
                        ? tokens.colors.successScale[700]
                        : tokens.colors.neutral[400],
                  }}>
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Connector line */}
              {idx < WIZARD_STEPS.length - 1 && (
                <div style={{
                  width: 40,
                  height: 2,
                  backgroundColor: isCompleted
                    ? tokens.colors.successScale[300]
                    : tokens.colors.neutral[200],
                  marginLeft: tokens.spacing[1],
                  marginRight: tokens.spacing[1],
                  borderRadius: tokens.borderRadius.full,
                  transition: `all ${tokens.motion.hover}`,
                }} />
              )}
            </div>
          );
        })}
      </div>
    );

    // ─── Render: Protocol Selection Step ─────────────────────────────────

    const renderProtocolStep = () => {
      const cards = getProtocolCards(tokens);

      return (
        <div>
          <div style={{
            marginBottom: tokens.spacing[4],
          }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[1],
            }}>
              Choose SSO Protocol
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              Select the authentication protocol your identity provider supports
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: tokens.spacing[4],
          }}>
            {cards.map(card => {
              const isSelected = selectedProtocol === card.protocol;
              const isHovered = hoveredProtocol === card.protocol;
              const scale = (tokens.colors as any)[card.colorKey];

              return (
                <div
                  key={card.protocol}
                  onClick={() => setSelectedProtocol(card.protocol)}
                  onMouseEnter={() => setHoveredProtocol(card.protocol)}
                  onMouseLeave={() => setHoveredProtocol(null)}
                  style={{
                    ...createCardStyle(tokens, {
                      elevation: isSelected ? 'md' : isHovered ? 'md' : 'sm',
                      glass: isModern,
                    }),
                    padding: tokens.spacing[5],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    borderColor: isSelected ? scale[400] : undefined,
                    backgroundColor: isSelected ? scale[50] : undefined,
                    transform: isHovered && !isSelected ? tokens.motion.transform : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[3],
                  }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: isSelected ? scale[100] : scale[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: scale[600],
                      transition: `all ${tokens.motion.hover}`,
                    }}>
                      {card.icon}
                    </div>
                    {isSelected && (
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: scale[500],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Check size={14} color={tokens.colors.common.white} />
                      </div>
                    )}
                  </div>

                  <div style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[1],
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[3],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}>
                    {card.description}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: tokens.spacing[1],
                  }}>
                    {card.features.map(feature => (
                      <span key={feature} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: '10px',
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: isSelected ? scale[100] : tokens.colors.neutral[100],
                        color: isSelected ? scale[700] : tokens.colors.neutral[600],
                        transition: `all ${tokens.motion.hover}`,
                      }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // ─── Render: Provider Step ───────────────────────────────────────────

    const renderProviderStep = () => {
      const filteredProviders = PROVIDER_OPTIONS.filter(
        p => selectedProtocol ? p.protocols.includes(selectedProtocol) : true
      );

      return (
        <div>
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[1],
            }}>
              Configure Identity Provider
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              Select your identity provider and enter connection details
            </p>
          </div>

          {/* Provider selection grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[5],
          }}>
            {filteredProviders.map(provider => {
              const isSelected = selectedProvider === provider.id;
              const isHovered = hoveredProvider === provider.id;
              const scale = provider.colorKey === 'neutral'
                ? tokens.colors.neutral
                : (tokens.colors as any)[provider.colorKey];

              return (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  onMouseEnter={() => setHoveredProvider(provider.id)}
                  onMouseLeave={() => setHoveredProvider(null)}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? (provider.colorKey === 'neutral' ? tokens.colors.neutral[400] : scale[400]) : tokens.colors.neutral[200]}`,
                    backgroundColor: isSelected
                      ? (provider.colorKey === 'neutral' ? tokens.colors.neutral[50] : scale[50])
                      : tokens.colors.common.white,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    textAlign: 'center' as const,
                    boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: provider.colorKey === 'neutral'
                      ? tokens.colors.neutral[100]
                      : scale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    marginBottom: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: provider.colorKey === 'neutral'
                      ? tokens.colors.neutral[600]
                      : scale[600],
                  }}>
                    {provider.label.charAt(0)}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[1],
                  }}>
                    {provider.label}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}>
                    {provider.description}
                  </div>
                  {isSelected && (
                    <div style={{
                      marginTop: tokens.spacing[2],
                    }}>
                      <CheckCircle size={16} color={provider.colorKey === 'neutral' ? tokens.colors.neutral[500] : scale[500]} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connection details form */}
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: tokens.spacing[5],
            ...(isModern ? glassCardStyle : {}),
          }}>
            <div style={{
              ...createSectionHeaderStyle(tokens),
              marginBottom: tokens.spacing[3],
            }}>
              Connection Details
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[4],
            }}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Connection Name</label>
                <input
                  type="text"
                  placeholder="e.g., Acme Corp SSO"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  style={inputStyle}
                />
                <div style={hintStyle}>A friendly name to identify this connection</div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Domain</label>
                <input
                  type="text"
                  placeholder="e.g., acme.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  style={inputStyle}
                />
                <div style={hintStyle}>Email domain for automatic routing</div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[4],
            }}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Auto-Provision Users</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}>
                  <button
                    onClick={() => setAutoProvision(!autoProvision)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: autoProvision ? 'flex-end' : 'flex-start',
                      width: 44,
                      height: 24,
                      padding: 2,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: autoProvision ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                      border: 'none',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      outline: 'none',
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.common.white,
                      boxShadow: tokens.shadows.sm,
                    }} />
                  </button>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: autoProvision ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                  }}>
                    {autoProvision ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div style={hintStyle}>Automatically create accounts on first login</div>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Default Role</label>
                <div style={{
                  display: 'flex',
                  gap: tokens.spacing[2],
                }}>
                  {(['viewer', 'member', 'admin'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => setDefaultRole(role)}
                      style={{
                        flex: 1,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: defaultRole === role ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                        backgroundColor: defaultRole === role ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        color: defaultRole === role ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${defaultRole === role ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        outline: 'none',
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <div style={hintStyle}>Role assigned to new users on first login</div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Endpoints Step ──────────────────────────────────────────

    const renderEndpointsStep = () => {
      const renderSamlEndpoints = () => (
        <>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Entity ID (Issuer)</label>
            <input
              type="text"
              placeholder="e.g., https://idp.example.com/saml/metadata"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              style={inputStyle}
            />
            <div style={hintStyle}>The unique identifier of the identity provider</div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>SSO URL (Login Endpoint)</label>
            <input
              type="text"
              placeholder="e.g., https://idp.example.com/saml/sso"
              value={ssoUrl}
              onChange={(e) => setSsoUrl(e.target.value)}
              style={inputStyle}
            />
            <div style={hintStyle}>Where authentication requests are sent</div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Metadata URL (Optional)</label>
            <input
              type="text"
              placeholder="e.g., https://idp.example.com/saml/metadata.xml"
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
              style={inputStyle}
            />
            <div style={hintStyle}>Auto-configure from IdP metadata document</div>
          </div>

          {/* SP Info (Read-only) */}
          <div style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.neutral[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{
              ...createSectionHeaderStyle(tokens),
              marginBottom: tokens.spacing[3],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <Link size={12} />
              Service Provider Details (copy these to your IdP)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>ACS URL</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[700],
                  fontFamily: 'monospace',
                }}>
                  <span style={{ flex: 1, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const }}>
                    https://app.example.com/auth/saml/callback
                  </span>
                  <Copy size={12} color={tokens.colors.neutral[400]} style={{ cursor: 'pointer', flexShrink: 0 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>SP Entity ID</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[700],
                  fontFamily: 'monospace',
                }}>
                  <span style={{ flex: 1, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const }}>
                    https://app.example.com/auth/saml/metadata
                  </span>
                  <Copy size={12} color={tokens.colors.neutral[400]} style={{ cursor: 'pointer', flexShrink: 0 }} />
                </div>
              </div>
            </div>
          </div>
        </>
      );

      const renderOidcEndpoints = () => (
        <>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Discovery URL</label>
            <input
              type="text"
              placeholder="e.g., https://idp.example.com/.well-known/openid-configuration"
              value={discoveryUrl}
              onChange={(e) => setDiscoveryUrl(e.target.value)}
              style={inputStyle}
            />
            <div style={hintStyle}>OpenID Connect discovery endpoint for auto-configuration</div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[4],
          }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Client ID</label>
              <input
                type="text"
                placeholder="Your OIDC client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Client Secret</label>
              <input
                type="password"
                placeholder="Your OIDC client secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Redirect URI (Read-only) */}
          <div style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.neutral[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{
              ...createSectionHeaderStyle(tokens),
              marginBottom: tokens.spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <ExternalLink size={12} />
              Redirect URI (copy to your IdP)
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              fontFamily: 'monospace',
            }}>
              <span style={{ flex: 1 }}>https://app.example.com/auth/oidc/callback</span>
              <Copy size={14} color={tokens.colors.neutral[400]} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </>
      );

      const renderOauth2Endpoints = () => (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[4],
          }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Client ID</label>
              <input
                type="text"
                placeholder="Your OAuth2 client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Client Secret</label>
              <input
                type="password"
                placeholder="Your OAuth2 client secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Authorization URL</label>
            <input
              type="text"
              placeholder="e.g., https://idp.example.com/oauth2/authorize"
              value={ssoUrl}
              onChange={(e) => setSsoUrl(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Token URL</label>
            <input
              type="text"
              placeholder="e.g., https://idp.example.com/oauth2/token"
              value={discoveryUrl}
              onChange={(e) => setDiscoveryUrl(e.target.value)}
              style={inputStyle}
            />
          </div>
        </>
      );

      const renderLdapEndpoints = () => (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr',
            gap: tokens.spacing[4],
          }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>LDAP Host</label>
              <input
                type="text"
                placeholder="e.g., ldap.example.com"
                value={ldapHost}
                onChange={(e) => setLdapHost(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Port</label>
              <input
                type="text"
                placeholder="389"
                value={ldapPort}
                onChange={(e) => setLdapPort(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Base DN</label>
            <input
              type="text"
              placeholder="e.g., dc=example,dc=com"
              value={ldapBaseDn}
              onChange={(e) => setLdapBaseDn(e.target.value)}
              style={inputStyle}
            />
            <div style={hintStyle}>The root distinguished name for LDAP searches</div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Bind DN (Optional)</label>
            <input
              type="text"
              placeholder="e.g., cn=admin,dc=example,dc=com"
              value={ldapBindDn}
              onChange={(e) => setLdapBindDn(e.target.value)}
              style={inputStyle}
            />
            <div style={hintStyle}>Service account DN for directory lookups</div>
          </div>
        </>
      );

      return (
        <div>
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[1],
            }}>
              Configure {selectedProtocol} Endpoints
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              Enter the endpoint URLs from your identity provider
            </p>
          </div>

          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: tokens.spacing[5],
            ...(isModern ? glassCardStyle : {}),
          }}>
            {selectedProtocol === 'SAML' && renderSamlEndpoints()}
            {selectedProtocol === 'OIDC' && renderOidcEndpoints()}
            {selectedProtocol === 'OAuth2' && renderOauth2Endpoints()}
            {selectedProtocol === 'LDAP' && renderLdapEndpoints()}
          </div>
        </div>
      );
    };

    // ─── Render: Certificate Step ────────────────────────────────────────

    const renderCertificateStep = () => {
      const isOptional = selectedProtocol === 'OAuth2' || selectedProtocol === 'LDAP';

      return (
        <div>
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              marginBottom: tokens.spacing[1],
            }}>
              {isOptional ? 'Upload Certificate (Optional)' : 'Upload Signing Certificate'}
            </h2>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
            }}>
              {isOptional
                ? 'Optionally add a certificate for enhanced security'
                : 'Upload the X.509 signing certificate from your identity provider'}
            </p>
          </div>

          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: tokens.spacing[5],
            ...(isModern ? glassCardStyle : {}),
          }}>
            {/* Upload area */}
            {!certificateUploaded ? (
              <div
                onClick={() => {
                  setCertificateUploaded(true);
                  setCertificateIssuer('DigiCert SHA2 Extended Validation Server CA');
                  setCertificateExpiry('2027-03-15');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  border: `2px dashed ${tokens.colors.neutral[300]}`,
                  backgroundColor: tokens.colors.neutral[50],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: tokens.spacing[3],
                }}>
                  <Upload size={24} color={tokens.colors.primaryScale[500]} />
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[1],
                }}>
                  Drop certificate file here or click to upload
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                }}>
                  Supports .pem, .crt, .cer, .der formats
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  Maximum file size: 10 KB
                </div>
              </div>
            ) : (
              <div>
                {/* Certificate info card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.successScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                  marginBottom: tokens.spacing[4],
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: tokens.colors.successScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileKey size={24} color={tokens.colors.successScale[600]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[1],
                    }}>
                      <span style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.successScale[800],
                      }}>
                        Certificate Uploaded
                      </span>
                      <CheckCircle size={16} color={tokens.colors.successScale[500]} />
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[4],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                    }}>
                      <span>Issuer: {certificateIssuer}</span>
                      <span style={{ color: tokens.colors.neutral[300] }}>&middot;</span>
                      <span>Expires: {certificateExpiry}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCertificateUploaded(false);
                      setCertificateIssuer('');
                      setCertificateExpiry('');
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    Replace
                  </button>
                </div>

                {/* Certificate details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: tokens.spacing[3],
                }}>
                  <div style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Algorithm</div>
                    <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>SHA-256 RSA</div>
                  </div>
                  <div style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Key Size</div>
                    <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>2048 bit</div>
                  </div>
                  <div style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Status</div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <ShieldCheck size={14} color={tokens.colors.successScale[500]} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skip notice for optional protocols */}
            {isOptional && !certificateUploaded && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                marginTop: tokens.spacing[4],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.infoScale[700],
              }}>
                <AlertTriangle size={14} color={tokens.colors.infoScale[500]} />
                <span>Certificate is optional for {selectedProtocol}. You can proceed without uploading one.</span>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Test & Activate Step ────────────────────────────────────

    const renderTestStep = () => (
      <div>
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <h2 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            marginBottom: tokens.spacing[1],
          }}>
            Test & Activate Connection
          </h2>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
          }}>
            Verify your configuration before activating the connection
          </p>
        </div>

        {/* Configuration summary */}
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: tokens.spacing[5],
          marginBottom: tokens.spacing[4],
          ...(isModern ? glassCardStyle : {}),
        }}>
          <div style={{
            ...createSectionHeaderStyle(tokens),
            marginBottom: tokens.spacing[3],
          }}>
            Configuration Summary
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[3],
          }}>
            <div style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Protocol</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                {selectedProtocol === 'SAML' && <Shield size={16} color={tokens.colors.primaryScale[600]} />}
                {selectedProtocol === 'OIDC' && <Key size={16} color={tokens.colors.infoScale[600]} />}
                {selectedProtocol === 'OAuth2' && <Lock size={16} color={tokens.colors.secondaryScale[600]} />}
                {selectedProtocol === 'LDAP' && <Database size={16} color={tokens.colors.warningScale[600]} />}
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{selectedProtocol}</span>
              </div>
            </div>

            <div style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Provider</div>
              <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                {PROVIDER_OPTIONS.find(p => p.id === selectedProvider)?.label || 'Unknown'}
              </div>
            </div>

            <div style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Connection Name</div>
              <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{connectionName || '-'}</div>
            </div>

            <div style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Domain</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                <Globe size={14} color={tokens.colors.neutral[500]} />
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{domain || '-'}</span>
              </div>
            </div>

            <div style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Auto-Provision</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                {autoProvision ? <Zap size={14} color={tokens.colors.primaryScale[500]} /> : <Users size={14} color={tokens.colors.neutral[400]} />}
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  {autoProvision ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Certificate</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                {certificateUploaded
                  ? <><ShieldCheck size={14} color={tokens.colors.successScale[500]} /><span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>Uploaded</span></>
                  : <><XCircle size={14} color={tokens.colors.neutral[400]} /><span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Not uploaded</span></>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Test connection area */}
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: tokens.spacing[5],
          ...(isModern ? glassCardStyle : {}),
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            textAlign: 'center' as const,
            padding: `${tokens.spacing[4]}px 0`,
          }}>
            {/* Test status indicator */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: tokens.borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[4],
              backgroundColor:
                testStatus === 'idle' ? tokens.colors.neutral[100] :
                testStatus === 'testing' ? tokens.colors.primaryScale[50] :
                testStatus === 'success' ? tokens.colors.successScale[50] :
                tokens.colors.errorScale[50],
              transition: `all ${tokens.motion.hover}`,
            }}>
              {testStatus === 'idle' && <Play size={32} color={tokens.colors.neutral[400]} />}
              {testStatus === 'testing' && (
                <Loader2
                  size={32}
                  color={tokens.colors.primaryScale[500]}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              )}
              {testStatus === 'success' && <CheckCircle size={32} color={tokens.colors.successScale[500]} />}
              {testStatus === 'failure' && <XCircle size={32} color={tokens.colors.errorScale[500]} />}
            </div>

            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color:
                testStatus === 'idle' ? tokens.colors.neutral[700] :
                testStatus === 'testing' ? tokens.colors.primaryScale[700] :
                testStatus === 'success' ? tokens.colors.successScale[700] :
                tokens.colors.errorScale[700],
              marginBottom: tokens.spacing[2],
            }}>
              {testStatus === 'idle' && 'Ready to Test'}
              {testStatus === 'testing' && 'Testing Connection...'}
              {testStatus === 'success' && 'Connection Successful'}
              {testStatus === 'failure' && 'Connection Failed'}
            </div>

            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[5],
              maxWidth: 400,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              {testStatus === 'idle' && 'Click the button below to verify your SSO configuration can connect to the identity provider.'}
              {testStatus === 'testing' && 'Attempting to establish a secure connection with your identity provider...'}
              {testStatus === 'success' && 'Your SSO connection has been verified. You can now activate this connection to allow users to sign in.'}
              {testStatus === 'failure' && 'Unable to connect to your identity provider. Please check your configuration and try again.'}
            </div>

            {(testStatus === 'idle' || testStatus === 'failure') && (
              <button
                onClick={handleTest}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: tokens.shadows.sm,
                  outline: 'none',
                }}
              >
                <Play size={16} />
                {testStatus === 'failure' ? 'Retry Test' : 'Test Connection'}
              </button>
            )}

            {testStatus === 'success' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.successScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.successScale[700],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <CheckCircle size={16} />
                Connection verified and ready to activate
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // ─── Render: Navigation Footer ───────────────────────────────────────

    const renderNavigation = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: tokens.spacing[6],
        paddingTop: tokens.spacing[4],
        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      }}>
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: tokens.colors.common.white,
            color: currentStepIndex === 0 ? tokens.colors.neutral[300] : tokens.colors.neutral[700],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${currentStepIndex === 0 ? tokens.colors.neutral[100] : tokens.colors.neutral[200]}`,
            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[400],
        }}>
          Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
        </div>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            backgroundColor: !canGoNext ? tokens.colors.neutral[200] : tokens.colors.primaryScale[600],
            color: !canGoNext ? tokens.colors.neutral[400] : tokens.colors.common.white,
            border: 'none',
            cursor: !canGoNext ? 'not-allowed' : 'pointer',
            transition: `all ${tokens.motion.hover}`,
            boxShadow: canGoNext ? tokens.shadows.sm : 'none',
            outline: 'none',
          }}
        >
          {currentStep === 'test' ? (
            <>
              <CheckCircle size={16} />
              Activate Connection
            </>
          ) : (
            <>
              Next
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    );

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
        <div style={{ marginBottom: tokens.spacing[2] }}>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            New SSO Connection
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Set up a new single sign-on connection for your organization
          </p>
        </div>

        {renderStepIndicator()}

        {/* Step content */}
        {currentStep === 'protocol' && renderProtocolStep()}
        {currentStep === 'provider' && renderProviderStep()}
        {currentStep === 'endpoints' && renderEndpointsStep()}
        {currentStep === 'certificate' && renderCertificateStep()}
        {currentStep === 'test' && renderTestStep()}

        {renderNavigation()}
      </div>
    );
  },
});
