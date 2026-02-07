import { createPreset } from '../../../factory';
import type { LogoCloudProps } from '../../core';

export const GridPreset = createPreset<LogoCloudProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { logos, title, description, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: tokens.spacing[6],
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {logos.map((item) => {
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
                padding: tokens.spacing[6],
                filter: 'grayscale(1)',
                opacity: 0.6,
                transition: `all ${tokens.motion.hover}`,
                cursor: item.href || item.onClick ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'grayscale(1)';
                e.currentTarget.style.opacity = '0.6';
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
    </Box>
  );
});
