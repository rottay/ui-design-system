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

import { type CSSProperties, type ReactNode, useEffect, useId, useMemo, useState } from 'react';

import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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
 * Box metrics live in the skin. The four tones (surface, border, divider,
 * badge, and the header's gradient/grid pattern) resolve from `data-tone` +
 * `data-appearance` + `data-open` in
 * `foundation/tokens/css/presentation/components/skin/form-sections.css`,
 * which also owns the per-appearance shell/header/content geometry drained
 * from this engine (the former `getSectionShellStyles` and the header/content
 * padding maps). INLINE BOUNDARY: Typography owns font-size inline by
 * architecture (the engine stamps it per node), so the only inline styles
 * left are the facts-card title's family-private 17px
 * (`--_ds-form-sections-facts-title-size`, exact fallback) and the
 * consumer `style` passthrough. Everything else typographic — weights via
 * the `Text` weight classes, line-heights, measures, tracking, letter-case,
 * mono treatments — resolves through roles or the skin. The copy stacks
 * carry `data-part="section-copy"` / `data-part="facts-card-item-copy"` so
 * their flex survival geometry is skin-owned too.
 */

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
  // Optional channel with an English floor: the structure renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const requiredLabel = i18n?.tOr('form_sections.required', 'Required') ?? 'Required';
  const optionalLabel = i18n?.tOr('form_sections.optional', 'Optional') ?? 'Optional';

  // Base id for the aria-controls wiring: each collapsible header names the
  // content grid it expands (`{base}-{section.key}-content`).
  const sectionsBaseId = useId();

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
        /* Shell/header/content geometry is skin-owned off data-appearance. */
        const sectionContentId = `${sectionsBaseId}-${section.key}-content`;

        const sectionHeader = (
          <Flex align="center" justify="between" gap={14}>
            <Flex align="start" gap={14} data-part="section-lead">
              <Box data-part="section-index">
                {String(index + 1).padStart(2, '0')}
              </Box>

              <Stack spacing="xs" data-part="section-copy">
                <Flex align="center" gap={8} wrap="wrap">
                  {/* Type roles only: the title takes the engine's default
                      `md` size (`--ds-font-size-base`, the same 16px the
                      retired inline literal painted), the `bold` weight
                      class, and its line-height from the skin. */}
                  <Text
                    data-part="section-title"
                    weight="bold"
                  >
                    {section.title}
                  </Text>
                  {section.required ? <SectionChip label={requiredLabel} tone="required" /> : null}
                  {section.optional ? <SectionChip label={optionalLabel} tone="optional" /> : null}
                </Flex>

                {section.description ? (
                  /* Rhythm (line-height) and measure (max-inline-size) are
                     skin-owned; only the `sm` size role stays with the node. */
                  <Text
                    data-part="section-description"
                    size="sm"
                  >
                    {section.description}
                  </Text>
                ) : null}
              </Stack>
            </Flex>

            <Flex align="center" gap={10} data-part="section-trailing">
              {section.summary ? (
                <Box data-part="section-summary">
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
                >
                  <NavigationDownIcon size={15} decorative data-part="section-toggle-icon" />
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
          >
            {collapsible ? (
              <button
                type="button"
                data-part="section-header"
                aria-expanded={isOpen}
                aria-controls={sectionContentId}
                onClick={() => toggleSection(section.key)}
              >
                {sectionHeader}
              </button>
            ) : (
              <Box data-part="section-header">
                {sectionHeader}
              </Box>
            )}

            {/* Collapse cadence is skin-owned (grid-rows + opacity/transform
                keyed on the section's data-open, reduced-motion reachable);
                the engine stamps state only. */}
            <Box
              data-part="section-grid"
              id={sectionContentId}
              data-open={isOpen}
              data-collapsible={collapsible}
            >
              <Box data-part="section-clip">
                <Box
                  data-part="section-content"
                  data-open={isOpen}
                  data-collapsible={collapsible}
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
      style={style}
    >
      <Box data-part="facts-card-body">
        <Stack spacing="sm">
          {eyebrow ? (
            /* Tracking/case/mono family are skin-owned. */
            <Text
              data-part="facts-card-eyebrow"
              size="xs"
              weight="bold"
            >
              {eyebrow}
            </Text>
          ) : null}
          {/* The editorial 17px has no canonical font-size role (base=16,
              lg=18): Typography stamps font-size inline by architecture, so
              the size remains family-private with the exact rendered fallback.
              Weight takes the `bold` class. */}
          <Text
            data-part="facts-card-title"
            weight="bold"
            style={{
              fontSize: 'var(--_ds-form-sections-facts-title-size, 17px)',
            }}
          >
            {title}
          </Text>
          {description ? (
            <Text data-part="facts-card-description" size="sm">
              {description}
            </Text>
          ) : null}
        </Stack>

        <Stack spacing="sm" data-part="facts-card-items">
          {visibleItems.map((item) => (
            <Flex
              key={item.label}
              data-part="facts-card-item"
              align="start"
              justify="between"
              gap={16}
            >
              <Stack spacing="xs" data-part="facts-card-item-copy">
                <Text
                  data-part="facts-card-item-label"
                  size="xs"
                  weight="bold"
                >
                  {item.label}
                </Text>
                {item.helper ? (
                  <Text data-part="facts-card-item-helper" size="xs">
                    {item.helper}
                  </Text>
                ) : null}
              </Stack>
              {/* Measure, end alignment, break strategy and the mono
                  treatment are skin-owned; `data-mono` stamps the state. */}
              <Text
                data-part="facts-card-item-value"
                size="sm"
                weight="medium"
                data-mono={item.mono ? 'true' : undefined}
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
    >
      <Text
        data-part="section-chip-label"
        size="xs"
        weight="bold"
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
