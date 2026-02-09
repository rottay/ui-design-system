import { useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { TeamSectionProps } from '../../core';
import { TEAM_SECTION_DEFAULTS } from '../../core';

export const GridPreset = createPreset<TeamSectionProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text } = primitives;
  const { members, title, description, columns = TEAM_SECTION_DEFAULTS.columns, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens, {
    glass: isGlass,
    interactive: false,
  }), [tokens]);

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
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
            margin: '0 auto',
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
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
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: tokens.spacing[6],
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {members.map((member) => (
          <Box
            key={member.key}
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: tokens.spacing[4],
              padding: tokens.spacing[8],
              textAlign: 'center',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Avatar */}
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: tokens.borderRadius.full,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  color: tokens.colors.primaryScale[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}
              >
                {member.name
                  .split(' ')
                  .map((n) => n.charAt(0))
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Box>
            )}

            {/* Name */}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {member.name}
            </Text>

            {/* Role */}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: `-${tokens.spacing[1]}`,
              }}
            >
              {member.role}
            </Text>

            {/* Bio */}
            {member.bio && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                  marginTop: tokens.spacing[1],
                }}
              >
                {member.bio}
              </Text>
            )}

            {/* Social links */}
            {member.social && member.social.length > 0 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[2],
                }}
              >
                {member.social.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[100],
                      color: tokens.colors.neutral[600],
                      transition: `all ${tokens.motion.hover}`,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[100];
                      e.currentTarget.style.color = tokens.colors.primaryScale[600];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                      e.currentTarget.style.color = tokens.colors.neutral[600];
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {link.icon}
                  </a>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
});
