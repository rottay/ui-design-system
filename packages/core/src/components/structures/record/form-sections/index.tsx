'use client';

/**
 * @fileoverview form-sections — structures-tier accordion / collapsible
 * form section container with tone and appearance variants.
 *
 * @description
 * Engine-free structures family for organizing form content into themed
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
 *   - `FormFactsCard` — a sibling card component that renders
 *     a vertical list of label/value facts with optional eyebrow +
 *     helper text. Uses the same DS tokens so it composes visually
 *     with the section container.
 *
 * The family stays domain-agnostic. Section titles, descriptions,
 * summaries, and chip text are all consumer-supplied; the component
 * knows nothing about tenants, users, or any specific entity.
 *
 * @note Historical naming: this folder was called `premium-form-sections`
 * before Checkpoint C of the 2026-04-08 audit and the identifiers
 * started with the `Premium…` prefix (`PremiumFormSections`,
 * `PremiumFormFactsCard`). Checkpoint D promoted the canonical names
 * to `FormSections` / `FormFactsCard` and demoted the old names to
 * compat aliases declared at the bottom of this file. Those aliases
 * stay in place until all known consumers have migrated (scheduled
 * for removal in Checkpoint F if no consumers remain).
 */

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Box, Flex, Stack, Text } from '../../../primitives';

export type FormSectionsAppearance = 'card' | 'soft' | 'divided';
export type FormSectionTone = 'default' | 'editorial' | 'technical' | 'governance';

export interface FormSectionsEntry {
  key: string;
  title: string;
  description?: string;
  summary?: ReactNode;
  required?: boolean;
  optional?: boolean;
  defaultOpen?: boolean;
  extra?: ReactNode;
  appearance?: FormSectionsAppearance;
  tone?: FormSectionTone;
  children: ReactNode;
}

export interface FormSectionsProps {
  sections: FormSectionsEntry[];
  accordion?: boolean;
  collapsible?: boolean;
  defaultActiveKeys?: string[];
  activeKeys?: string[];
  onChange?: (keys: string | string[]) => void;
  style?: CSSProperties;
  appearance?: FormSectionsAppearance;
  tone?: FormSectionTone;
}

export interface FormFactItem {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  mono?: boolean;
}

export interface FormFactsCardProps {
  title: string;
  description?: string;
  eyebrow?: string;
  items: FormFactItem[];
  style?: CSSProperties;
}

