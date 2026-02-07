import { createPreset } from '../../../factory';
import type { ErrorPageProps, ErrorPageAction } from '../../core';
import { ERROR_MESSAGES } from '../../core';

export default createPreset<ErrorPageProps>('standard', (context) => {
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
          maxWidth: 600,
          gap: tokens.spacing[8],
        }}
      >
        {/* Large Error Code Display */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize['4xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[200],
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {code}
        </Text>

        {/* Illustration */}
        {illustration && (
          <Box
            style={{
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {illustration}
          </Box>
        )}

        {/* Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            lineHeight: tokens.typography.lineHeight.tight,
          }}
        >
          {displayTitle}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.neutral[600],
            lineHeight: tokens.typography.lineHeight.relaxed,
            maxWidth: 480,
          }}
        >
          {displayDescription}
        </Text>

        {/* Actions */}
        {actions.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              marginTop: tokens.spacing[4],
            }}
          >
            {actions.map((action: ErrorPageAction) => {
              const isPrimary = action.variant === 'primary';
              return (
                <Box
                  key={action.key}
                  as="button"
                  style={{
                    padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    border: isPrimary ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    backgroundColor: isPrimary ? tokens.colors.primaryScale[600] : tokens.colors.common.white,
                    color: isPrimary ? tokens.colors.common.white : tokens.colors.neutral[700],
                    outline: 'none',
                  }}
                  onClick={() => handleActionClick(action)}
                >
                  {action.label}
                </Box>
              );
            })}
          </Box>
        )}
      </Stack>
    </Box>
  );
});
