'use client';

/**
 * @fileoverview form-sections — chrome-tier accordion / collapsible
 * form section container with tone and appearance variants.
 *
 * @description
 * Engine-free chrome family for organizing form content into themed
 * sections. Supports three appearance variants (`card`, `soft`,
 * `divided`) and four tone variants (`default`, `editorial`,
 * `technical`, `governance`). Each tone ships its own gradient + grid
 * background pattern generators so the section header reads like a
 * briefing card rather than a plain form group.
 *
 * Sections support: required/optional badges, summary chip slot, extra
 * action slot, controlled or uncontrolled accordion behavior,
 * per-section appearance/tone overrides.
 *
 * Companion exports:
 *   - `PremiumFormFactsCard` — a sibling card component that renders
 *     a vertical list of label/value facts with optional eyebrow +
 *     helper text. Uses the same DS tokens so it composes visually
 *     with the section container.
 *
 * The family stays domain-agnostic. Section titles, descriptions,
 * summaries, and chip text are all consumer-supplied; the component
 * knows nothing about tenants, users, or any specific entity.
 *
 * @note Historical naming: this folder was called `premium-form-sections`
 * before Checkpoint C of the 2026-04-08 audit and the exported component
 * identifiers still carry the `Premium…` prefix
 * (`PremiumFormSections`, `PremiumFormFactsCard`). The identifier rename
 * to `FormSections` / `FormFactsCard` is scheduled for Checkpoint D so
 * app-platform consumers can migrate in a single pass.
 */

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Box, Flex, Stack, Text } from '../../primitives';

export type PremiumFormSectionsAppearance = 'card' | 'soft' | 'divided';
export type PremiumFormSectionTone = 'default' | 'editorial' | 'technical' | 'governance';

export interface PremiumFormSection {
  key: string;
  title: string;
  description?: string;
  summary?: ReactNode;
  required?: boolean;
  optional?: boolean;
  defaultOpen?: boolean;
  extra?: ReactNode;
  appearance?: PremiumFormSectionsAppearance;
  tone?: PremiumFormSectionTone;
  children: ReactNode;
}

export interface PremiumFormSectionsProps {
  sections: PremiumFormSection[];
  accordion?: boolean;
  collapsible?: boolean;
  defaultActiveKeys?: string[];
  activeKeys?: string[];
  onChange?: (keys: string | string[]) => void;
  style?: CSSProperties;
  appearance?: PremiumFormSectionsAppearance;
  tone?: PremiumFormSectionTone;
}

export interface PremiumFormFactItem {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  mono?: boolean;
}

export interface PremiumFormFactsCardProps {
  title: string;
  description?: string;
  eyebrow?: string;
  items: PremiumFormFactItem[];
  style?: CSSProperties;
}

const sectionSurface = 'var(--ds-surface-card, var(--ds-color-bg-elevated))';
const sectionSurfaceMuted = 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 92%, var(--ds-color-bg-secondary) 8%)';
const sectionBorder = 'var(--ds-color-border-secondary)';
const sectionBorderActive = 'var(--ds-color-border)';
const sectionDivider = 'color-mix(in srgb, var(--ds-color-border-secondary) 78%, transparent)';
const sectionShadow = '0 14px 34px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent)';

function buildInitialKeys(
  sections: PremiumFormSection[],
  providedKeys?: string[],
  accordion?: boolean,
): string[] {
  if (providedKeys && providedKeys.length > 0) {
    return accordion ? [providedKeys[0]] : providedKeys;
  }

  const openKeys = sections
    .filter((section) => section.defaultOpen)
    .map((section) => section.key);

  if (accordion) {
    return [openKeys[0] || sections[0]?.key || ''];
  }

  if (openKeys.length > 0) {
    return openKeys;
  }

  return sections[0] ? [sections[0].key] : [];
}

function getToneAccent(tone: PremiumFormSectionTone) {
  switch (tone) {
    case 'editorial':
      return {
        badgeBackground: 'color-mix(in srgb, var(--ds-color-bg-primary) 34%, transparent)',
        badgeBorder: sectionBorder,
      };
    case 'technical':
      return {
        badgeBackground: 'color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent)',
        badgeBorder: sectionBorder,
      };
    case 'governance':
      return {
        badgeBackground: 'color-mix(in srgb, var(--ds-color-bg-primary) 44%, transparent)',
        badgeBorder: 'color-mix(in srgb, var(--ds-color-border) 62%, var(--ds-color-bg-primary) 38%)',
      };
    case 'default':
    default:
      return {
        badgeBackground: 'var(--ds-color-bg-secondary)',
        badgeBorder: sectionBorder,
      };
  }
}

