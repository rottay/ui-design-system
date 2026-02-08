import { createPreset, type PresetContext } from '../../../factory';
import type { EmptyStateProps } from '../../core';
import {
  createEmptyStateStyle,
  createHoverStyle,
} from '../../../helpers';

export const compactPreset = createPreset<EmptyStateProps>((context: PresetContext<EmptyStateProps>) => {
  const { primitives, props, tokens, engine } = context;
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
        padding: `${tokens.spacing[4]} ${tokens.spacing[3]}`,
        textAlign: 'center',
        ...style,
      }}
    >
      {icon && (
        <Box
          style={{
            width: '40px',
            height: '40px',
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.neutral[400],
            marginBottom: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.lg,
          }}
        >
          {icon}
        </Box>
      )}

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[1],
        }}
      >
        {title && (
          <Box
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}
          >
            {title}
          </Box>
        )}

        {description && (
          <Box
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}
          >
            {description}
          </Box>
        )}
      </Box>

      {actions.length > 0 && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            marginTop: tokens.spacing[3],
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {actions.map((action) => (
            <Button
              key={action.key}
              onClick={action.onClick}
              style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
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
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor =
                  action.variant === 'primary'
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[100];
                e.currentTarget.style.transform = 'none';
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
