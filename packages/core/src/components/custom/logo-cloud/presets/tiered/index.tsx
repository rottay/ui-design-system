import { useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { LogoCloudProps } from '../../core';

export const TieredPreset = createPreset<LogoCloudProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text } = primitives;
  const { logos, title, description, className, style } = props;

  const featuredLogos = logos.slice(0, 3);
  const regularLogos = logos.slice(3);

  const featuredCardStyle = useMemo(() => createCardStyle(tokens, {
    glass: isGlass,
    interactive: true,
  }), [tokens]);

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing[8],
        padding: tokens.spacing[8],
        ...style,
      }}
    >
      {(title || description) && (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacing[2],
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              {description}
            </Text>
          )}
        </Box>
      )}

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[6],
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {/* Featured logos row */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(featuredLogos.length, 3)}, 1fr)`,
            gap: tokens.spacing[6],
          }}
        >
          {featuredLogos.map((item) => {
            const handleClick = () => {
              if (item.onClick) {
                item.onClick();
              }
            };

            const content = (
              <Box
                style={{
                  ...featuredCardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                  padding: tokens.spacing[8],
                  cursor: item.href || item.onClick ? 'pointer' : 'default',
                }}
                onClick={item.onClick ? handleClick : undefined}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '120px',
                    height: '80px',
                  }}
                >
                  {item.logo}
                </Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  {item.name}
                </Text>
              </Box>
            );

            if (item.href) {
              return (
                <a
                  key={item.key}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {content}
                </a>
              );
            }

            return <Box key={item.key}>{content}</Box>;
          })}
        </Box>

        {/* Regular logos row */}
        {regularLogos.length > 0 && (
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {regularLogos.map((item) => {
              const handleClick = () => {
                if (item.onClick) {
                  item.onClick();
                }
              };

              const content = (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: tokens.spacing[4],
                    filter: 'grayscale(1)',
                    opacity: 0.6,
                    transition: `all ${tokens.motion.hover}`,
                    cursor: item.href || item.onClick ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'none';
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = tokens.motion.transform;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'grayscale(1)';
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.transform = 'none';
                  }}
                  onClick={item.onClick ? handleClick : undefined}
                >
                  {item.logo}
                </Box>
              );

              if (item.href) {
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    {content}
                  </a>
                );
              }

              return <Box key={item.key}>{content}</Box>;
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
});
