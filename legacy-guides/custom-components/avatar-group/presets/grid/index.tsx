import React from 'react';
import { createPreset } from '../../../factory';
import type { AvatarGroupProps } from '../../core';
import { AVATAR_GROUP_DEFAULTS } from '../../core';

export const GridPreset = createPreset<AvatarGroupProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    avatars,
    max = AVATAR_GROUP_DEFAULTS.max,
    size = AVATAR_GROUP_DEFAULTS.size,
    onOverflowClick,
    className,
    style,
  } = props;

  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '48px',
  };

  const avatarSize = sizeMap[size];
  const displayAvatars = avatars.slice(0, max);
  const overflowCount = avatars.length - max;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDefaultColor = (index: number) => {
    const colors = [
      tokens.colors.primaryScale[500],
      tokens.colors.secondaryScale[500],
      tokens.colors.successScale[500],
      tokens.colors.warningScale[500],
      tokens.colors.infoScale[500],
    ];
    return colors[index % colors.length];
  };

  return (
    <Box
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, ${avatarSize})`,
        gap: tokens.spacing[2],
        ...style,
      }}
    >
      {displayAvatars.map((avatar, index) => (
        <Box
          key={avatar.key}
          title={avatar.name}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: avatar.color || getDefaultColor(index),
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {avatar.src ? (
            <img
              src={avatar.src}
              alt={avatar.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Text
                           style={{
                color: tokens.colors.common.white,
                fontWeight: tokens.typography.fontWeight.semibold,
                fontSize: size === 'sm' ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm,
              }}
            >
              {getInitials(avatar.name)}
            </Text>
          )}
        </Box>
      ))}

      {overflowCount > 0 && (
        <Box
          onClick={onOverflowClick}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onOverflowClick ? 'pointer' : 'default',
          }}
        >
          <Text
                       style={{
              color: tokens.colors.neutral[700],
              fontWeight: tokens.typography.fontWeight.semibold,
              fontSize: size === 'sm' ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm,
            }}
          >
            +{overflowCount}
          </Text>
        </Box>
      )}
    </Box>
  );
});

GridPreset.displayName = 'AvatarGroupGridPreset';
