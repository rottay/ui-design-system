import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@/composition/components/showroom-ui';

interface RailStat {
  label: string;
  value: string;
  detail?: string;
}

interface RailPanel {
  title: string;
  body: string;
  tone?: 'default' | 'accent' | 'dark';
}

interface RailLink {
  label: string;
  href?: string;
}

interface FoundationTopRailProps {
  badge: string;
  title: string;
  description: string;
  stats?: RailStat[];
  panels?: RailPanel[];
  links?: RailLink[];
  backHref?: string;
  backLabel?: string;
}

function getPanelStyles(tone: RailPanel['tone']) {
  switch (tone) {
    case 'accent':
      return {
        background:
          'linear-gradient(180deg, rgba(224,242,254,0.94), var(--ds-color-bg-elevated))',
        border: '1px solid var(--ds-color-info-border)',
      };
    case 'dark':
      return {
        background:
          'linear-gradient(180deg, rgba(15,23,42,0.95), var(--ds-color-bg-elevated))',
        border: '1px solid var(--ds-color-border-tertiary)',
      };
    default:
      return {
        background:
          'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-elevated))',
        border: '1px solid var(--ds-color-border-secondary)',
      };
  }
}

function RailJumpPill({ label, href }: RailLink) {
  const content = (
    <Box
      style={{
        padding: '8px 12px',
        borderRadius: 999,
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-elevated))',
        color: 'var(--ds-color-text-secondary)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.35,
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}
    </Box>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  ) : (
    <Box>{content}</Box>
  );
}

