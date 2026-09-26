/**
 * Visual proof that tenant identity and locale are independent runtime axes.
 *
 * Each export mounts exactly one provider because tenant/theme attributes are
 * intentionally document-scoped. Both tenants paint through the compile door:
 * the static vertical compiles its own intent, and the DB tenant publishes a
 * bounded TenantThemeDocument that is validated, hydrated, compiled and
 * declared to the provider as its visual authority. The artifact mounts before
 * the story renders, because the provider verifies it during its own render.
 */

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { TenantConfig } from '@/foundation/contracts';
import { useTranslation } from '@/infrastructure/runtime/i18n/composition';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { getKnownTenantConfig } from '@/entrypoints/public/runtime/tenant';
import {
  claimRootAttribute,
  composeRootAttributeReleases,
} from '@/entrypoints/public/runtime/root-attributes';
import {
  compileTenantThemeDocumentV2,
  documentThemeAdmission,
  mountTenantTheme,
  staticThemeIntent,
} from '@/entrypoints/server';
import type { TenantThemeDocumentV2 } from '@/entrypoints/server';
import type { VisualAuthorityDeclaration } from '@/entrypoints/public/contracts/runtime';
import bithireVerticalArtifact from '@/foundation/tokens/css/facade/artifacts/bithire/index.css?raw';
import { Box } from '@/components/primitives/layout/box';
import { Grid } from '@/components/primitives/layout/grid';
import { Stack } from '@/components/primitives/layout/stack';
import { Badge } from '@/components/primitives/display/badge';
import { Card } from '@/components/primitives/display/card';
import { Text } from '@/components/primitives/display/typography';
import { Button } from '@/components/primitives/inputs/button';
import { Tabs } from '@/components/primitives/navigation/tabs';

type EvidenceLocale = 'en' | 'es' | 'ar';
type EvidenceSource = 'bithire-static' | 'themanagement-db';

interface EvidenceCell {
  source: EvidenceSource;
  locale: EvidenceLocale;
}

// The DB channel expressed as the DB channel: the customer's published v2
// decision document over the approved kit, one row, never a FlatTheme.
const THE_MANAGEMENT_DOCUMENT: TenantThemeDocumentV2 = {
  version: 2,
  plan: 'pro',
  decisions: {
    'palette.seeds': {
      primary: '#0F766E',
      secondary: '#8C6D46',
      accent: '#B44F3C',
      background: '#FBF6EC',
    },
    'typography.pairing': 'editorial',
    'shape.radius-scale': 0.8,
    'shape.button-style': 'soft',
    'surfaces.elevation-posture': 'elevated',
    'density.mode': 'spacious',
  },
};

// The trusted row columns a customer never writes.
const THE_MANAGEMENT_IDENTITY = {
  tenantId: '8b2e6d41-0c39-4a7f-b5d2-9e14c6a08f37',
  slug: 'themanagementmiami',
  verticalKey: 'bithire',
  rowVersion: 1,
} as const;

// The DB supplies the override for the tenant's active locale. Keeping the
// three payloads beside the visual matrix proves that tenant-owned copy can
// change without coupling locale to the theme or forking the DS catalog.
const THE_MANAGEMENT_DB_COPY: Record<
  EvidenceLocale,
  NonNullable<TenantConfig['customTranslations']>
> = {
  en: { components: { empty: { description: 'No talent profiles yet' } } },
  es: { components: { empty: { description: 'Todavía no hay perfiles de talento' } } },
  ar: { components: { empty: { description: 'لا توجد ملفات مواهب بعد' } } },
};

interface EvidenceGround {
  tenantConfig: TenantConfig;
  rootAttributes: Readonly<Record<string, string | undefined>>;
  styles: ReadonlyArray<{ attributes: Readonly<Record<string, string>>; css: string }>;
  declaration?: VisualAuthorityDeclaration;
}

// The compiled bithire vertical exactly as the package stylesheet ships it; the
// preview loads only the tenant-free base. It is also the baseline every DB
// tenant of the vertical compiles its delta over.
const BITHIRE_VERTICAL_STYLE = {
  attributes: { 'data-evidence-vertical-artifact': 'bithire' },
  css: bithireVerticalArtifact,
};

