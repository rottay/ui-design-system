import { createPreset, type PresetContext } from '../../../factory';
import type { EmptyStateProps } from '../../core';

export const standardPreset = createPreset<EmptyStateProps>((context: PresetContext<EmptyStateProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Button } = primitives;

  const {
    title,
    description,
    icon,
    actions = [],
    className,
    style,
  } = props;

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[8]} ${tokens.spacing[4]}`,
        textAlign: 'center',
        ...style,
      }}
    >
      {icon && (
        <Box
          style={{
            width: '64px',
            height: '64px',
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.neutral[400],
            marginBottom: tokens.spacing[4],
            fontSize: '24px',
          }}
        >
          {icon}
        </Box>
      )}

      {title && (
        <Box
          style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            marginBottom: tokens.spacing[2],
          }}
        >
          {title}
        </Box>
      )}

      {description && (
        <Box
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            marginBottom: actions.length > 0 ? tokens.spacing[4] : 0,
            maxWidth: '400px',
          }}
        >
          {description}
        </Box>
      )}

      {actions.length > 0 && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {actions.map((action) => (
            <Button
              key={action.key}
              onClick={action.onClick}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                transition: `all ${tokens.motion.hover}`,
                backgroundColor:
                  action.variant === 'primary'
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[100],
                color:
                  action.variant === 'primary'
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[700],
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor =
                  action.variant === 'primary'
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[200];
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor =
                  action.variant === 'primary'
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[100];
              }}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
});