export function FoundationTopRail({
  badge,
  title,
  description,
  stats = [],
  panels = [],
  links = [],
  backHref,
  backLabel,
}: FoundationTopRailProps) {
  const hasAside = panels.length > 0 || stats.length > 0;
  const [featuredPanel, ...supportPanels] = panels;
  const [featuredStat, ...supportStats] = stats;

  return (
    <Card
      style={{
        width: '100%',
        position: 'relative',
        padding: 22,
        overflow: 'hidden',
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-secondary) 0%, var(--ds-color-bg-surface) 60%, var(--ds-color-bg-secondary) 100%)',
        boxShadow: 'var(--ds-shadow-lg)',
      }}
    >
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at top left, rgba(59,130,246,0.16) 0%, transparent 34%),
            radial-gradient(circle at 88% 18%, rgba(34,197,94,0.12) 0%, transparent 28%),
            linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.68) 100%)
          `,
          opacity: 0.9,
        }}
      />

      <Stack spacing="md" fullWidth style={{ position: 'relative', zIndex: 1 }}>
        <Flex
          align="center"
          justify="between"
          gap={12}
          style={{ flexWrap: 'wrap' }}
        >
          <Flex align="center" gap={10} style={{ flexWrap: 'wrap' }}>
            {backHref && backLabel ? (
              <>
                <Link
                  href={backHref}
                  style={{
                    textDecoration: 'none',
                    color: 'var(--ds-color-link)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  {backLabel}
                </Link>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>/</Text>
              </>
            ) : null}
            <Badge variant="secondary">{badge}</Badge>
          </Flex>

          {links.length > 0 ? (
            <Box
              className="foundation-top-rail-links"
              style={{
                padding: '10px 12px',
                borderRadius: 16,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-elevated))',
                minWidth: 0,
              }}
            >
              <Stack spacing={8} fullWidth>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Quick jumps
                </Text>
                <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                  {links.map((link) => (
                    <RailJumpPill key={link.label} {...link} />
                  ))}
                </Flex>
              </Stack>
            </Box>
          ) : null}
        </Flex>

        <Box
          className="foundation-top-rail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: hasAside
              ? 'minmax(0, 1.18fr) minmax(280px, 0.82fr)'
              : 'minmax(0, 1fr)',
            gap: 20,
            alignItems: 'start',
            width: '100%',
          }}
        >
          <Stack spacing="md" fullWidth>
            <Stack spacing={10} fullWidth>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Runtime editorial reference
              </Text>
              <Text
                as={"h1" as any}
                size="3xl"
                weight="bold"
                style={{ maxWidth: 780, letterSpacing: '-0.04em' }}
              >
                {title}
              </Text>
            </Stack>

            <Box
              style={{
                padding: 16,
                borderRadius: 18,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.84))',
              }}
            >
              <Text
                size="md"
                style={{
                  color: 'var(--ds-color-text-secondary)',
                  maxWidth: 820,
                  lineHeight: 1.6,
                  overflowWrap: 'anywhere',
                }}
              >
                {description}
              </Text>
            </Box>

            {featuredPanel ? (
              <Box
                style={{
                  padding: 16,
                  borderRadius: 20,
                  border: '1px solid var(--ds-color-border-secondary)',
                  background:
                    featuredPanel.tone === 'dark'
                      ? 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,41,59,0.9))'
                      : featuredPanel.tone === 'accent'
                        ? 'linear-gradient(180deg, rgba(239,246,255,0.96), rgba(255,255,255,0.86))'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))',
                  boxShadow: 'var(--ds-shadow-sm)',
                  minWidth: 0,
                }}
              >
                <Stack spacing={6}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color:
                        featuredPanel.tone === 'dark'
                          ? 'rgba(255,255,255,0.72)'
                          : 'rgba(15,23,42,0.52)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                    }}
                  >
                    Featured read
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color:
                        featuredPanel.tone === 'dark'
                          ? 'rgba(255,255,255,0.92)'
                          : '#0f172a',
                    }}
                  >
                    {featuredPanel.title}
                  </Text>
                  <Box
                    aria-hidden="true"
                    style={{
                      height: 1,
                      borderRadius: 999,
                      background:
                        featuredPanel.tone === 'dark'
                          ? 'rgba(255,255,255,0.18)'
                          : 'var(--ds-color-border-secondary)',
                    }}
                  />
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color:
                        featuredPanel.tone === 'dark'
                          ? 'rgba(255,255,255,0.82)'
                          : 'rgba(15,23,42,0.74)',
                      lineHeight: 1.55,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {featuredPanel.body}
                  </Text>
                </Stack>
              </Box>
            ) : null}
          </Stack>

          {hasAside ? (
            <Stack spacing="md" fullWidth>
              {featuredStat ? (
                <Box
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background:
                      'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-elevated))',
                    minWidth: 0,
                  }}
                >
                  <Stack spacing={6}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {featuredStat.label}
                    </Text>
                    <Text size="2xl" weight="bold" style={{ lineHeight: 1.05 }}>
                      {featuredStat.value}
                    </Text>
                    {featuredStat.detail ? (
                      <Box
                        style={{
                          paddingTop: 10,
                          borderTop: '1px solid var(--ds-color-border-secondary)',
                        }}
                      >
                        <Text
                          size="xs"
                          style={{
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.5,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {featuredStat.detail}
                        </Text>
                      </Box>
                    ) : null}
                  </Stack>
                </Box>
              ) : null}

              {supportStats.length > 0 ? (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 10,
                    width: '100%',
                  }}
                >
                  {supportStats.map((stat) => (
                    <Box
                      key={stat.label}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        border: '1px solid var(--ds-color-border-secondary)',
                        background:
                          'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-elevated))',
                        minWidth: 0,
                        minHeight: 122,
                      }}
                    >
                      <Stack spacing={6}>
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            color: 'var(--ds-color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {stat.label}
                        </Text>
                        <Text size="lg" weight="bold" style={{ lineHeight: 1.1 }}>
                          {stat.value}
                        </Text>
                        {stat.detail ? (
                          <Box
                            style={{
                              paddingTop: 8,
                              borderTop: '1px solid var(--ds-color-border-secondary)',
                            }}
                          >
                            <Text
                              size="xs"
                              style={{
                                color: 'var(--ds-color-text-secondary)',
                                lineHeight: 1.5,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {stat.detail}
                            </Text>
                          </Box>
                        ) : null}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              ) : null}

              {supportPanels.length > 0 ? (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: 10,
                    width: '100%',
                  }}
                >
                  {supportPanels.map((panel) => {
                    const styles = getPanelStyles(panel.tone);

                    return (
                      <Box
                        key={panel.title}
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          minHeight: '100%',
                          minWidth: 0,
                          ...styles,
                        }}
                      >
                        <Stack spacing={6}>
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              color:
                                panel.tone === 'dark'
                                  ? 'rgba(255,255,255,0.7)'
                                  : 'var(--ds-color-text-muted)',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {panel.title}
                          </Text>
                          <Box
                            aria-hidden="true"
                            style={{
                              height: 1,
                              borderRadius: 999,
                              background:
                                panel.tone === 'dark'
                                  ? 'rgba(255,255,255,0.18)'
                                  : 'var(--ds-color-border-secondary)',
                            }}
                          />
                          <Text
                            size="sm"
                            style={{
                              color:
                                panel.tone === 'dark'
                                  ? 'rgba(255,255,255,0.84)'
                                  : 'var(--ds-color-text-secondary)',
                              lineHeight: 1.55,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {panel.body}
                          </Text>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </Box>

        <style>{`
          @container showroom-content (max-width: 1360px) {
            .foundation-top-rail-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @container showroom-content (max-width: 920px) {
            .foundation-top-rail-links {
              width: 100%;
            }
          }
        `}</style>
      </Stack>
    </Card>
  );
}
