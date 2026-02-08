import { createPreset } from '../../../factory';
import type { ErrorPageProps, ErrorPageAction } from '../../core';
import { ERROR_MESSAGES } from '../../core';
import {
  createEmptyStateStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<ErrorPageProps>('minimal', (context) => {
  const { primitives, props, tokens } = context;
  const { Box, Stack, Text } = primitives;

  const {
    code = '404',
    title,
    description,
    illustration,
    actions = [],
    className,
    style,
  } = props;

  const defaultMessage = ERROR_MESSAGES[code];
  const displayTitle = title ?? defaultMessage.title;
  const displayDescription = description ?? defaultMessage.description;

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        backgroundColor: tokens.colors.neutral[50],
        padding: tokens.spacing[8],
        ...style,
      }}
    >
      <Stack
        direction="vertical"
        style={{
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 480,
          gap: tokens.spacing[4],
        }}
      >
        {/* Small Illustration or Icon */}
        {illustration && (
          <Box
            style={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.neutral[400],
            }}
          >
            {illustration}
          </Box>
        )}

        {/* Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            lineHeight: tokens.typography.lineHeight.tight,
          }}
        >
          {displayTitle}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            lineHeight: tokens.typography.lineHeight.relaxed,
          }}
        >
          {displayDescription}
        </Text>

        {/* Actions - Link Style */}
        {actions.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[6],
              marginTop: tokens.spacing[2],
            }}
          >
            {actions.map((action: ErrorPageAction) => {
              const isPrimary = action.variant === 'primary';
              return (
                <span
                  key={action.key}
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: isPrimary ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    textDecoration: 'underline',
                  }}
                  onClick={() => handleActionClick(action)}
                >
                  {action.label}
                </span>
              );
            })}
          </Box>
        )}
      </Stack>
    </Box>
  );
});
