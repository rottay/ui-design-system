/**
 * Visual proof that tenant identity and locale are independent runtime axes.
 *
 * Each export mounts exactly one provider because tenant/theme attributes are
 * intentionally document-scoped. The visual-regression runner captures the
 * six stories as a 2 brands x 3 locales matrix and compares both computed
 * chrome and localized copy.
 */

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { TenantConfig } from '@/foundation/contracts';
import { useTranslation } from '@/infrastructure/runtime/i18n/composition';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami';
import { Box } from '@/ui/primitives/layout/Box';
import { Grid } from '@/ui/primitives/layout/Grid';
import { Stack } from '@/ui/primitives/layout/Stack';
import { Badge } from '@/ui/primitives/display/Badge';
import { Card } from '@/ui/primitives/display/Card';
import { Text } from '@/ui/primitives/display/Typography';
import { Button } from '@/ui/primitives/inputs/Button';
import { Tabs } from '@/ui/primitives/navigation/Tabs';

const BITHIRE_STATIC: TenantConfig = {
  slug: 'bithire',
  name: 'BitHire',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'BitHire' },
  brandTheme: bithireBrandTheme,
};

const THE_MANAGEMENT_DB: TenantConfig = {
  slug: 'themanagementmiami',
  name: 'The Management Miami',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'The Management Miami' },
  // Regression fixture for the DB payload. It is deliberately not registered
  // as a bundled tenant or static CSS artifact.
  brandTheme: themanagementmiamiBrandTheme,
};

// The DB supplies the override for the tenant's active locale. Keeping the
// three payloads beside the visual matrix proves that tenant-owned copy can
// change without coupling locale to BrandTheme or forking the DS catalog.
const THE_MANAGEMENT_DB_COPY: Record<
  'en' | 'es' | 'ar',
  NonNullable<TenantConfig['customTranslations']>
> = {
  en: { components: { empty: { description: 'No talent profiles yet' } } },
  es: { components: { empty: { description: 'Todavía no hay perfiles de talento' } } },
  ar: { components: { empty: { description: 'لا توجد ملفات مواهب بعد' } } },
};

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
      minHeight="100vh"
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

function withTenant(
  tenantConfig: TenantConfig,
  locale: 'en' | 'es' | 'ar',
): Decorator {
  const runtimeTenantConfig = tenantConfig.slug === 'themanagementmiami'
    ? { ...tenantConfig, customTranslations: THE_MANAGEMENT_DB_COPY[locale] }
    : tenantConfig;

  return (Story) => (
    <DesignSystemProvider
      tenantConfig={{ ...runtimeTenantConfig, locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      skipCssLoading
    >
      <Story />
    </DesignSystemProvider>
  );
}

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
} satisfies Meta<typeof BrandLocaleEvidence>;

export default meta;
type Story = StoryObj<typeof meta>;

interface RuntimeEvidenceExpectation {
  tenant: 'bithire' | 'themanagementmiami';
  locale: 'en' | 'es' | 'ar';
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
    const root = canvasElement.querySelector<HTMLElement>('[data-evidence-brand]');
    const primaryButton = canvas.getByRole('button', { name: expected.saveLabel });
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

const BITHIRE_CHROME = {
  tenant: 'bithire',
  primaryBackground: 'rgb(58, 111, 176)',
  buttonRadius: '9px',
  cardBackground: 'rgb(255, 255, 255)',
  cardRadius: '10px',
  fontMarker: 'Public Sans',
} as const;

const THE_MANAGEMENT_CHROME = {
  tenant: 'themanagementmiami',
  primaryBackground: 'rgb(15, 118, 110)',
  buttonRadius: '6px',
  cardBackground: 'rgb(255, 254, 251)',
  cardRadius: '8px',
  fontMarker: 'Optima',
} as const;

export const BitHireEnglish: Story = {
  args: { brandLabel: 'BitHire', sourceLabel: 'static vertical' },
  decorators: [withTenant(BITHIRE_STATIC, 'en')],
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
  decorators: [withTenant(BITHIRE_STATIC, 'es')],
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
  decorators: [withTenant(BITHIRE_STATIC, 'ar')],
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
  decorators: [withTenant(THE_MANAGEMENT_DB, 'en')],
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
  decorators: [withTenant(THE_MANAGEMENT_DB, 'es')],
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
  decorators: [withTenant(THE_MANAGEMENT_DB, 'ar')],
  play: verifyRuntimeEvidence({
    ...THE_MANAGEMENT_CHROME,
    locale: 'ar',
    direction: 'rtl',
    saveLabel: 'حفظ',
    searchLabel: 'بحث',
    emptyDescription: 'لا توجد ملفات مواهب بعد',
  }),
};