function buildInitialKeys(
  sections: FormSectionsEntry[],
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

/**
 * Box metrics only. The four tones (surface, border, divider, badge, and the
 * header's gradient/grid pattern) resolve from `data-tone` +
 * `data-appearance` + `data-open` in
 * `tokens/css/components/skin/form-sections.css`.
 */
function getSectionShellStyles(resolvedAppearance: FormSectionsAppearance): CSSProperties {
  if (resolvedAppearance === 'divided') {
    return {
      width: '100%',
      overflow: 'visible',
    };
  }

  if (resolvedAppearance === 'soft') {
    return {
      width: '100%',
      overflow: 'hidden',
      transition: 'border-color 180ms ease, background 180ms ease',
    };
  }

  return {
    width: '100%',
    overflow: 'hidden',
    transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
  };
}

export function FormSections({
  sections,
  accordion = false,
  collapsible = false,
  defaultActiveKeys,
  activeKeys,
  onChange,
  style,
  appearance,
  tone,
}: FormSectionsProps) {
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
    <Stack className="ds-structure ds-form-sections" data-part="root" spacing="lg" style={style}>
      {sections.map((section, index) => {
        const isOpen = resolvedKeys.includes(section.key);
        const resolvedAppearance = section.appearance ?? appearance ?? (!collapsible ? 'divided' : 'card');
        const resolvedTone = section.tone ?? tone ?? 'default';
        const headerPadding = resolvedAppearance === 'divided' ? '16px 10px 14px' : '18px 18px 16px';
        const contentPadding =
          resolvedAppearance === 'divided'
            ? '20px 10px 6px'
            : resolvedAppearance === 'soft'
              ? '18px 18px 20px'
              : '18px 18px 20px';
        const headerShellStyle: CSSProperties = {
          width: '100%',
          padding: headerPadding,
        };

        const sectionHeader = (
          <Flex align="center" justify="between" gap={14}>
            <Flex align="start" gap={14} style={{ minWidth: 0, flex: 1 }}>
              <Box
                data-part="section-index"
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--ds-font-family-mono, monospace)',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Box>

              <Stack spacing="xs" style={{ flex: 1, minWidth: 0 }}>
                <Flex align="center" gap={8} wrap="wrap">
                  <Text
                    data-part="section-title"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.15,
                    }}
                  >
                    {section.title}
                  </Text>
                  {section.required ? <SectionChip label="Required" tone="required" /> : null}
                  {section.optional ? <SectionChip label="Optional" tone="optional" /> : null}
                </Flex>

                {section.description ? (
                  <Text
                    data-part="section-description"
                    size="sm"
                    style={{
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
                  data-part="section-summary"
                  style={{
                    maxWidth: 360,
                    padding: '5px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {typeof section.summary === 'string' || typeof section.summary === 'number' ? (
                    <Text data-part="section-summary-text" size="xs" weight="medium">
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
                  data-part="section-toggle"
                  data-open={isOpen}
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 180ms ease, border-color 180ms ease',
                  }}
                >
                  <ChevronDown data-part="section-toggle-icon" style={{ width: 15, height: 15 }} />
                </Box>
              ) : null}
            </Flex>
          </Flex>
        );

        return (
          <Box
            key={section.key}
            data-part="section"
            data-tone={resolvedTone}
            data-appearance={resolvedAppearance}
            data-open={isOpen}
            style={getSectionShellStyles(resolvedAppearance)}
          >
            {collapsible ? (
              <button
                type="button"
                data-part="section-header"
                aria-expanded={isOpen}
                onClick={() => toggleSection(section.key)}
                style={{
                  ...headerShellStyle,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {sectionHeader}
              </button>
            ) : (
              <Box data-part="section-header" style={headerShellStyle}>
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
                  data-part="section-content"
                  data-open={isOpen}
                  style={{
                    padding: contentPadding,
                    opacity: isOpen ? 1 : 0,
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

export function FormFactsCard({
  title,
  description,
  eyebrow,
  items,
  style,
}: FormFactsCardProps) {
  const visibleItems = useMemo(
    () => items.filter((item) => item.value !== undefined && item.value !== null && item.value !== ''),
    [items],
  );

  return (
    <Box
      className="ds-structure ds-form-sections"
      data-part="facts-card"
      style={{
        width: '100%',
        ...style,
      }}
    >
      <Box style={{ padding: 20 }}>
        <Stack spacing="sm">
          {eyebrow ? (
            <Text
              data-part="facts-card-eyebrow"
              size="xs"
              weight="bold"
              style={{
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontFamily: 'var(--ds-font-family-mono, monospace)',
              }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text data-part="facts-card-title" style={{ fontSize: 17, fontWeight: 700 }}>
            {title}
          </Text>
          {description ? (
            <Text data-part="facts-card-description" size="sm" style={{ lineHeight: 1.55 }}>
              {description}
            </Text>
          ) : null}
        </Stack>

        <Stack spacing="sm" style={{ marginTop: 18 }}>
          {visibleItems.map((item) => (
            <Flex
              key={item.label}
              data-part="facts-card-item"
              align="start"
              justify="between"
              gap={16}
              style={{
                padding: '10px 0',
              }}
            >
              <Stack spacing="xs" style={{ minWidth: 0, flex: 1 }}>
                <Text
                  data-part="facts-card-item-label"
                  size="xs"
                  weight="bold"
                  style={{
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                  }}
                >
                  {item.label}
                </Text>
                {item.helper ? (
                  <Text data-part="facts-card-item-helper" size="xs">
                    {item.helper}
                  </Text>
                ) : null}
              </Stack>
              <Text
                data-part="facts-card-item-value"
                size="sm"
                weight="medium"
                style={{
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
  return (
    <Box
      data-part="section-chip"
      data-badge-tone={tone}
      style={{
        padding: '4px 8px',
      }}
    >
      <Text
        data-part="section-chip-label"
        size="xs"
        weight="bold"
        style={{
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

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical Form* names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export {
  FormSections as PremiumFormSections,
  FormFactsCard as PremiumFormFactsCard,
};
export type {
  FormSectionsProps as PremiumFormSectionsProps,
  FormSectionsEntry as PremiumFormSection,
  FormSectionsAppearance as PremiumFormSectionsAppearance,
  FormSectionTone as PremiumFormSectionTone,
  FormFactItem as PremiumFormFactItem,
  FormFactsCardProps as PremiumFormFactsCardProps,
};