async function bithireStaticGround(locale: EvidenceLocale): Promise<EvidenceGround> {
  // The registry's own object, unspread: code-owned identity is object identity.
  const tenantConfig = getKnownTenantConfig('bithire');
  if (!tenantConfig) throw new Error('The bundled bithire tenant is missing from the registry');
  const mounted = await mountTenantTheme(staticThemeIntent('bithire'), { themeMode: 'light', locale });
  return {
    tenantConfig,
    rootAttributes: mounted.rootAttributes,
    styles: [BITHIRE_VERTICAL_STYLE, ...mounted.styleElements],
  };
}

async function theManagementDbGround(locale: EvidenceLocale): Promise<EvidenceGround> {
  const { intent } = documentThemeAdmission({
    vertical: 'bithire',
    slug: THE_MANAGEMENT_IDENTITY.slug,
    document: THE_MANAGEMENT_DOCUMENT,
  });
  const { artifact } = compileTenantThemeDocumentV2({
    ...THE_MANAGEMENT_IDENTITY,
    document: THE_MANAGEMENT_DOCUMENT,
  });
  const mounted = await mountTenantTheme(intent, { artifact, themeMode: 'light', locale });
  return {
    tenantConfig: {
      slug: artifact.slug,
      name: 'The Management Miami',
      vertical: artifact.verticalKey,
      engine: 'modern',
      theme: 'light',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'The Management Miami' },
      appearance: artifact.normalizedAppearance,
    } as TenantConfig,
    rootAttributes: mounted.rootAttributes,
    styles: [BITHIRE_VERTICAL_STYLE, ...mounted.styleElements],
    declaration: {
      authority: 'compiled-artifact',
      artifact,
      ...(mounted.hydrationProof.receipt ? { ssrReceipt: mounted.hydrationProof.receipt } : {}),
    },
  };
}

// Filled by beforeEach, which may await; the decorator reads it synchronously.
const GROUNDS = new Map<string, EvidenceGround>();

async function mountEvidenceGround(cell: EvidenceCell): Promise<EvidenceGround> {
  const key = `${cell.source}|${cell.locale}`;
  let ground = GROUNDS.get(key);
  if (!ground) {
    ground = cell.source === 'bithire-static'
      ? await bithireStaticGround(cell.locale)
      : await theManagementDbGround(cell.locale);
    GROUNDS.set(key, ground);
  }
  return ground;
}

function mountedEvidenceGround(cell: EvidenceCell): EvidenceGround {
  const ground = GROUNDS.get(`${cell.source}|${cell.locale}`);
  if (!ground) throw new Error('The evidence ground mounts in beforeEach, before the story renders');
  return ground;
}

interface EvidenceProps {
  brandLabel: string;
  sourceLabel: 'static vertical' | 'tenant DB';
}

function BrandLocaleEvidence({ brandLabel, sourceLabel }: EvidenceProps) {
  const { t, locale } = useTranslation();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <Box
      data-evidence-brand={brandLabel}
      data-evidence-locale={locale}
      data-evidence-direction={direction}
      dir={direction}
      minHeight="100dvh"
      padding={{ xs: 'md', md: '2xl' }}
      background="var(--ds-color-bg-primary)"
    >
      <Stack spacing="xl">
        <Stack spacing="xs">
          <Badge tone="primary" badgeStyle="soft">
            {sourceLabel} · {locale.toUpperCase()} · {direction.toUpperCase()}
          </Badge>
          <Text as="h1" variant="h2">
            {brandLabel}
          </Text>
          <Text color="secondary">
            {t('components.empty.description')}
          </Text>
        </Stack>

        <Tabs
          type="contained"
          items={[
            {
              key: 'search',
              label: t('common.search'),
              content: <Text>{t('components.search.placeholder')}</Text>,
            },
            {
              key: 'filter',
              label: t('common.filter'),
              badge: 3,
              content: <Text>{t('components.table.filter')}</Text>,
            },
            {
              key: 'actions',
              label: t('common.actions'),
              content: <Text>{t('common.more')}</Text>,
            },
          ]}
        />

        <Grid columns={{ xs: 1, md: 2 }} gap="lg">
          <Card variant="outlined">
            <Card.Header
              eyebrow={t('common.dashboard_status_live')}
              title={t('common.key_metrics')}
              subtitle={t('components.table.rows_selected', { count: 3 })}
              extra={<Badge tone="success">84%</Badge>}
              divider
            />
            <Card.Body>
              <Stack spacing="md">
                <Text color="secondary">{t('components.empty.description')}</Text>
                <Stack direction="horizontal" spacing="sm" wrap>
                  <Button variant="primary">{t('common.save')}</Button>
                  <Button variant="secondary">{t('common.cancel')}</Button>
                </Stack>
              </Stack>
            </Card.Body>
          </Card>

          <Card variant="elevated">
            <Card.Header
              eyebrow={t('common.dashboard_status_connected')}
              title={t('common.shortcuts')}
              subtitle={t('components.pagination.page', { current: 1, total: 6 })}
              divider
            />
            <Card.Body>
              <Stack spacing="sm">
                <Text weight="semibold">{t('common.show_more')}</Text>
                <Text color="secondary">{t('components.search.no_results')}</Text>
              </Stack>
            </Card.Body>
          </Card>
        </Grid>
      </Stack>
    </Box>
  );
}

