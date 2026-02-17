'use client';

/**
 * BhVoiceCatalog - Grid Preset
 * Card grid with language/gender badges, preview button, default star indicator.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhVoiceCatalogProps, VoiceProfile } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Mic, Play, Star, Globe, User, Activity, Volume2 } from 'lucide-react';

function getGenderIcon(gender: VoiceProfile['gender'], size: number) {
  return <User size={size} strokeWidth={1.5} />;
}

function getGenderLabel(gender: VoiceProfile['gender']): string {
  switch (gender) {
    case 'male': return 'Male';
    case 'female': return 'Female';
    case 'neutral': return 'Neutral';
  }
}

function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
    ja: 'Japanese', ko: 'Korean', zh: 'Chinese', it: 'Italian', nl: 'Dutch',
    ar: 'Arabic', hi: 'Hindi', ru: 'Russian',
  };
  return labels[language.toLowerCase()] || language;
}

export const GridBhVoiceCatalog = createPreset<BhVoiceCatalogProps>({
  name: 'BhVoiceCatalog.Grid',
  render: ({ primitives, props, tokens }: PresetContext<BhVoiceCatalogProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      voices: rawVoices = [],
      selectedVoiceId: controlledSelected,
      filterLanguage: controlledLanguage,
      filterGender: controlledGender,
      onVoiceSelect,
      onPreview,
      onFilterChange,
      loading = false,
      className,
      style,
    } = props;

    const voices = Array.isArray(rawVoices) ? rawVoices : [];

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const [localLanguage, setLocalLanguage] = useState<string | null>(null);
    const [localGender, setLocalGender] = useState<string | null>(null);

    const selectedVoiceId = controlledSelected ?? localSelected;
    const filterLanguage = controlledLanguage ?? localLanguage;
    const filterGender = controlledGender ?? localGender;

    const handleVoiceSelect = useCallback((id: string) => {
      onVoiceSelect?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onVoiceSelect, controlledSelected]);

    const handleFilterChange = useCallback((filter: { language?: string | null; gender?: string | null }) => {
      onFilterChange?.(filter);
      if (filter.language !== undefined && controlledLanguage === undefined) setLocalLanguage(filter.language);
      if (filter.gender !== undefined && controlledGender === undefined) setLocalGender(filter.gender);
    }, [onFilterChange, controlledLanguage, controlledGender]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);


    // Get unique languages and genders
    const languages = useMemo(() => Array.from(new Set(voices.map(v => v.language))), [voices]);
    const genders = useMemo(() => Array.from(new Set(voices.map(v => v.gender))), [voices]);

    // Filter voices
    const filteredVoices = useMemo(() => {
      return voices.filter(v => {
        if (filterLanguage && v.language !== filterLanguage) return false;
        if (filterGender && v.gender !== filterGender) return false;
        return true;
      });
    }, [voices, filterLanguage, filterGender]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading voices...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4], ...style }}>
        {/* Filter bar */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap' as const }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Globe size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>Language:</Text>
          </Box>
          <Box
            role="tab"
            tabIndex={0}
            aria-selected={filterLanguage === null}
            onClick={() => handleFilterChange({ language: null })}
            style={{
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeRadius,
              fontSize: t.typography.fontSize.xs, cursor: 'pointer',
              backgroundColor: filterLanguage === null ? t.colors.primaryScale[50] : 'transparent',
              color: filterLanguage === null ? t.colors.primaryScale[700] : t.colors.neutral[600],
              fontWeight: filterLanguage === null ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text>All</Text>
          </Box>
          {languages.map(lang => (
            <Box
              key={lang}
              role="tab"
              tabIndex={0}
              aria-selected={filterLanguage === lang}
              onClick={() => handleFilterChange({ language: filterLanguage === lang ? null : lang })}
              style={{
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                backgroundColor: filterLanguage === lang ? t.colors.primaryScale[50] : 'transparent',
                color: filterLanguage === lang ? t.colors.primaryScale[700] : t.colors.neutral[600],
                fontWeight: filterLanguage === lang ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Text>{getLanguageLabel(lang)}</Text>
            </Box>
          ))}

          <Box style={{ width: 1, height: 20, backgroundColor: t.colors.neutral[200], marginLeft: t.spacing[1], marginRight: t.spacing[1] }} />

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <User size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>Gender:</Text>
          </Box>
          {genders.map(g => (
            <Box
              key={g}
              role="tab"
              tabIndex={0}
              aria-selected={filterGender === g}
              onClick={() => handleFilterChange({ gender: filterGender === g ? null : g })}
              style={{
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs, cursor: 'pointer', textTransform: 'capitalize' as const,
                backgroundColor: filterGender === g ? t.colors.primaryScale[50] : 'transparent',
                color: filterGender === g ? t.colors.primaryScale[700] : t.colors.neutral[600],
                fontWeight: filterGender === g ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Text>{getGenderLabel(g)}</Text>
            </Box>
          ))}
        </Box>

        {/* Count */}
        <Text style={{ ...sectionLabel, marginBottom: 0 }}>
          {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''}
        </Text>

        {/* Voice Grid */}
        {filteredVoices.length === 0 ? (
          <Box style={emptyState}>
            <Mic size={48} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500] }}>
              No voices found
            </Text>
          </Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: t.spacing[4] }}>
            {filteredVoices.map((voice, index) => {
              const isSelected = selectedVoiceId === voice.id;
              const staggerDelay = createStaggerDelay(t, index);

              return (
                <Box
                  key={voice.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Voice: ${voice.name}`}
                  aria-selected={isSelected}
                  onClick={() => handleVoiceSelect(voice.id)}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    Object.assign(e.currentTarget.style, hoverStyles.hover);
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = t.shadows.sm;
                  }}
                  style={{
                    ...cardBase,
                    ...hoverStyles.base,
                    padding: t.spacing[4],
                    position: 'relative' as const,
                    borderColor: isSelected ? t.colors.primaryScale[400] : undefined,
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : (isGlass && t.glass ? t.glass.bg : t.colors.common.white),
                    ...entrance.animate,
                    transition: entrance.transition,
                    transitionDelay: `${staggerDelay}ms`,
                  }}
                >
                  {/* Default star */}
                  {voice.isDefault && (
                    <Box style={{ position: 'absolute' as const, top: t.spacing[2], right: t.spacing[2] }}>
                      <Star size={16} strokeWidth={2} style={{ color: t.colors.warningScale[500], fill: t.colors.warningScale[500] }} />
                    </Box>
                  )}

                  {/* Voice icon */}
                  <Box style={{
                    ...createIconContainerStyle(t, { size: 48, color: isSelected ? t.colors.primaryScale[100] : t.colors.neutral[100] }),
                    marginBottom: t.spacing[3],
                  }}>
                    <Volume2 size={24} strokeWidth={1.5} style={{ color: isSelected ? t.colors.primaryScale[600] : t.colors.neutral[500] }} />
                  </Box>

                  {/* Name */}
                  <Text style={{
                    fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight,
                    letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900],
                    display: 'block', marginBottom: t.spacing[1],
                  }}>
                    {voice.name}
                  </Text>

                  {/* Provider */}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[3] }}>
                    {voice.provider}
                  </Text>

                  {/* Badges */}
                  <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                    <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius }}>
                      <Text>{getLanguageLabel(voice.language)}</Text>
                    </Box>
                    <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeRadius, textTransform: 'capitalize' as const }}>
                      <Text>{voice.gender}</Text>
                    </Box>
                    <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius }}>
                      <Text>{voice.style}</Text>
                    </Box>
                  </Box>

                  {/* Preview button */}
                  {onPreview && voice.sampleUrl && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Preview ${voice.name}`}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onPreview(voice.id); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1],
                        width: '100%', padding: `${t.spacing[2]}px`,
                        borderRadius: t.borderRadius.md,
                        border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.neutral[50],
                        color: t.colors.neutral[600],
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Play size={14} strokeWidth={1.5} />
                      <Text>Preview</Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
