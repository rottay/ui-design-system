'use client';

/**
 * PlUserProfileEditor - Sidebar Preset
 * Compact sidebar/drawer style profile editor with vertical section navigation.
 * Left: icon-based vertical nav with primary-colored active indicator.
 * Right: section content area. Top: large avatar with edit overlay + name/role badge.
 * Sections: Personal, Contact, Security, Preferences, Notifications.
 * Save/Cancel footer with unsaved-changes indicator.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createSectionHeaderStyle,
  createFocusRingStyle,
  createOverlayStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlUserProfileEditorProps, UserProfile, ProfileSection } from '../../core';
import { PL_USER_PROFILE_EDITOR_DEFAULTS } from '../../core';
import {
  User,
  Mail,
  Phone,
  Shield,
  Settings,
  Bell,
  Camera,
  Save,
  X,
  Check,
  AlertCircle,
  Key,
  Sun,
  Moon,
  Monitor,
  Globe,
  Clock,
  ChevronDown,
  MessageSquare,
  Smartphone,
  Wifi,
  Lock,
  Fingerprint,
  CheckCircle,
} from 'lucide-react';

// ─── Sidebar Section Type ──────────────────────────────────────────────────
type SidebarSection = 'personal' | 'contact' | 'security' | 'preferences' | 'notifications';

export const SidebarPlUserProfileEditor = createPreset<PlUserProfileEditorProps>({
  name: 'PlUserProfileEditor.Sidebar',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserProfileEditorProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      profile,
      onSave,
      onCancel,
      saving = false,
      errors = [],
      departments = PL_USER_PROFILE_EDITOR_DEFAULTS.departments || [],
      timezones = PL_USER_PROFILE_EDITOR_DEFAULTS.timezones || [],
      dateFormats = PL_USER_PROFILE_EDITOR_DEFAULTS.dateFormats || [],
      allowPasswordChange = PL_USER_PROFILE_EDITOR_DEFAULTS.allowPasswordChange,
      onPasswordChange,
      allowAvatarUpload = PL_USER_PROFILE_EDITOR_DEFAULTS.allowAvatarUpload,
      onAvatarUpload,
      onAvatarRemove,
      hasUnsavedChanges = false,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────
    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
    const [activeSection, setActiveSection] = useState<SidebarSection>('personal');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [avatarHovered, setAvatarHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dropdown states
    const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
    const [showDateFormatDropdown, setShowDateFormatDropdown] = useState(false);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Notification preferences local state
    const [notificationPrefs, setNotificationPrefs] = useState({
      email: true,
      push: true,
      sms: false,
      slack: false,
    });

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleFieldChange = useCallback((field: string, value: any) => {
      setEditedProfile(prev => {
        const parts = field.split('.');
        if (parts.length === 1) {
          return { ...prev, [field]: value };
        }
        const [parent, child] = parts;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof UserProfile] as any),
            [child]: value,
          },
        };
      });
    }, []);

    const handlePreferenceChange = useCallback((field: keyof typeof editedProfile.preferences, value: any) => {
      setEditedProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value,
        },
      }));
    }, []);

    const handleAvatarClick = useCallback(() => {
      if (allowAvatarUpload) {
        fileInputRef.current?.click();
      }
    }, [allowAvatarUpload]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onAvatarUpload) {
        onAvatarUpload(file);
      }
    }, [onAvatarUpload]);

    const handlePasswordSubmit = useCallback(() => {
      if (!newPassword || !confirmPassword) {
        setPasswordError('Please fill all password fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      setPasswordError('');
      if (onPasswordChange) {
        onPasswordChange(currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      }
    }, [currentPassword, newPassword, confirmPassword, onPasswordChange]);

    const handleSave = useCallback(() => {
      if (onSave) {
        onSave(editedProfile);
      }
    }, [editedProfile, onSave]);

    const handleNotificationToggle = useCallback((channel: keyof typeof notificationPrefs) => {
      setNotificationPrefs(prev => ({
        ...prev,
        [channel]: !prev[channel],
      }));
    }, []);

    // ─── Utility ─────────────────────────────────────────────────────────
    const getFieldError = useCallback((field: string): string | undefined => {
      return errors.find(e => e.field === field)?.message;
    }, [errors]);

    const focusRing = useMemo(() => createFocusRingStyle(tokens), [tokens]);

    // ─── Glass Styles ────────────────────────────────────────────────────
    const glassStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Nav Configuration ───────────────────────────────────────────────
    const navItems: Array<{ id: SidebarSection; label: string; icon: React.ReactNode }> = [
      { id: 'personal', label: 'Personal', icon: <User size={18} /> },
      { id: 'contact', label: 'Contact', icon: <Mail size={18} /> },
      { id: 'security', label: 'Security', icon: <Shield size={18} /> },
      { id: 'preferences', label: 'Preferences', icon: <Settings size={18} /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    // Available languages for preference select
    const languages = [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'ja', label: 'Japanese' },
    ];

    // Active sessions mock count
    const activeSessionsCount = 3;

    // ─── Render: Compact Input ───────────────────────────────────────────
    const renderCompactInput = (
      field: string,
      label: string,
      placeholder: string,
      type: string = 'text',
      multiline: boolean = false,
    ) => {
      const value = field.includes('.')
        ? (editedProfile as any)[field.split('.')[0]]?.[field.split('.')[1]] || ''
        : (editedProfile as any)[field] || '';
      const error = getFieldError(field);
      const isFocused = focusedField === field;

      return (
        <div style={{ marginBottom: tokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[600],
            marginBottom: tokens.spacing[1],
            letterSpacing: '0.01em',
          }}>
            {label}
          </label>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              placeholder={placeholder}
              rows={3}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  error ? tokens.colors.errorScale[300] : isFocused ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                borderRadius: tokens.borderRadius.md,
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                resize: 'vertical' as const,
                boxSizing: 'border-box' as const,
                ...(isFocused ? { boxShadow: `0 0 0 2px ${tokens.colors.primaryScale[100]}` } : {}),
              }}
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  error ? tokens.colors.errorScale[300] : isFocused ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                borderRadius: tokens.borderRadius.md,
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
                boxSizing: 'border-box' as const,
                ...(isFocused ? { boxShadow: `0 0 0 2px ${tokens.colors.primaryScale[100]}` } : {}),
              }}
            />
          )}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              marginTop: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
            }}>
              <AlertCircle size={10} />
              {error}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Compact Dropdown ────────────────────────────────────────
    const renderCompactDropdown = (
      field: string,
      label: string,
      placeholder: string,
      options: Array<{ value: string; label: string }> | string[],
      showState: boolean,
      setShowState: (show: boolean) => void,
    ) => {
      const value = (editedProfile as any)[field] || '';
      const error = getFieldError(field);
      const normalizedOptions = typeof options[0] === 'string'
        ? (options as string[]).map(o => ({ value: o, label: o }))
        : options as Array<{ value: string; label: string }>;
      const selectedOption = normalizedOptions.find(o => o.value === value);

      return (
        <div style={{ marginBottom: tokens.spacing[3], position: 'relative' as const }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[600],
            marginBottom: tokens.spacing[1],
            letterSpacing: '0.01em',
          }}>
            {label}
          </label>
          <button
            onClick={() => setShowState(!showState)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
              fontSize: tokens.typography.fontSize.sm,
              color: value ? tokens.colors.neutral[900] : tokens.colors.neutral[400],
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                error ? tokens.colors.errorScale[300] : tokens.colors.neutral[200]
              }`,
              borderRadius: tokens.borderRadius.md,
              outline: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              textAlign: 'left' as const,
              boxSizing: 'border-box' as const,
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown size={12} style={{
              flexShrink: 0,
              transform: showState ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${tokens.motion.hover}`,
            }} />
          </button>
          {showState && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              right: 0,
              marginTop: tokens.spacing[1],
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              maxHeight: 200,
              overflowY: 'auto' as const,
              padding: `${tokens.spacing[1]}px 0`,
              ...glassStyle,
            }}>
              {normalizedOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    handleFieldChange(field, option.value);
                    setShowState(false);
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    color: value === option.value ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: value === option.value ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              marginTop: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.errorScale[600],
            }}>
              <AlertCircle size={10} />
              {error}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Toggle Row ──────────────────────────────────────────────
    const renderToggleRow = (
      icon: React.ReactNode,
      label: string,
      description: string,
      isEnabled: boolean,
      onToggle: () => void,
    ) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[3]}px 0`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          flex: 1,
          minWidth: 0,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: isEnabled ? tokens.colors.primaryScale[50] : tokens.colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <div style={{ color: isEnabled ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }}>
              {icon}
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[800],
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              {label}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              lineHeight: tokens.typography.lineHeight.tight,
              marginTop: 1,
            }}>
              {description}
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            width: 38,
            height: 20,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: isEnabled ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
            border: 'none',
            cursor: 'pointer',
            position: 'relative' as const,
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
            flexShrink: 0,
            marginLeft: tokens.spacing[2],
          }}
        >
          <div style={{
            width: 16,
            height: 16,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.common.white,
            position: 'absolute' as const,
            top: 2,
            left: isEnabled ? 20 : 2,
            transition: `all ${tokens.motion.hover}`,
            boxShadow: tokens.shadows.sm,
          }} />
        </button>
      </div>
    );

    // ─── Render: Avatar Header ───────────────────────────────────────────
    const renderAvatarHeader = () => (
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        background: isModern && tokens.gradients
          ? tokens.gradients.primarySoft
          : tokens.colors.neutral[50],
      }}>
        {/* Avatar with edit overlay */}
        <div
          style={{
            position: 'relative' as const,
            marginBottom: tokens.spacing[3],
          }}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: editedProfile.avatar ? 'transparent' : tokens.colors.primaryScale[100],
            backgroundImage: editedProfile.avatar ? `url(${editedProfile.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.primaryScale[600],
            border: `3px solid ${tokens.colors.common.white}`,
            boxShadow: tokens.shadows.md,
          }}>
            {!editedProfile.avatar && `${editedProfile.firstName[0]}${editedProfile.lastName[0]}`}
          </div>
          {/* Camera overlay on hover */}
          {allowAvatarUpload && avatarHovered && (
            <div
              onClick={handleAvatarClick}
              style={{
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: 80,
                height: 80,
                borderRadius: tokens.borderRadius.full,
                ...createOverlayStyle(tokens, 'medium'),
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: tokens.spacing[1],
              }}
            >
              <Camera size={20} color={tokens.colors.common.white} />
              <span style={{
                fontSize: '9px',
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.common.white,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                Edit
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Name display */}
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
          textAlign: 'center' as const,
          lineHeight: tokens.typography.lineHeight.tight,
        }}>
          {editedProfile.firstName} {editedProfile.lastName}
        </div>

        {/* Email under name */}
        <div style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.neutral[500],
          marginTop: tokens.spacing[1],
          textAlign: 'center' as const,
        }}>
          {editedProfile.email}
        </div>

        {/* Role badge */}
        <div style={{
          display: 'flex',
          gap: tokens.spacing[1],
          marginTop: tokens.spacing[2],
          flexWrap: 'wrap' as const,
          justifyContent: 'center',
        }}>
          {editedProfile.title && (
            <span style={{
              ...createBadgeStyle(tokens, 'primary'),
              fontSize: '10px',
              padding: `2px ${tokens.spacing[2]}px`,
            }}>
              {editedProfile.title}
            </span>
          )}
          {editedProfile.department && (
            <span style={{
              ...createBadgeStyle(tokens, 'secondary'),
              fontSize: '10px',
              padding: `2px ${tokens.spacing[2]}px`,
            }}>
              {editedProfile.department}
            </span>
          )}
        </div>

        {/* Unsaved changes indicator - placed prominently in header */}
        {hasUnsavedChanges && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            marginTop: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            backgroundColor: tokens.colors.warningScale[50],
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.warningScale[700],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
          }}>
            <AlertCircle size={10} />
            Unsaved changes
          </div>
        )}
      </div>
    );

    // ─── Render: Vertical Nav ────────────────────────────────────────────
    const renderVerticalNav = () => (
      <div style={{
        width: 56,
        backgroundColor: tokens.colors.common.white,
        borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        paddingTop: tokens.spacing[2],
        paddingBottom: tokens.spacing[2],
        gap: tokens.spacing[1],
        flexShrink: 0,
      }}>
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                position: 'relative' as const,
              }}
            >
              {/* Active left border indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute' as const,
                  left: -8,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: `0 ${tokens.borderRadius.md} ${tokens.borderRadius.md} 0`,
                  backgroundColor: tokens.colors.primaryScale[600],
                }} />
              )}
              {item.icon}
              <span style={{
                fontSize: '8px',
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}>
                {item.label.length > 7 ? item.label.substring(0, 6) + '.' : item.label}
              </span>
            </button>
          );
        })}
      </div>
    );

    // ─── Render: Password Input ──────────────────────────────────────────
    const renderPasswordInput = (
      placeholder: string,
      value: string,
      onChange: (val: string) => void,
    ) => (
      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[900],
          backgroundColor: tokens.colors.common.white,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.md,
          outline: 'none',
          marginBottom: tokens.spacing[2],
          boxSizing: 'border-box' as const,
          transition: `border-color ${tokens.motion.hover}`,
        }}
      />
    );

    // ─── Render: Section Header ──────────────────────────────────────────
    const renderSectionTitle = (title: string, subtitle: string) => (
      <div style={{ marginBottom: tokens.spacing[4] }}>
        <div style={{
          fontSize: tokens.typography.fontSize.md,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[900],
          lineHeight: tokens.typography.lineHeight.tight,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.neutral[500],
          marginTop: tokens.spacing[1],
        }}>
          {subtitle}
        </div>
      </div>
    );

    // ─── Render: Personal Section ────────────────────────────────────────
    const renderPersonalSection = () => (
      <div>
        {renderSectionTitle('Personal Information', 'Update your personal details and bio')}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[3],
        }}>
          {renderCompactInput('firstName', 'First Name', 'John')}
          {renderCompactInput('lastName', 'Last Name', 'Doe')}
        </div>

        {renderCompactInput('bio', 'Bio', 'A brief description about yourself...', 'text', true)}
        {renderCompactInput('title', 'Job Title', 'e.g. Senior Developer')}
        {renderCompactDropdown(
          'department',
          'Department',
          'Select department',
          departments,
          showDepartmentDropdown,
          setShowDepartmentDropdown,
        )}
      </div>
    );

    // ─── Render: Contact Section ─────────────────────────────────────────
    const renderContactSection = () => (
      <div>
        {renderSectionTitle('Contact Details', 'How others can reach you')}

        {/* Email with verified badge */}
        <div style={{ marginBottom: tokens.spacing[3] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[600],
            marginBottom: tokens.spacing[1],
          }}>
            Email Address
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Mail size={14} color={tokens.colors.neutral[400]} />
            <span style={{
              flex: 1,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[800],
            }}>
              {editedProfile.email}
            </span>
            {editedProfile.metadata.emailVerified && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: `1px ${tokens.spacing[1]}px`,
                backgroundColor: tokens.colors.successScale[50],
                borderRadius: tokens.borderRadius.full,
                fontSize: '10px',
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.successScale[700],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
              }}>
                <CheckCircle size={9} />
                Verified
              </span>
            )}
          </div>
        </div>

        {renderCompactInput('phone', 'Phone Number', '+1 (555) 123-4567', 'tel')}

        {renderCompactDropdown(
          'timezone',
          'Timezone',
          'Select timezone',
          timezones,
          showTimezoneDropdown,
          setShowTimezoneDropdown,
        )}
      </div>
    );

    // ─── Render: Security Section ────────────────────────────────────────
    const renderSecuritySection = () => (
      <div>
        {renderSectionTitle('Security Settings', 'Manage your account security')}

        {/* Password change */}
        <div style={{
          padding: tokens.spacing[3],
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing[3],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showPasswordForm ? tokens.spacing[3] : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Key size={16} color={tokens.colors.primaryScale[600]} />
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                }}>
                  Password
                </div>
                {editedProfile.metadata.lastPasswordChange && (
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginTop: 1,
                  }}>
                    Last changed {formatDistanceToNow(editedProfile.metadata.lastPasswordChange, { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
            {allowPasswordChange && onPasswordChange && !showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.primaryScale[600],
                  backgroundColor: tokens.colors.primaryScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                Change
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div>
              {renderPasswordInput('Current password', currentPassword, setCurrentPassword)}
              {renderPasswordInput('New password', newPassword, setNewPassword)}
              {renderPasswordInput('Confirm new password', confirmPassword, setConfirmPassword)}
              {passwordError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.errorScale[600],
                  marginBottom: tokens.spacing[2],
                }}>
                  <AlertCircle size={10} />
                  {passwordError}
                </div>
              )}
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <button
                  onClick={handlePasswordSubmit}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.common.white,
                    backgroundColor: tokens.colors.primaryScale[600],
                    border: 'none',
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[600],
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MFA Toggle with status */}
        <div style={{
          padding: tokens.spacing[3],
          backgroundColor: editedProfile.preferences.twoFactor
            ? tokens.colors.successScale[50]
            : tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing[3],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
            editedProfile.preferences.twoFactor
              ? tokens.colors.successScale[200]
              : tokens.colors.neutral[100]
          }`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: editedProfile.preferences.twoFactor
                  ? tokens.colors.successScale[100]
                  : tokens.colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Fingerprint
                  size={16}
                  color={editedProfile.preferences.twoFactor
                    ? tokens.colors.successScale[600]
                    : tokens.colors.neutral[500]
                  }
                />
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                }}>
                  Multi-Factor Authentication
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: editedProfile.preferences.twoFactor
                    ? tokens.colors.successScale[700]
                    : tokens.colors.neutral[500],
                  marginTop: 1,
                }}>
                  {editedProfile.preferences.twoFactor ? 'Active and secured' : 'Not enabled'}
                </div>
              </div>
            </div>
            <button
              onClick={() => handlePreferenceChange('twoFactor', !editedProfile.preferences.twoFactor)}
              style={{
                width: 38,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: editedProfile.preferences.twoFactor
                  ? tokens.colors.successScale[500]
                  : tokens.colors.neutral[300],
                border: 'none',
                cursor: 'pointer',
                position: 'relative' as const,
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.common.white,
                position: 'absolute' as const,
                top: 2,
                left: editedProfile.preferences.twoFactor ? 20 : 2,
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
              }} />
            </button>
          </div>
        </div>

        {/* Active sessions */}
        <div style={{
          padding: tokens.spacing[3],
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Wifi size={16} color={tokens.colors.infoScale[600]} />
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                }}>
                  Active Sessions
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: 1,
                }}>
                  Currently signed in on {activeSessionsCount} devices
                </div>
              </div>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.infoScale[100],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.infoScale[700],
            }}>
              {activeSessionsCount}
            </span>
          </div>
        </div>
      </div>
    );

    // ─── Render: Preferences Section ─────────────────────────────────────
    const renderPreferencesSection = () => (
      <div>
        {renderSectionTitle('Preferences', 'Customize your experience')}

        {/* Theme toggle */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[600],
            marginBottom: tokens.spacing[2],
          }}>
            Appearance
          </label>
          <div style={{
            display: 'flex',
            gap: tokens.spacing[1],
            padding: tokens.spacing[1],
            backgroundColor: tokens.colors.neutral[100],
            borderRadius: tokens.borderRadius.md,
          }}>
            {[
              { value: 'light', label: 'Light', icon: <Sun size={13} /> },
              { value: 'dark', label: 'Dark', icon: <Moon size={13} /> },
              { value: 'system', label: 'System', icon: <Monitor size={13} /> },
            ].map(theme => {
              const isSelected = editedProfile.preferences.theme === theme.value;
              return (
                <button
                  key={theme.value}
                  onClick={() => handlePreferenceChange('theme', theme.value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: isSelected
                      ? tokens.typography.fontWeight.semibold
                      : tokens.typography.fontWeight.normal,
                    color: isSelected
                      ? tokens.colors.primaryScale[700]
                      : tokens.colors.neutral[600],
                    backgroundColor: isSelected
                      ? tokens.colors.common.white
                      : 'transparent',
                    border: 'none',
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                    boxShadow: isSelected ? tokens.shadows.sm : 'none',
                  }}
                >
                  {theme.icon}
                  {theme.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language select */}
        {renderCompactDropdown(
          'language',
          'Language',
          'Select language',
          languages,
          showLanguageDropdown,
          setShowLanguageDropdown,
        )}

        {/* Date format select */}
        {renderCompactDropdown(
          'dateFormat',
          'Date Format',
          'Select date format',
          dateFormats,
          showDateFormatDropdown,
          setShowDateFormatDropdown,
        )}
      </div>
    );

    // ─── Render: Notifications Section ───────────────────────────────────
    const renderNotificationsSection = () => (
      <div>
        {renderSectionTitle('Notifications', 'Choose how you want to be notified')}

        <div style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          padding: `0 ${tokens.spacing[3]}px`,
        }}>
          {renderToggleRow(
            <Mail size={14} />,
            'Email Notifications',
            'Receive updates via email',
            notificationPrefs.email,
            () => handleNotificationToggle('email'),
          )}
          {renderToggleRow(
            <Bell size={14} />,
            'Push Notifications',
            'Browser and mobile push alerts',
            notificationPrefs.push,
            () => handleNotificationToggle('push'),
          )}
          {renderToggleRow(
            <Smartphone size={14} />,
            'SMS Notifications',
            'Text message alerts for critical events',
            notificationPrefs.sms,
            () => handleNotificationToggle('sms'),
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[3]}px 0`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              flex: 1,
              minWidth: 0,
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: notificationPrefs.slack
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: `all ${tokens.motion.hover}`,
              }}>
                <div style={{
                  color: notificationPrefs.slack
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[400],
                }}>
                  <MessageSquare size={14} />
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  Slack Notifications
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  lineHeight: tokens.typography.lineHeight.tight,
                  marginTop: 1,
                }}>
                  Direct messages in Slack workspace
                </div>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('slack')}
              style={{
                width: 38,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: notificationPrefs.slack
                  ? tokens.colors.primaryScale[500]
                  : tokens.colors.neutral[300],
                border: 'none',
                cursor: 'pointer',
                position: 'relative' as const,
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
                flexShrink: 0,
                marginLeft: tokens.spacing[2],
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.common.white,
                position: 'absolute' as const,
                top: 2,
                left: notificationPrefs.slack ? 20 : 2,
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
              }} />
            </button>
          </div>
        </div>

        {/* Summary count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          marginTop: tokens.spacing[3],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          backgroundColor: tokens.colors.infoScale[50],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[100]}`,
        }}>
          <Check size={12} color={tokens.colors.infoScale[600]} />
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.infoScale[700],
          }}>
            {Object.values(notificationPrefs).filter(Boolean).length} of {Object.keys(notificationPrefs).length} channels enabled
          </span>
        </div>
      </div>
    );

    // ─── Render: Section Content ─────────────────────────────────────────
    const renderSectionContent = () => {
      switch (activeSection) {
        case 'personal': return renderPersonalSection();
        case 'contact': return renderContactSection();
        case 'security': return renderSecuritySection();
        case 'preferences': return renderPreferencesSection();
        case 'notifications': return renderNotificationsSection();
        default: return null;
      }
    };

    // ─── Main Render ─────────────────────────────────────────────────────
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          backgroundColor: tokens.colors.common.white,
          fontFamily: 'inherit',
          ...createSurfaceStyle(tokens, { elevation: 'md' }),
          ...glassStyle,
          overflow: 'hidden' as const,
          ...style,
        }}
      >
        {/* Avatar header at top */}
        {renderAvatarHeader()}

        {/* Body: nav + content */}
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden' as const,
        }}>
          {/* Left vertical nav */}
          {renderVerticalNav()}

          {/* Right content area */}
          <div style={{
            flex: 1,
            overflowY: 'auto' as const,
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[50],
          }}>
            {renderSectionContent()}
          </div>
        </div>

        {/* Footer: Save / Cancel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
          flexShrink: 0,
        }}>
          {/* Unsaved indicator in footer too */}
          {hasUnsavedChanges && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              marginRight: 'auto',
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.warningScale[600],
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.warningScale[500],
              }} />
              Unsaved
            </div>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: `all ${tokens.motion.hover}`,
                opacity: saving ? 0.5 : 1,
                outline: 'none',
              }}
            >
              <X size={12} />
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.common.white,
              backgroundColor: tokens.colors.primaryScale[600],
              border: 'none',
              borderRadius: tokens.borderRadius.md,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: `all ${tokens.motion.hover}`,
              opacity: saving ? 0.7 : 1,
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: 12,
                  height: 12,
                  border: `2px solid ${tokens.colors.common.white}`,
                  borderTopColor: 'transparent',
                  borderRadius: tokens.borderRadius.full,
                  animation: 'spin 0.6s linear infinite',
                }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={12} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    );
  },
});
