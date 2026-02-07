import { createPreset } from '../../../factory';
import type { ChangelogSectionProps, ChangelogType } from '../../core';

export const TimelinePreset = createPreset<ChangelogSectionProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { entries, title, className, style } = props;

  const getTypeBadgeColors = (type: ChangelogType) => {
    switch (type) {
      case 'feature':
        return {
          bg: tokens.colors.successScale[100],
          text: tokens.colors.successScale[700],
          border: tokens.colors.successScale[200],
        };
      case 'improvement':
        return {
          bg: tokens.colors.primaryScale[100],
          text: tokens.colors.primaryScale[700],
          border: tokens.colors.primaryScale[200],
        };
      case 'fix':
        return {
          bg: tokens.colors.infoScale[100],
          text: tokens.colors.infoScale[700],
          border: tokens.colors.infoScale[200],
        };
      case 'breaking':
        return {
          bg: tokens.colors.errorScale[100],
          text: tokens.colors.errorScale[700],
          border: tokens.colors.errorScale[200],
        };
    }
  };

  const getTypeLabel = (type: ChangelogType) => {
    switch (type) {
      case 'feature':
        return 'New';
      case 'improvement':
        return 'Improved';
      case 'fix':
        return 'Fixed';
      case 'breaking':
        return 'Breaking';
    }
  };

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[8],
        padding: tokens.spacing[8],
        ...style,
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}

      <Box
        style={{
          position: 'relative',
          paddingLeft: tokens.spacing[8],
        }}
      >
        {/* Timeline line */}
        <Box
          style={{
            position: 'absolute',
            left: '15px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            backgroundColor: tokens.colors.neutral[200],
          }}
        />

        {/* Entries */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[8],
          }}
        >
          {entries.map((entry) => {
            const typeBadgeColors = getTypeBadgeColors(entry.type);

            return (
              <Box
                key={entry.key}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[4],
                }}
              >
                {/* Timeline dot */}
                <Box
                  style={{
                    position: 'absolute',
                    left: '-35px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.common.white,
                    border: `3px solid ${tokens.colors.primaryScale[500]}`,
                  }}
                />

                {/* Date */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {entry.date}
                </Text>

                {/* Version and type badges */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                >
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[700],
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    }}
                  >
                    {entry.version}
                  </Box>
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: typeBadgeColors.bg,
                      color: typeBadgeColors.text,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeBadgeColors.border}`,
                    }}
                  >
                    {getTypeLabel(entry.type)}
                  </Box>
                </Box>

                {/* Title */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {entry.title}
                </Text>

                {/* Description */}
                {entry.description && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      lineHeight: 1.6,
                    }}
                  >
                    {entry.description}
                  </Text>
                )}

                {/* Items list */}
                {entry.items && entry.items.length > 0 && (
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[1],
                      paddingLeft: tokens.spacing[4],
                    }}
                  >
                    {entry.items.map((item, index) => (
                      <Box
                        key={index}
                        style={{
                          display: 'flex',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            color: tokens.colors.neutral[400],
                            fontSize: tokens.typography.fontSize.sm,
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[700],
                            lineHeight: 1.6,
                          }}
                        >
                          {item}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
});
