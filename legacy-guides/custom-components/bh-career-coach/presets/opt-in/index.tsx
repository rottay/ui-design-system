'use client';

/**
 * BhCareerCoach - Opt-In Preset
 * Talent pool opt-in experience for candidates.
 * Professional, encouraging tone with clear value proposition.
 *
 * Sections:
 * 1. Header with value proposition
 * 2. Benefits list
 * 3. Consent form (email + checkbox + submit)
 * 4. Success state
 * 5. Already opted-in state
 */

import { useState, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  createErrorContainerStyle,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getCardPadding,
  createFocusRingStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { BhCareerCoachProps } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Users, CheckCircle, Bell, Briefcase, Shield,
  Calendar, Sparkles, ArrowRight, AlertCircle,
  RefreshCw, Mail, Lock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Module-level refs                                                   */
/* ------------------------------------------------------------------ */

let _Box: any;
let _Text: any;

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                      */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ tokens: t, width, height }: { tokens: DesignTokens; width?: string; height?: number }) {
  const skeletonStyle = createPersonalitySkeletonStyle(t);
  return (
    <_Box style={{ ...skeletonStyle, width: width || '100%', height: height || 16, marginBottom: t.spacing[2] }} />
  );
}

function LoadingSkeleton({ tokens: t }: { tokens: DesignTokens }) {
  const cardStyle = createCardStyle(t, { elevation: 'sm' });
  const padding = getCardPadding(t);
  return (
    <_Box style={{ ...cardStyle, padding, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
      <SkeletonBlock tokens={t} width="50%" height={24} />
      <SkeletonBlock tokens={t} width="80%" height={14} />
      <SkeletonBlock tokens={t} width="100%" height={14} />
      <SkeletonBlock tokens={t} width="60%" height={14} />
      <SkeletonBlock tokens={t} width="100%" height={44} />
      <SkeletonBlock tokens={t} width="100%" height={44} />
    </_Box>
  );
}

function BenefitItem({ icon: Icon, text, tokens: t }: {
  icon: any;
  text: string;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;

  return (
    <Box style={{
      display: 'flex', alignItems: 'flex-start', gap: t.spacing[3],
      padding: t.spacing[3],
      borderRadius: t.borderRadius.md,
      backgroundColor: t.colors.neutral[50],
      border: `1px solid ${t.colors.neutral[100]}`,
    }}>
      <Box style={{
        width: 32, height: 32, borderRadius: t.borderRadius.full,
        backgroundColor: t.colors.primaryScale[50],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={ICON_SIZES.section} color={t.colors.primaryScale[500]} />
      </Box>
      <Text style={{
        fontSize: t.typography.fontSize.sm,
        color: t.colors.neutral[700],
        lineHeight: 1.5,
        paddingTop: 4,
      }}>
        {text}
      </Text>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const OptInBhCareerCoach = createPreset<BhCareerCoachProps>({
  name: 'BhCareerCoach.OptIn',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCareerCoachProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const {
      data,
      loading = false,
      error,
      onRetry,
      onOptInTalentPool,
      candidateEmail = '',
      className,
      style,
    } = props;

    // ---- State ----
    const [email, setEmail] = useState(candidateEmail);
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [emailError, setEmailError] = useState('');

    // ---- Derived ----
    const ptypo = getPersonalityTypography(t);
    const cardPadding = getCardPadding(t);
    const focusRing = createFocusRingStyle(t);
    const talentPool = data?.talentPoolOptIn;
    const isAlreadyOptedIn = talentPool?.optedIn === true;

    // ---- Entrance animations ----
    const entrance = useCallback((index: number) => {
      const anim = createEntranceAnimation(t, { index });
      return {
        style: { ...anim.initial, ...anim.animate, transition: anim.transition },
      };
    }, [t]);

    // ---- Handlers ----
    const validateEmail = useCallback((value: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }, []);

    const handleSubmit = useCallback(() => {
      if (!email.trim()) {
        setEmailError('Please enter your email address');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      if (!consentAccepted) {
        return;
      }

      setEmailError('');
      setSubmitting(true);

      if (onOptInTalentPool) {
        onOptInTalentPool({ email, consentAccepted });
      }

      // Simulate async completion
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 600);
    }, [email, consentAccepted, onOptInTalentPool, validateEmail]);

    // ---- Accent bar ----
    const accentBar = createPersonalityAccentBar(t);

    // ---- Loading ----
    if (loading) {
      return (
        <Box className={className} style={{ ...style }}>
          <LoadingSkeleton tokens={t} />
        </Box>
      );
    }

    // ---- Error ----
    if (error) {
      const errorStyle = createErrorContainerStyle(t);
      return (
        <Box className={className} style={{ ...style }}>
          <Box style={errorStyle}>
            <AlertCircle size={ICON_SIZES.illustration} color={t.colors.errorScale[400]} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[700], marginTop: t.spacing[3] }}>
              Something went wrong
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.errorScale[600], marginTop: t.spacing[1] }}>
              {error}
            </Text>
            {onRetry && (
              <Box
                onClick={onRetry}
                role="button"
                tabIndex={0}
                style={{
                  marginTop: t.spacing[4],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  backgroundColor: t.colors.errorScale[600],
                  color: t.colors.common.white,
                  borderRadius: t.borderRadius.md,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  border: 'none',
                }}
              >
                <RefreshCw size={ICON_SIZES.label} />
                <Text style={{ color: t.colors.common.white, fontSize: t.typography.fontSize.sm }}>Try Again</Text>
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    // ====================================================================
    //  ALREADY OPTED IN STATE
    // ====================================================================
    if (isAlreadyOptedIn) {
      return (
        <Box className={className} style={{ ...style, ...entrance(0).style }}>
          <Box style={{
            ...createCardStyle(t, { elevation: 'md' }),
            padding: `${t.spacing[8]}px ${cardPadding}`,
            textAlign: 'center' as const,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            overflow: 'hidden' as const,
            position: 'relative' as const,
          }}>
            {accentBar && <Box style={{ ...accentBar, position: 'absolute' as const, top: 0, left: 0 }} />}
            <Box style={{
              width: 64, height: 64, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.successScale[50],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: t.spacing[4],
            }}>
              <CheckCircle size={ICON_SIZES.hero} color={t.colors.successScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.xl,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
              marginBottom: t.spacing[2],
            }}>
              You are in the Talent Pool
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              color: t.colors.neutral[600],
              lineHeight: 1.6,
              maxWidth: 480,
            }}>
              You have already opted into our talent pool. We will reach out when matching opportunities arise. Thank you for your interest!
            </Text>
            <Box style={{
              display: 'flex', gap: t.spacing[3], marginTop: t.spacing[5], flexWrap: 'wrap' as const, justifyContent: 'center',
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.successScale[50],
                border: `1px solid ${t.colors.successScale[200]}`,
              }}>
                <Bell size={ICON_SIZES.label} color={t.colors.successScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700], fontWeight: t.typography.fontWeight.medium }}>
                  Notifications active
                </Text>
              </Box>
              <Box style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[50],
                border: `1px solid ${t.colors.primaryScale[200]}`,
              }}>
                <Calendar size={ICON_SIZES.label} color={t.colors.primaryScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[700], fontWeight: t.typography.fontWeight.medium }}>
                  Profile active for 12 months
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

    // ====================================================================
    //  SUCCESS STATE (just submitted)
    // ====================================================================
    if (submitted) {
      return (
        <Box className={className} style={{ ...style, ...entrance(0).style }}>
          <Box style={{
            ...createCardStyle(t, { elevation: 'md' }),
            padding: `${t.spacing[8]}px ${cardPadding}`,
            textAlign: 'center' as const,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            overflow: 'hidden' as const,
            position: 'relative' as const,
          }}>
            {accentBar && <Box style={{ ...accentBar, position: 'absolute' as const, top: 0, left: 0 }} />}
            <Box style={{
              width: 72, height: 72, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.successScale[50],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: t.spacing[4],
            }}>
              <Sparkles size={32} color={t.colors.successScale[500]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.xl,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
              marginBottom: t.spacing[2],
            }}>
              Welcome to the Talent Pool!
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              color: t.colors.neutral[600],
              lineHeight: 1.6,
              maxWidth: 480,
              marginBottom: t.spacing[4],
            }}>
              You are all set. We will notify you at <Text as="span" style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{email}</Text> when new roles that match your profile become available.
            </Text>
            <Box style={{
              padding: t.spacing[4],
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[200]}`,
              width: '100%',
              maxWidth: 400,
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[700],
                marginBottom: t.spacing[2],
              }}>
                What happens next:
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {[
                  'We review your profile for upcoming roles',
                  'You receive email notifications for matching positions',
                  'Your profile stays active for 12 months',
                  'You can unsubscribe at any time',
                ].map((step, idx) => (
                  <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      width: 20, height: 20, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[600] }}>
                        {idx + 1}
                      </Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], lineHeight: 1.4 }}>
                      {step}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

    // ====================================================================
    //  MAIN OPT-IN FORM
    // ====================================================================
    return (
      <Box className={className} style={{ ...style, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>

        {/* ============================================================ */}
        {/*  HEADER: Value Proposition                                    */}
        {/* ============================================================ */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'md' }),
          padding: cardPadding,
          overflow: 'hidden' as const,
          position: 'relative' as const,
          ...entrance(0).style,
        }}>
          {accentBar && <Box style={{ ...accentBar, position: 'absolute' as const, top: 0, left: 0 }} />}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[4], paddingTop: accentBar ? t.spacing[2] : 0 }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 56, color: t.colors.primaryScale[50] }),
            }}>
              <Users size={ICON_SIZES.hero} color={t.colors.primaryScale[500]} />
            </Box>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                lineHeight: 1.3,
              }}>
                Join Our Talent Pool
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                color: t.colors.neutral[600],
                lineHeight: 1.6,
              }}>
                {talentPool?.description || 'While this particular role was not the right fit, your skills and experience are valuable. Join our talent pool to be considered for future opportunities that match your profile.'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* ============================================================ */}
        {/*  BENEFITS                                                     */}
        {/* ============================================================ */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: cardPadding,
          ...entrance(1).style,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.lg,
            fontWeight: ptypo.headingWeight,
            color: t.colors.neutral[900],
            letterSpacing: ptypo.headingLetterSpacing,
            marginBottom: t.spacing[3],
          }}>
            Benefits of Joining
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            {(talentPool?.benefits ?? [
              'Get notified about future matching roles',
              'Your profile stays on file for 12 months',
              'Priority consideration for new positions',
            ]).map((benefit, idx) => {
              const icons = [Bell, Calendar, Briefcase, Shield, Sparkles];
              const Icon = icons[idx % icons.length];
              return <BenefitItem key={idx} icon={Icon} text={benefit} tokens={t} />;
            })}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/*  CONSENT FORM                                                 */}
        {/* ============================================================ */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: cardPadding,
          ...entrance(2).style,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.lg,
            fontWeight: ptypo.headingWeight,
            color: t.colors.neutral[900],
            letterSpacing: ptypo.headingLetterSpacing,
            marginBottom: t.spacing[4],
          }}>
            Confirm Your Details
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
            {/* Email field */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.neutral[700],
              }}>
                Email Address
              </Text>
              <Box style={{ position: 'relative' as const }}>
                <div style={{
                  position: 'absolute' as const, top: 0, left: 0,
                  width: 40, height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none' as const,
                }}>
                  <Mail size={ICON_SIZES.section} color={t.colors.neutral[400]} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="your.email@example.com"
                  style={{
                    width: '100%',
                    padding: `${t.spacing[3]}px ${t.spacing[3]}px ${t.spacing[3]}px 40px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${emailError ? t.colors.errorScale[400] : t.colors.neutral[300]}`,
                    backgroundColor: t.colors.common.white,
                    fontSize: t.typography.fontSize.sm,
                    color: t.colors.neutral[700],
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                    fontFamily: 'inherit',
                    transition: `border-color ${t.motion.hover}`,
                  }}
                  onFocus={(e) => {
                    if (!emailError) {
                      Object.assign(e.target.style, { borderColor: t.colors.primaryScale[400] });
                    }
                  }}
                  onBlur={(e) => {
                    if (!emailError) {
                      Object.assign(e.target.style, { borderColor: t.colors.neutral[300] });
                    }
                  }}
                />
              </Box>
              {emailError && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], marginTop: 2 }}>
                  {emailError}
                </Text>
              )}
            </Box>

            {/* Privacy consent checkbox */}
            <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[3] }}>
              <div
                onClick={() => setConsentAccepted(!consentAccepted)}
                role="checkbox"
                aria-checked={consentAccepted}
                tabIndex={0}
                style={{
                  width: 20, height: 20,
                  borderRadius: t.borderRadius.sm,
                  border: `2px solid ${consentAccepted ? t.colors.primaryScale[500] : t.colors.neutral[300]}`,
                  backgroundColor: consentAccepted ? t.colors.primaryScale[500] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: 2,
                  transition: `all ${t.motion.hover}`,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setConsentAccepted(!consentAccepted);
                  }
                }}
              >
                {consentAccepted && <CheckCircle size={14} color={t.colors.common.white} />}
              </div>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[600],
                lineHeight: 1.5,
              }}>
                I agree to have my profile and interview data retained for up to 12 months for the purpose of being considered for future job opportunities. I understand I can withdraw my consent at any time.
              </Text>
            </Box>

            {/* Privacy note */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              padding: t.spacing[3],
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Lock size={ICON_SIZES.label} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], lineHeight: 1.4 }}>
                Your data is protected and will only be used for matching you with relevant opportunities. We never share your information with third parties.
              </Text>
            </Box>

            {/* Submit button */}
            <Box
              onClick={!submitting && consentAccepted && email.trim() ? handleSubmit : undefined}
              role="button"
              tabIndex={0}
              style={{
                padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                backgroundColor: consentAccepted && email.trim() ? t.colors.primaryScale[600] : t.colors.neutral[300],
                color: t.colors.common.white,
                borderRadius: t.borderRadius.md,
                fontSize: t.typography.fontSize.md,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: consentAccepted && email.trim() && !submitting ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.spacing[2],
                border: 'none',
                transition: `all ${t.motion.hover}`,
                opacity: consentAccepted && email.trim() ? 1 : 0.6,
              }}
            >
              {submitting ? (
                <Text style={{ color: t.colors.common.white, fontSize: t.typography.fontSize.md }}>Joining...</Text>
              ) : (
                <>
                  <Text style={{ color: t.colors.common.white, fontSize: t.typography.fontSize.md }}>Join Talent Pool</Text>
                  <ArrowRight size={ICON_SIZES.section} color={t.colors.common.white} />
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
