import { createPreset, type PresetContext } from '../../../factory';
import type { EmptyStateProps } from '../../core';
import {
  createHoverStyle,
} from '../../../helpers';

export const illustrationPreset = createPreset<EmptyStateProps>((context: PresetContext<EmptyStateProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Button } = primitives;

  const {
    title,
    description,
    illustration,
    actions: rawActions = [],
    className,
    style,
  } = props;

    const actions = Array.isArray(rawActions) ? rawActions : [];

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
      {illustration && (
        <Box
          style={{
            marginBottom: tokens.spacing[6],
            maxWidth: '320px',
            width: '100%',
          }}
        >
          {illustration}
        </Box>
      )}

      {title && (
        <Box
          style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
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
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.neutral[500],
            marginBottom: actions.length > 0 ? tokens.spacing[6] : 0,
            maxWidth: '480px',
            lineHeight: '1.6',
          }}
        >
          {description}
        </Box>
      )}

      {actions.length > 0 && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {actions.map((action) => (
            <Button
              key={action.key}
              onClick={action.onClick}
              style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
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