function getToneShell(tone: PremiumFormSectionTone) {
  switch (tone) {
    case 'editorial':
      return {
        surface: 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 94%, var(--ds-color-bg-primary) 6%)',
        mutedSurface: 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 90%, var(--ds-color-bg-primary) 10%)',
        border: 'color-mix(in srgb, var(--ds-color-border-secondary) 82%, var(--ds-color-bg-primary) 18%)',
        activeBorder: 'color-mix(in srgb, var(--ds-color-border) 72%, var(--ds-color-bg-primary) 28%)',
        divider: 'color-mix(in srgb, var(--ds-color-border-secondary) 70%, var(--ds-color-bg-primary) 30%)',
      };
    case 'technical':
      return {
        surface: 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 94%, var(--ds-color-text-muted) 6%)',
        mutedSurface: 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 90%, var(--ds-color-bg-secondary) 10%)',
        border: 'color-mix(in srgb, var(--ds-color-border-secondary) 84%, var(--ds-color-text-muted) 16%)',
        activeBorder: 'color-mix(in srgb, var(--ds-color-border) 72%, var(--ds-color-text-muted) 28%)',
        divider: 'color-mix(in srgb, var(--ds-color-border-secondary) 74%, var(--ds-color-text-muted) 26%)',
      };
    case 'governance':
      return {
        surface: 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 95%, var(--ds-color-bg-primary) 5%)',
        mutedSurface: 'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 90%, var(--ds-color-bg-primary) 10%)',
        border: 'color-mix(in srgb, var(--ds-color-border-secondary) 82%, var(--ds-color-bg-primary) 18%)',
        activeBorder: 'color-mix(in srgb, var(--ds-color-border) 74%, var(--ds-color-bg-primary) 26%)',
        divider: 'color-mix(in srgb, var(--ds-color-border-secondary) 72%, var(--ds-color-bg-primary) 28%)',
      };
    case 'default':
    default:
      return {
        surface: sectionSurface,
        mutedSurface: sectionSurfaceMuted,
        border: sectionBorder,
        activeBorder: sectionBorderActive,
        divider: sectionDivider,
      };
  }
}

function getSectionHeaderPattern(tone: PremiumFormSectionTone) {
  switch (tone) {
    case 'editorial':
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-secondary) 8%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 24%, transparent)',
        gridSize: 26,
      };
    case 'technical':
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-secondary) 16%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 28%, transparent)',
        gridSize: 22,
      };
    case 'governance':
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-secondary) 8%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 26%, transparent)',
        gridSize: 24,
      };
    case 'default':
    default:
      return {
        accent: 'color-mix(in srgb, var(--ds-color-text-secondary) 14%, transparent)',
        accentSecondary: 'color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)',
        gridColor: 'color-mix(in srgb, var(--ds-color-text-muted) 22%, transparent)',
        gridSize: 26,
      };
  }
}

function getSectionShellStyles(
  resolvedAppearance: PremiumFormSectionsAppearance,
  isOpen: boolean,
  index: number,
  tone: PremiumFormSectionTone,
): CSSProperties {
  const shell = getToneShell(tone);

  if (resolvedAppearance === 'divided') {
    return {
      width: '100%',
      borderRadius: 0,
      overflow: 'visible',
      border: 'none',
      borderTop: index === 0 ? 'none' : `1px solid ${shell.divider}`,
      background: 'transparent',
      boxShadow: 'none',
      color: 'var(--ds-color-text-primary)',
    };
  }

  if (resolvedAppearance === 'soft') {
    return {
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      border: `1px solid ${shell.border}`,
      background: shell.mutedSurface,
      boxShadow: 'none',
      color: 'var(--ds-color-text-primary)',
      transition: 'border-color 180ms ease, background 180ms ease',
    };
  }

  return {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    border: `1px solid ${isOpen ? shell.activeBorder : shell.border}`,
    background: isOpen ? shell.surface : shell.mutedSurface,
    boxShadow: isOpen ? sectionShadow : 'none',
    color: 'var(--ds-color-text-primary)',
    transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
  };
}