function evidenceCell(parameters: Record<string, unknown>): EvidenceCell {
  const cell = parameters.evidence as EvidenceCell | undefined;
  if (!cell) throw new Error('Brand x Locale stories declare parameters.evidence');
  return cell;
}

const withEvidenceTenant: Decorator = (Story, context) => {
  const cell = evidenceCell(context.parameters);
  const { source, locale } = cell;
  const ground = mountedEvidenceGround(cell);
  return (
    <DesignSystemProvider
      tenantConfig={ground.tenantConfig}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
      {...(source === 'themanagement-db'
        ? { customTranslations: THE_MANAGEMENT_DB_COPY[locale] }
        : {})}
      {...(ground.declaration ? { visualAuthority: ground.declaration } : {})}
    >
      <Story />
    </DesignSystemProvider>
  );
};

const meta = {
  title: 'System/Quality Evidence/Brand x Locale',
  component: BrandLocaleEvidence,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'desktop' },
    // This story is itself the provider boundary. The global Storybook
    // provider must not wrap it because tenant/theme/lang/dir are owned at the
    // document level and a nested provider would falsify the runtime evidence.
    skipGlobalDesignSystemProvider: true,
  },
  decorators: [withEvidenceTenant],
  // The artifact and the root scope it is nested under exist before the story
  // renders, and leave with it.
  beforeEach: async (context) => {
    const ground = await mountEvidenceGround(evidenceCell(context.parameters));
    const styles = ground.styles.map(({ attributes, css }) => {
      const style = document.createElement('style');
      for (const [name, value] of Object.entries(attributes)) style.setAttribute(name, value);
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    });
    const root = document.documentElement;
    const release = composeRootAttributeReleases(
      Object.entries(ground.rootAttributes)
        .filter((entry): entry is [string, string] => entry[1] !== undefined)
        .map(([name, value]) => claimRootAttribute(root, name, value)),
    );
    return () => {
      release();
      for (const style of styles) style.remove();
    };
  },
} satisfies Meta<typeof BrandLocaleEvidence>;

export default meta;
type Story = StoryObj<typeof meta>;

interface RuntimeEvidenceExpectation {
  tenant: 'bithire' | 'themanagementmiami';
  locale: EvidenceLocale;
  direction: 'ltr' | 'rtl';
  saveLabel: string;
  searchLabel: string;
  emptyDescription: string;
  primaryBackground: string;
  buttonRadius: string;
  cardBackground: string;
  cardRadius: string;
  fontMarker: string;
}

function verifyRuntimeEvidence(
  expected: RuntimeEvidenceExpectation,
): NonNullable<Story['play']> {
  return async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentElement = canvasElement.ownerDocument.documentElement;
    // The engine resolves after the first commit, so the play waits for it.
    const primaryButton = await canvas.findByRole(
      'button',
      { name: expected.saveLabel },
      { timeout: 15000 },
    );
    const root = canvasElement.querySelector<HTMLElement>('[data-evidence-brand]');
    const firstCard = canvasElement.querySelector<HTMLElement>('.ds-card');
    const selectedTab = canvas.getByRole('tab', { name: expected.searchLabel });
    const localizedEmptyDescriptions = canvas.getAllByText(expected.emptyDescription);

    await expect(root).not.toBeNull();
    await expect(firstCard).not.toBeNull();
    await expect(documentElement.dataset.tenant).toBe(expected.tenant);
    await expect(documentElement.lang).toBe(expected.locale);
    await expect(documentElement.dir).toBe(expected.direction);
    await expect(root?.dir).toBe(expected.direction);
    await expect(selectedTab.getAttribute('aria-selected')).toBe('true');
    await expect(localizedEmptyDescriptions.length).toBeGreaterThan(0);

    const buttonStyle = getComputedStyle(primaryButton);
    const cardStyle = getComputedStyle(firstCard!);
    const rootStyle = getComputedStyle(root!);

    await expect(buttonStyle.backgroundColor).toBe(expected.primaryBackground);
    await expect(buttonStyle.borderRadius).toBe(expected.buttonRadius);
    await expect(cardStyle.backgroundColor).toBe(expected.cardBackground);
    await expect(cardStyle.borderRadius).toBe(expected.cardRadius);
    await expect(rootStyle.fontFamily).toContain(expected.fontMarker);
    await expect(root!.scrollWidth).toBeLessThanOrEqual(root!.clientWidth);
  };
}

