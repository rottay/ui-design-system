import type { CSSProperties, ElementType, ReactNode } from 'react';

type BaseProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: any;
};

function resolveSpace(value?: number | string) {
  if (typeof value === 'number') {
    return value;
  }

  switch (value) {
    case 'xs':
      return 6;
    case 'sm':
      return 10;
    case 'md':
      return 14;
    case 'lg':
      return 20;
    case 'xl':
      return 28;
    default:
      return value;
  }
}

function resolveTextSize(value?: string) {
  switch (value) {
    case 'xs':
      return '0.75rem';
    case 'sm':
      return '0.875rem';
    case 'md':
      return '1rem';
    case 'lg':
      return '1.125rem';
    case 'xl':
      return '1.375rem';
    case '2xl':
      return '1.75rem';
    case '3xl':
      return '2.25rem';
    default:
      return undefined;
  }
}

function resolveFontWeight(value?: string) {
  switch (value) {
    case 'medium':
      return 500;
    case 'semibold':
      return 600;
    case 'bold':
      return 700;
    default:
      return undefined;
  }
}

function resolveAlign(value?: string) {
  switch (value) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    case 'center':
      return 'center';
    case 'stretch':
      return 'stretch';
    case 'baseline':
      return 'baseline';
    default:
      return value;
  }
}

function resolveJustify(value?: string) {
  switch (value) {
    case 'start':
      return 'flex-start';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    case 'around':
      return 'space-around';
    case 'evenly':
      return 'space-evenly';
    case 'center':
      return 'center';
    default:
      return value;
  }
}

export function Box({
  as,
  children,
  className,
  style,
  ...props
}: BaseProps) {
  const Component = as ?? 'div';

  return (
    <Component className={className} style={style} {...props}>
      {children}
    </Component>
  );
}

type FlexProps = BaseProps & {
  align?: string;
  justify?: string;
  direction?: 'row' | 'column';
  gap?: number | string;
  wrap?: CSSProperties['flexWrap'];
};

export function Flex({
  align,
  justify,
  direction = 'row',
  gap,
  wrap,
  style,
  ...props
}: FlexProps) {
  return (
    <Box
      {...props}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: resolveAlign(align),
        justifyContent: resolveJustify(justify),
        gap: resolveSpace(gap),
        flexWrap: wrap,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

type StackProps = BaseProps & {
  spacing?: number | string;
  fullWidth?: boolean;
};

export function Stack({
  spacing = 'md',
  fullWidth = false,
  style,
  ...props
}: StackProps) {
  return (
    <Flex
      {...props}
      direction="column"
      gap={spacing}
      style={{
        width: fullWidth ? '100%' : undefined,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

type TextProps = BaseProps & {
  size?: string;
  weight?: string;
};

export function Text({
  as,
  size,
  weight,
  style,
  ...props
}: TextProps) {
  const Component = as ?? 'div';

  return (
    <Component
      {...props}
      style={{
        fontSize: resolveTextSize(size),
        fontWeight: resolveFontWeight(weight),
        ...style,
      }}
    />
  );
}

type CardProps = BaseProps & {
  hoverable?: boolean;
};

export function Card({
  hoverable = false,
  style,
  ...props
}: CardProps) {
  return (
    <Box
      {...props}
      style={{
        position: 'relative',
        minWidth: 0,
        borderRadius: 'var(--ds-radius-xl, 20px)',
        border: '1px solid var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1))',
        background: 'var(--ds-color-bg-elevated, rgba(255, 255, 255, 0.04))',
        boxShadow: 'var(--ds-shadow-md, 0 18px 48px rgba(0, 0, 0, 0.16))',
        transition: hoverable
          ? 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease'
          : undefined,
        ...style,
      }}
    />
  );
}

type BadgeProps = BaseProps & {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
};

export function Badge({
  variant = 'primary',
  style,
  ...props
}: BadgeProps) {
  const palette =
    variant === 'secondary'
      ? {
          background: 'var(--ds-color-bg-overlay, rgba(255, 255, 255, 0.06))',
          border: '1px solid var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1))',
          color: 'var(--ds-color-text-secondary, rgba(255, 255, 255, 0.82))',
        }
      : variant === 'success'
        ? {
            background:
              'color-mix(in srgb, var(--ds-color-success, #31c48d) 12%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--ds-color-success, #31c48d) 24%, var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1)))',
            color: 'var(--ds-color-text-primary, #ffffff)',
          }
        : variant === 'warning'
          ? {
              background:
                'color-mix(in srgb, var(--ds-color-warning, #d6a04b) 12%, transparent)',
              border:
                '1px solid color-mix(in srgb, var(--ds-color-warning, #d6a04b) 24%, var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1)))',
              color: 'var(--ds-color-text-primary, #ffffff)',
            }
          : variant === 'error'
            ? {
                background:
                  'color-mix(in srgb, var(--ds-color-error, #e06a6a) 12%, transparent)',
                border:
                  '1px solid color-mix(in srgb, var(--ds-color-error, #e06a6a) 24%, var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1)))',
                color: 'var(--ds-color-text-primary, #ffffff)',
              }
            : {
                background:
                  'color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, transparent)',
                border:
                  '1px solid color-mix(in srgb, var(--ds-color-primary, #ffffff) 24%, var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1)))',
                color: 'var(--ds-color-text-primary, #ffffff)',
              };

  return (
    <Text
      {...props}
      as="span"
      size="xs"
      weight="semibold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 28,
        padding: '4px 10px',
        borderRadius: 999,
        letterSpacing: '0.02em',
        ...palette,
        ...style,
      }}
    />
  );
}

const DOCS_PANEL_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const DOCS_CARD_SURFACE =
  'var(--ds-surface-card, var(--ds-color-bg-elevated, var(--ds-color-neutral-50)))';
const DOCS_PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
const DOCS_PANEL_SHADOW = '0 22px 52px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';

function resolveDocsTone(tone: DocsTone) {
  switch (tone) {
    case 'accent':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 6%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        divider:
          'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-primary-500) 22%, var(--ds-color-border-subtle, var(--ds-color-neutral-200))), transparent)',
      };
    case 'success':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-500) 7%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        divider:
          'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-success-500) 22%, var(--ds-color-border-subtle, var(--ds-color-neutral-200))), transparent)',
      };
    case 'warning':
      return {
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-warning-500) 7%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        divider:
          'linear-gradient(90deg, color-mix(in srgb, var(--ds-color-warning-500) 22%, var(--ds-color-border-subtle, var(--ds-color-neutral-200))), transparent)',
      };
    default:
      return {
        background: DOCS_CARD_SURFACE,
        divider:
          'linear-gradient(90deg, var(--ds-color-border-subtle, var(--ds-color-neutral-200)), transparent)',
      };
  }
}