export function PremiumFormSections({
  sections,
  accordion = true,
  collapsible = true,
  defaultActiveKeys,
  activeKeys,
  onChange,
  style,
  appearance,
  tone,
}: PremiumFormSectionsProps) {
  const [internalKeys, setInternalKeys] = useState<string[]>(
    buildInitialKeys(sections, defaultActiveKeys, accordion),
  );

  useEffect(() => {
    setInternalKeys(buildInitialKeys(sections, defaultActiveKeys, accordion));
  }, [sections, defaultActiveKeys, accordion]);

  const resolvedKeys = collapsible
    ? (activeKeys ?? internalKeys)
    : sections.map((section) => section.key);

  const toggleSection = (sectionKey: string) => {
    if (!collapsible) {
      return;
    }

    const nextKeys = accordion
      ? [sectionKey]
      : resolvedKeys.includes(sectionKey)
        ? resolvedKeys.length === 1
          ? resolvedKeys
          : resolvedKeys.filter((key) => key !== sectionKey)
        : [...resolvedKeys, sectionKey];

    if (!activeKeys) {
      setInternalKeys(nextKeys);
    }

    if (onChange) {
      onChange(accordion ? nextKeys[0] : nextKeys);
    }
  };

  return (
    <Stack spacing="lg" style={style}>
      {sections.map((section, index) => {
        const isOpen = resolvedKeys.includes(section.key);
        const resolvedAppearance = section.appearance ?? appearance ?? (!collapsible ? 'divided' : 'card');
        const resolvedTone = section.tone ?? tone ?? 'default';
        const accentTone = getToneAccent(resolvedTone);
        const shellTone = getToneShell(resolvedTone);
        const headerPattern = getSectionHeaderPattern(resolvedTone);
        const headerPadding = resolvedAppearance === 'divided' ? '16px 10px 14px' : '18px 18px 16px';
        const contentPadding =
          resolvedAppearance === 'divided'
            ? '20px 10px 6px'
            : resolvedAppearance === 'soft'
              ? '18px 18px 20px'
              : '18px 18px 20px';
        const headerBorderBottom = `1px solid ${shellTone.divider}`;
        const headerSurface =
          resolvedAppearance === 'divided'
            ? 'color-mix(in srgb, var(--ds-color-bg-secondary) 52%, transparent)'
            : isOpen
              ? 'color-mix(in srgb, var(--ds-color-bg-secondary) 70%, transparent)'
              : 'color-mix(in srgb, var(--ds-color-bg-secondary) 62%, transparent)';
        const headerShellStyle: CSSProperties = {
          width: '100%',
          padding: headerPadding,
          color: 'var(--ds-color-text-primary)',
          borderBottom: headerBorderBottom,
          backgroundColor: headerSurface,
          backgroundImage: [
            `radial-gradient(circle at 12% 14%, ${headerPattern.accent} 0%, transparent 48%)`,
            `radial-gradient(circle at 84% 0%, ${headerPattern.accentSecondary} 0%, transparent 30%)`,
            'radial-gradient(circle at 70% 100%, color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent) 0%, transparent 42%)',
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent) 0%, transparent 28%)',
            'linear-gradient(180deg, transparent 0%, transparent 34%, color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 36%, transparent) 100%)',
            `linear-gradient(${headerPattern.gridColor} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${headerPattern.gridColor} 1px, transparent 1px)`,
          ].join(', '),
          backgroundSize: `100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, ${headerPattern.gridSize}px ${headerPattern.gridSize}px, ${headerPattern.gridSize}px ${headerPattern.gridSize}px`,
          backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0',
        };

        const sectionHeader = (
          <Flex align="center" justify="between" gap={14}>
            <Flex align="start" gap={14} style={{ minWidth: 0, flex: 1 }}>
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${resolvedAppearance === 'divided' ? shellTone.divider : isOpen ? shellTone.activeBorder : shellTone.border}`,
                  background: resolvedAppearance === 'divided' ? 'transparent' : isOpen ? shellTone.mutedSurface : 'transparent',
                  fontFamily: 'var(--ds-font-family-mono, monospace)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--ds-color-text-tertiary)',
                  flexShrink: 0,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Box>

              <Stack spacing="xs" style={{ flex: 1, minWidth: 0 }}>
                <Flex align="center" gap={8} wrap="wrap">
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.15,
                      color: 'var(--ds-color-text-primary)',
                    }}
                  >
                    {section.title}
                  </Text>
                  {section.required ? <SectionChip label="Required" tone="required" /> : null}
                  {section.optional ? <SectionChip label="Optional" tone="optional" /> : null}
                </Flex>

                {section.description ? (
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.55,
                      maxWidth: 720,
                    }}
                  >
                    {section.description}
                  </Text>
                ) : null}
              </Stack>
            </Flex>

            <Flex align="center" gap={10} style={{ flexShrink: 0 }}>
              {section.summary ? (
                <Box
                  style={{
                    maxWidth: 360,
                    padding: '5px 10px',
                    borderRadius: 999,
                    border: `1px solid ${accentTone.badgeBorder}`,
                    background: accentTone.badgeBackground,
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {typeof section.summary === 'string' || typeof section.summary === 'number' ? (
                    <Text size="xs" weight="medium" style={{ color: 'var(--ds-color-text-primary)' }}>
                      {section.summary}
                    </Text>
                  ) : (
                    section.summary
                  )}
                </Box>
              ) : null}

              {section.extra ? section.extra : null}

              {collapsible ? (
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${resolvedAppearance === 'divided' ? shellTone.divider : isOpen ? shellTone.activeBorder : shellTone.border}`,
                    background: 'transparent',
                    transform: `rotate(${isOpen ? 180 : 0}deg)`,
                    transition: 'transform 180ms ease, border-color 180ms ease',
                  }}
                >
                  <ChevronDown style={{ width: 15, height: 15, color: 'var(--ds-color-text-secondary)' }} />
                </Box>
              ) : null}
            </Flex>
          </Flex>
        );

        return (
          <Box
            key={section.key}
            style={getSectionShellStyles(resolvedAppearance, isOpen, index, resolvedTone)}
          >
            {collapsible ? (
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleSection(section.key)}
                style={{
                  ...headerShellStyle,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {sectionHeader}
              </button>
            ) : (
              <Box style={headerShellStyle}>
                {sectionHeader}
              </Box>
            )}

            <Box
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: collapsible ? 'grid-template-rows 240ms ease' : 'none',
              }}
            >
              <Box style={{ overflow: 'hidden' }}>
                <Box
                  style={{
                    padding: contentPadding,
                    opacity: isOpen ? 1 : 0,
                    transform: `translateY(${isOpen ? 0 : -10}px)`,
                    color: 'var(--ds-color-text-primary)',
                    transition: collapsible ? 'opacity 180ms ease, transform 180ms ease' : 'none',
                  }}
                >
                  {section.children}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export function PremiumFormFactsCard({
  title,
  description,
  eyebrow,
  items,
  style,
}: PremiumFormFactsCardProps) {
  const visibleItems = useMemo(
    () => items.filter((item) => item.value !== undefined && item.value !== null && item.value !== ''),
    [items],
  );

  return (
    <Box
      style={{
        width: '100%',
        borderRadius: 16,
        border: `1px solid ${sectionBorder}`,
        background: sectionSurface,
        color: 'var(--ds-color-text-primary)',
        ...style,
      }}
    >
      <Box style={{ padding: 20 }}>
        <Stack spacing="sm">
          {eyebrow ? (
            <Text
              size="xs"
              weight="bold"
              style={{
                color: 'var(--ds-color-text-muted)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontFamily: 'var(--ds-font-family-mono, monospace)',
              }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text style={{ fontSize: 17, fontWeight: 700, color: 'var(--ds-color-text-primary)' }}>
            {title}
          </Text>
          {description ? (
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
              {description}
            </Text>
          ) : null}
        </Stack>

        <Stack spacing="sm" style={{ marginTop: 18 }}>
          {visibleItems.map((item) => (
            <Flex
              key={item.label}
              align="start"
              justify="between"
              gap={16}
              style={{
                padding: '10px 0',
                borderBottom: `1px solid ${sectionDivider}`,
              }}
            >
              <Stack spacing="xs" style={{ minWidth: 0, flex: 1 }}>
                <Text
                  size="xs"
                  weight="bold"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                  }}
                >
                  {item.label}
                </Text>
                {item.helper ? (
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                    {item.helper}
                  </Text>
                ) : null}
              </Stack>
              <Text
                size="sm"
                weight="medium"
                style={{
                  color: 'var(--ds-color-text-primary)',
                  maxWidth: 180,
                  textAlign: 'right',
                  wordBreak: 'break-word',
                  fontFamily: item.mono ? 'var(--ds-font-family-mono, monospace)' : undefined,
                }}
              >
                {item.value}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function SectionChip({
  label,
  tone,
}: {
  label: string;
  tone: 'required' | 'optional';
}) {
  const accent =
    tone === 'required'
      ? {
          background: 'color-mix(in srgb, var(--ds-color-bg-secondary) 88%, var(--ds-color-bg-primary) 12%)',
          border: 'var(--ds-color-border)',
          color: 'var(--ds-color-text-primary)',
        }
      : {
          background: 'var(--ds-color-bg-secondary)',
          border: sectionBorder,
          color: 'var(--ds-color-text-secondary)',
        };

  return (
    <Box
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        background: accent.background,
        border: `1px solid ${accent.border}`,
      }}
    >
      <Text
        size="xs"
        weight="bold"
        style={{
          color: accent.color,
          lineHeight: 1,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Box>
  );
}