// The preset's seed and radius scale, its technical button radius, and the
// humanist-text pack.
const BITHIRE_CHROME = {
  tenant: 'bithire',
  primaryBackground: 'rgb(47, 91, 232)',
  buttonRadius: '2px',
  cardBackground: 'rgb(255, 255, 255)',
  cardRadius: '9.6px',
  fontMarker: 'Public Sans',
} as const;

// The customer's seed and soft buttons over the vertical's radius scale; the
// preview loads no editorial pack, so the pairing paints its Georgia fallback.
const THE_MANAGEMENT_CHROME = {
  tenant: 'themanagementmiami',
  primaryBackground: 'rgb(15, 118, 110)',
  buttonRadius: '6.4px',
  cardBackground: 'rgb(255, 255, 255)',
  cardRadius: '9.6px',
  fontMarker: 'Georgia',
} as const;

export const BitHireEnglish: Story = {
  args: { brandLabel: 'BitHire', sourceLabel: 'static vertical' },
  parameters: { evidence: { source: 'bithire-static', locale: 'en' } },
  play: verifyRuntimeEvidence({
    ...BITHIRE_CHROME,
    locale: 'en',
    direction: 'ltr',
    saveLabel: 'Save',
    searchLabel: 'Search',
    emptyDescription: 'No data',
  }),
};

export const BitHireSpanish: Story = {
  args: { brandLabel: 'BitHire', sourceLabel: 'static vertical' },
  parameters: { evidence: { source: 'bithire-static', locale: 'es' } },
  play: verifyRuntimeEvidence({
    ...BITHIRE_CHROME,
    locale: 'es',
    direction: 'ltr',
    saveLabel: 'Guardar',
    searchLabel: 'Buscar',
    emptyDescription: 'Sin datos',
  }),
};

export const BitHireArabicRtl: Story = {
  args: { brandLabel: 'BitHire', sourceLabel: 'static vertical' },
  parameters: { evidence: { source: 'bithire-static', locale: 'ar' } },
  play: verifyRuntimeEvidence({
    ...BITHIRE_CHROME,
    locale: 'ar',
    direction: 'rtl',
    saveLabel: 'حفظ',
    searchLabel: 'بحث',
    emptyDescription: 'لا توجد بيانات',
  }),
};

export const TheManagementEnglish: Story = {
  args: { brandLabel: 'The Management Miami', sourceLabel: 'tenant DB' },
  parameters: { evidence: { source: 'themanagement-db', locale: 'en' } },
  play: verifyRuntimeEvidence({
    ...THE_MANAGEMENT_CHROME,
    locale: 'en',
    direction: 'ltr',
    saveLabel: 'Save',
    searchLabel: 'Search',
    emptyDescription: 'No talent profiles yet',
  }),
};

export const TheManagementSpanish: Story = {
  args: { brandLabel: 'The Management Miami', sourceLabel: 'tenant DB' },
  parameters: { evidence: { source: 'themanagement-db', locale: 'es' } },
  play: verifyRuntimeEvidence({
    ...THE_MANAGEMENT_CHROME,
    locale: 'es',
    direction: 'ltr',
    saveLabel: 'Guardar',
    searchLabel: 'Buscar',
    emptyDescription: 'Todavía no hay perfiles de talento',
  }),
};

export const TheManagementArabicRtl: Story = {
  args: { brandLabel: 'The Management Miami', sourceLabel: 'tenant DB' },
  parameters: { evidence: { source: 'themanagement-db', locale: 'ar' } },
  play: verifyRuntimeEvidence({
    ...THE_MANAGEMENT_CHROME,
    locale: 'ar',
    direction: 'rtl',
    saveLabel: 'حفظ',
    searchLabel: 'بحث',
    emptyDescription: 'لا توجد ملفات مواهب بعد',
  }),
};
