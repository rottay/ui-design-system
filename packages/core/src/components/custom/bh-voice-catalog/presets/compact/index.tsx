'use client';

/**
 * BhVoiceCatalog - Compact Preset
 * List view with inline language/gender badges.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhVoiceCatalogProps, VoiceProfile } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Mic, Play, Star, Activity, Volume2 } from 'lucide-react';

function getLanguageShort(language: string): string {
  return language.toUpperCase().substring(0, 2);
}

export const CompactBhVoiceCatalog = createPreset<BhVoiceCatalogProps>({
  name: 'BhVoiceCatalog.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhVoiceCatalogProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      voices: rawVoices = [],
      selectedVoiceId: controlledSelected,
      filterLanguage,
      filterGender,
      onVoiceSelect,
      onPreview,
      loading = false,
      className,
      style,
    } = props;

    const voices = Array.isArray(rawVoices) ? rawVoices : [];

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const selectedVoiceId = controlledSelected ?? localSelected;

    const handleVoiceSelect = useCallback((id: string) => {
      onVoiceSelect?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onVoiceSelect, controlledSelected]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const filteredVoices = useMemo(() => {
      return voices.filter(v => {
        if (filterLanguage && v.language !== filterLanguage) return false;
        if (filterGender && v.gender !== filterGender) return false;
        return true;
      });
    }, [voices, filterLanguage, filterGender]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <Mic size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
            Voice Catalog
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
            {filteredVoices.length} voices
          </Text>
        </Box>

        {/* Voice list */}
        {filteredVoices.length === 0 ? (
          <Box style={{ ...emptyState, padding: t.spacing[4] }}>
            <Mic size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No voices found</Text>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            {filteredVoices.map((voice, index) => {
              const isSelected = selectedVoiceId === voice.id;

              return (
                <Box
                  key={voice.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Voice: ${voice.name}`}
                  aria-selected={isSelected}
                  onClick={() => handleVoiceSelect(voice.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: index < filteredVoices.length - 1
                      ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                      : 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                    borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                    transition: `all ${t.motion.hover}`,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? t.colors.primaryScale[50] : 'transparent';
                  }}
                >
                  {/* Icon */}
                  <Volume2 size={16} strokeWidth={1.5} style={{ color: isSelected ? t.colors.primaryScale[600] : t.colors.neutral[400], flexShrink: 0 }} />

                  {/* Name */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>
                        {voice.name}
                      </Text>
                      {voice.isDefault && (
                        <Star size={12} strokeWidth={2} style={{ color: t.colors.warningScale[500], fill: t.colors.warningScale[500] }} />
                      )}
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {voice.provider}
                    </Text>
                  </Box>

                  {/* Badges */}
                  <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, flexShrink: 0 }}>
                    <Text>{getLanguageShort(voice.language)}</Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeRadius, flexShrink: 0, textTransform: 'capitalize' as const }}>
                    <Text>{voice.gender}</Text>
                  </Box>

                  {/* Preview button */}
                  {onPreview && voice.sampleUrl && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Preview ${voice.name}`}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onPreview(voice.id); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: t.borderRadius.md,
                        border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                        cursor: 'pointer', flexShrink: 0,
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Play size={12} strokeWidth={1.5} />
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