export function SectionDivider({
  style,
  ...props
}: BaseProps) {
  return (
    <Box
      {...props}
      aria-hidden="true"
      style={{
        height: 1,
        width: '100%',
        borderRadius: 999,
        background:
          'linear-gradient(90deg, var(--ds-color-border-subtle, var(--ds-color-neutral-200)), transparent)',
        ...style,
      }}
    />
  );
}

type DocsTone = 'default' | 'accent' | 'success' | 'warning';

type DocsPanelProps = BaseProps & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: DocsTone;
};

export function DocsPanel({
  eyebrow,
  title,
  description,
  actions,
  footer,
  tone = 'default',
  children,
  style,
  ...props
}: DocsPanelProps) {
  const panelTone = resolveDocsTone(tone);
  const hasHeader = eyebrow || title || description || actions;

  return (
    <Card
      {...props}
      style={{
        height: '100%',
        padding: 18,
        border: DOCS_PANEL_BORDER,
        background: panelTone.background,
        boxShadow: DOCS_PANEL_SHADOW,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Stack spacing="sm" fullWidth style={{ height: '100%' }}>
        {hasHeader ? (
          <Stack spacing="xs" fullWidth>
            {(eyebrow || actions) ? (
              <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
                {eyebrow ? (
                  <Box
                    style={{
                      display: 'block',
                      minWidth: 0,
                    }}
                  >
                    {typeof eyebrow === 'string' || typeof eyebrow === 'number' ? (
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          color: 'var(--ds-color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {eyebrow}
                      </Text>
                    ) : (
                      eyebrow
                    )}
                  </Box>
                ) : (
                  <Box />
                )}
                {actions}
              </Flex>
            ) : null}

            {title ? (
              <Text
                as={"h2" as any}
                size="md"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-primary)',
                  lineHeight: 1.3,
                  overflowWrap: 'anywhere',
                }}
              >
                {title}
              </Text>
            ) : null}

            {description ? (
              <Text
                size="sm"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.6,
                  overflowWrap: 'anywhere',
                }}
              >
                {description}
              </Text>
            ) : null}
          </Stack>
        ) : null}

        {hasHeader && (children || footer) ? (
          <SectionDivider style={{ background: panelTone.divider }} />
        ) : null}

        {children}

        {footer ? (
          <>
            {(hasHeader || children) ? (
              <SectionDivider
                style={{
                  marginTop: 'auto',
                  background: panelTone.divider,
                }}
              />
            ) : null}
            {footer}
          </>
        ) : null}
      </Stack>
    </Card>
  );
}

type DocsMetricTileProps = BaseProps & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  tone?: DocsTone;
};

export function DocsMetricTile({
  label,
  value,
  detail,
  tone = 'default',
  style,
  ...props
}: DocsMetricTileProps) {
  const panelTone = resolveDocsTone(tone);

  return (
    <Box
      {...props}
      style={{
        minWidth: 0,
        padding: 14,
        borderRadius: 18,
        border: DOCS_PANEL_BORDER,
        background: panelTone.background,
        boxShadow: DOCS_PANEL_SHADOW,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: detail ? 126 : 92,
        ...style,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: 'block',
          color: 'var(--ds-color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: '10px 12px',
          borderRadius: 14,
          background: DOCS_PANEL_SURFACE,
          border: DOCS_PANEL_BORDER,
        }}
      >
        <Text
          size="lg"
          weight="bold"
          style={{
            display: 'block',
            color: 'var(--ds-color-text-primary)',
            lineHeight: 1.15,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Text>
        {detail ? (
          <Text
            size="xs"
            style={{
              display: 'block',
              marginTop: 6,
              color: 'var(--ds-color-text-secondary)',
              lineHeight: 1.5,
              overflowWrap: 'anywhere',
            }}
          >
            {detail}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}
