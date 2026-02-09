'use client';

/**
 * PlUserProfileEditor - Form Preset
 * Full profile editor form with tabs and validation
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createFocusRingStyle,
  createSectionHeaderStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlUserProfileEditorProps, UserProfile, ProfileSection, ValidationError } from '../../core';
import { PL_USER_PROFILE_EDITOR_DEFAULTS } from '../../core';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Globe,
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Github,
  Linkedin,
  Twitter,
  Save,
  X,
  Camera,
  Trash2,
  ChevronDown,
  AlertCircle,
  Check,
  Key,
} from 'lucide-react';

export const FormPlUserProfileEditor = createPreset<PlUserProfileEditorProps>({
  name: 'PlUserProfileEditor.Form',
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

    // ─── Internal State ─────────────────────────────────────────────────
    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
    const [activeTab, setActiveTab] = useState<ProfileSection>('personal');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
    const [showDateFormatDropdown, setShowDateFormatDropdown] = useState(false);
    const [avatarHovered, setAvatarHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // ─── Handlers ───────────────────────────────────────────────────────
    const handleFieldChange = useCallback((field: string, value: any) => {
      setEditedProfile(prev => {
        const parts = field.split('.');
        if (parts.length === 1) {
          return { ...prev, [field]: value };
        }
        // Nested field (e.g., 'socialLinks.github')
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
        setShowPasswordSection(false);
      }
    }, [currentPassword, newPassword, confirmPassword, onPasswordChange]);

    const handleSave = useCallback(() => {
      if (onSave) {
        onSave(editedProfile);
      }
    }, [editedProfile, onSave]);

    // ─── Utility ────────────────────────────────────────────────────────
    const getFieldError = useCallback((field: string): string | undefined => {
      return errors.find(e => e.field === field)?.message;
    }, [errors]);

    const focusRing = useMemo(() => createFocusRingStyle(tokens), [tokens]);

    // ─── Glass Styles ───────────────────────────────────────────────────
    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Tab Configuration ──────────────────────────────────────────────
    const tabs: Array<{ id: ProfileSection; label: string; icon: any }> = [
      { id: 'personal', label: 'Personal Info', icon: <User size={14} /> },
      { id: 'contact', label: 'Contact', icon: <Mail size={14} /> },
      { id: 'preferences', label: 'Preferences', icon: <Globe size={14} /> },
      { id: 'security', label: 'Security', icon: <Shield size={14} /> },
      { id: 'social', label: 'Social Links', icon: <Globe size={14} /> },
    ];

    // ─── Render: Input Field ────────────────────────────────────────────
    const renderInput = (
      field: string,
      label: string,
      placeholder: string,
      type: string = 'text',
      multiline: boolean = false
    ) => {
      const value = field.includes('.')
        ? (editedProfile as any)[field.split('.')[0]]?.[field.split('.')[1]] || ''
        : (editedProfile as any)[field] || '';
      const error = getFieldError(field);
      const isFocused = focusedField === field;

      return (
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
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
              rows={4}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  error ? tokens.colors.errorScale[300] : isFocused ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]
                }`,
                borderRadius: tokens.borderRadius.md,
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
                resize: 'vertical' as const,
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
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  error ? tokens.colors.errorScale[300] : isFocused ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]
                }`,
                borderRadius: tokens.borderRadius.md,
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
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
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Dropdown ───────────────────────────────────────────────
    const renderDropdown = (
      field: string,
      label: string,
      placeholder: string,
      options: Array<{ value: string; label: string }> | string[],
      showState: boolean,
      setShowState: (show: boolean) => void
    ) => {
      const value = (editedProfile as any)[field] || '';
      const error = getFieldError(field);
      const normalizedOptions = typeof options[0] === 'string'
        ? (options as string[]).map(o => ({ value: o, label: o }))
        : options as Array<{ value: string; label: string }>;
      const selectedOption = normalizedOptions.find(o => o.value === value);

      return (
        <div style={{ marginBottom: tokens.spacing[4], position: 'relative' as const }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
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
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.sm,
              color: value ? tokens.colors.neutral[900] : tokens.colors.neutral[400],
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                error ? tokens.colors.errorScale[300] : tokens.colors.neutral[300]
              }`,
              borderRadius: tokens.borderRadius.md,
              outline: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              textAlign: 'left' as const,
            }}
          >
            <span>{selectedOption?.label || placeholder}</span>
            <ChevronDown size={14} />
          </button>
          {showState && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              right: 0,
              marginTop: tokens.spacing[1],
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              maxHeight: 240,
              overflowY: 'auto' as const,
              padding: `${tokens.spacing[1]}px 0`,
              ...glassCardStyle,
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
                    fontSize: tokens.typography.fontSize.sm,
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
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Avatar Section ─────────────────────────────────────────
    const renderAvatarSection = () => (
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: `${tokens.spacing[6]}px 0`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        marginBottom: tokens.spacing[6],
      }}>
        <div
          style={{
            position: 'relative' as const,
            marginBottom: tokens.spacing[3],
          }}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
        >
          <div style={{
            width: 120,
            height: 120,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: editedProfile.avatar ? 'transparent' : tokens.colors.primaryScale[100],
            backgroundImage: editedProfile.avatar ? `url(${editedProfile.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: tokens.typography.fontSize['3xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.primaryScale[600],
            border: `3px solid ${tokens.colors.common.white}`,
            boxShadow: tokens.shadows.md,
          }}>
            {!editedProfile.avatar && `${editedProfile.firstName[0]}${editedProfile.lastName[0]}`}
          </div>
          {allowAvatarUpload && avatarHovered && (
            <div
              onClick={handleAvatarClick}
              style={{
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: 120,
                height: 120,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={32} color={tokens.colors.common.white} />
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
        {allowAvatarUpload && (
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button
              onClick={handleAvatarClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
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
              <Camera size={12} />
              Upload Photo
            </button>
            {editedProfile.avatar && onAvatarRemove && (
              <button
                onClick={onAvatarRemove}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.errorScale[600],
                  backgroundColor: tokens.colors.errorScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    );

    // ─── Render: Personal Tab ───────────────────────────────────────────
    const renderPersonalTab = () => (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {renderInput('firstName', 'First Name', 'Enter your first name')}
          {renderInput('lastName', 'Last Name', 'Enter your last name')}
        </div>
        {renderInput('email', 'Email Address', 'your.email@example.com', 'email')}
        {renderInput('bio', 'Bio', 'Tell us about yourself...', 'text', true)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          {renderInput('title', 'Job Title', 'e.g. Senior Developer')}
          {renderDropdown('department', 'Department', 'Select department', departments, showDepartmentDropdown, setShowDepartmentDropdown)}
        </div>
      </div>
    );

    // ─── Render: Contact Tab ────────────────────────────────────────────
    const renderContactTab = () => (
      <div>
        {renderInput('phone', 'Phone Number', '+1 (555) 123-4567', 'tel')}
        {renderInput('location', 'Location', 'City, Country')}
        {renderDropdown('timezone', 'Timezone', 'Select timezone', timezones, showTimezoneDropdown, setShowTimezoneDropdown)}
      </div>
    );

    // ─── Render: Preferences Tab ────────────────────────────────────────
    const renderPreferencesTab = () => (
      <div>
        {/* Theme selector */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
          }}>
            Theme
          </label>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {[
              { value: 'light', label: 'Light', icon: <Sun size={14} /> },
              { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
              { value: 'system', label: 'System', icon: <Monitor size={14} /> },
            ].map(theme => (
              <button
                key={theme.value}
                onClick={() => handlePreferenceChange('theme', theme.value)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: editedProfile.preferences.theme === theme.value ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  backgroundColor: editedProfile.preferences.theme === theme.value ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    editedProfile.preferences.theme === theme.value ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]
                  }`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                {theme.icon}
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date format */}
        {renderDropdown('dateFormat', 'Date Format', 'Select date format', dateFormats, showDateFormatDropdown, setShowDateFormatDropdown)}

        {/* Notification toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing[3],
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Bell size={16} color={tokens.colors.neutral[600]} />
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
              }}>
                Email Notifications
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                Receive email updates about your account
              </div>
            </div>
          </div>
          <button
            onClick={() => handlePreferenceChange('notifications', !editedProfile.preferences.notifications)}
            style={{
              width: 44,
              height: 24,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: editedProfile.preferences.notifications ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
              border: 'none',
              cursor: 'pointer',
              position: 'relative' as const,
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.common.white,
              position: 'absolute' as const,
              top: 2,
              left: editedProfile.preferences.notifications ? 22 : 2,
              transition: `all ${tokens.motion.hover}`,
              boxShadow: tokens.shadows.sm,
            }} />
          </button>
        </div>
      </div>
    );

    // ─── Render: Security Tab ───────────────────────────────────────────
    const renderSecurityTab = () => (
      <div>
        {/* Two-factor auth */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px`,
          backgroundColor: editedProfile.preferences.twoFactor ? tokens.colors.successScale[50] : tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
            editedProfile.preferences.twoFactor ? tokens.colors.successScale[200] : tokens.colors.neutral[200]
          }`,
          marginBottom: tokens.spacing[4],
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: editedProfile.preferences.twoFactor ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={20} color={editedProfile.preferences.twoFactor ? tokens.colors.successScale[600] : tokens.colors.neutral[500]} />
            </div>
            <div>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
              }}>
                Two-Factor Authentication
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: 2,
              }}>
                {editedProfile.preferences.twoFactor ? 'Enabled and active' : 'Add an extra layer of security'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handlePreferenceChange('twoFactor', !editedProfile.preferences.twoFactor)}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: editedProfile.preferences.twoFactor ? tokens.colors.errorScale[600] : tokens.colors.primaryScale[600],
              backgroundColor: editedProfile.preferences.twoFactor ? tokens.colors.errorScale[50] : tokens.colors.primaryScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                editedProfile.preferences.twoFactor ? tokens.colors.errorScale[200] : tokens.colors.primaryScale[200]
              }`,
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            {editedProfile.preferences.twoFactor ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Last password change */}
        {editedProfile.metadata.lastPasswordChange && (
          <div style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderRadius: tokens.borderRadius.md,
            marginBottom: tokens.spacing[4],
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
            }}>
              Last password change
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}>
              {formatDistanceToNow(editedProfile.metadata.lastPasswordChange, { addSuffix: true })}
            </div>
          </div>
        )}

        {/* Password change section */}
        {allowPasswordChange && onPasswordChange && (
          <div>
            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  fontSize: tokens.typography.fontSize.sm,
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
                <Key size={14} />
                Change Password
              </button>
            ) : (
              <div style={{
                padding: tokens.spacing[4],
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[800],
                  marginBottom: tokens.spacing[3],
                }}>
                  Change Password
                </div>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[900],
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    outline: 'none',
                    marginBottom: tokens.spacing[2],
                  }}
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[900],
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    outline: 'none',
                    marginBottom: tokens.spacing[2],
                  }}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[900],
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    outline: 'none',
                    marginBottom: tokens.spacing[2],
                  }}
                />
                {passwordError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.errorScale[600],
                    marginBottom: tokens.spacing[2],
                  }}>
                    <AlertCircle size={12} />
                    {passwordError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <button
                    onClick={handlePasswordSubmit}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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
                    Update Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[600],
                      backgroundColor: tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
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
        )}
      </div>
    );

    // ─── Render: Social Tab ─────────────────────────────────────────────
    const renderSocialTab = () => (
      <div>
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Github size={14} />
              GitHub
            </div>
          </label>
          <input
            type="text"
            value={editedProfile.socialLinks?.github || ''}
            onChange={(e) => handleFieldChange('socialLinks.github', e.target.value)}
            placeholder="https://github.com/username"
            style={{
              width: '100%',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[900],
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.md,
              outline: 'none',
              transition: `all ${tokens.motion.hover}`,
            }}
          />
        </div>

        <div style={{ marginBottom: tokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Linkedin size={14} />
              LinkedIn
            </div>
          </label>
          <input
            type="text"
            value={editedProfile.socialLinks?.linkedin || ''}
            onChange={(e) => handleFieldChange('socialLinks.linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            style={{
              width: '100%',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[900],
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.md,
              outline: 'none',
              transition: `all ${tokens.motion.hover}`,
            }}
          />
        </div>

        <div style={{ marginBottom: tokens.spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Twitter size={14} />
              Twitter
            </div>
          </label>
          <input
            type="text"
            value={editedProfile.socialLinks?.twitter || ''}
            onChange={(e) => handleFieldChange('socialLinks.twitter', e.target.value)}
            placeholder="https://twitter.com/username"
            style={{
              width: '100%',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[900],
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.md,
              outline: 'none',
              transition: `all ${tokens.motion.hover}`,
            }}
          />
        </div>
      </div>
    );

    // ─── Render: Tab Content ────────────────────────────────────────────
    const renderTabContent = () => {
      switch (activeTab) {
        case 'personal': return renderPersonalTab();
        case 'contact': return renderContactTab();
        case 'preferences': return renderPreferencesTab();
        case 'security': return renderSecurityTab();
        case 'social': return renderSocialTab();
        default: return null;
      }
    };

    // ─── Main Render ────────────────────────────────────────────────────
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
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {/* Header */}
          <div style={{ marginBottom: tokens.spacing[6] }}>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Profile Settings
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Manage your personal information and preferences
            </p>
          </div>

          {/* Main card */}
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            backgroundColor: tokens.colors.common.white,
            ...glassCardStyle,
          }}>
            {/* Avatar section */}
            {renderAvatarSection()}

            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              marginBottom: tokens.spacing[6],
              overflowX: 'auto' as const,
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: activeTab === tab.id ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === tab.id ? tokens.colors.primaryScale[600] : 'transparent'}`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px` }}>
              {renderTabContent()}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[4],
            padding: `${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.sm,
            ...glassCardStyle,
          }}>
            {hasUnsavedChanges && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.warningScale[600],
              }}>
                <AlertCircle size={16} />
                You have unsaved changes
              </div>
            )}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {onCancel && (
                <button
                  onClick={onCancel}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[600],
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    opacity: saving ? 0.5 : 1,
                    outline: 'none',
                  }}
                >
                  <X size={14} />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                  fontSize: tokens.typography.fontSize.sm,
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
                      width: 14,
                      height: 14,
                      border: `2px solid ${tokens.colors.common.white}`,
                      borderTopColor: 'transparent',
                      borderRadius: tokens.borderRadius.full,
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
