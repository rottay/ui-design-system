'use client';

import { useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { BlogCardProps } from '../../core';

export const HorizontalPreset = createPreset<BlogCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text } = primitives;
  const { title, description, image, category, author, date, readTime, onClick, href, className, style } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = useMemo(() => createCardStyle(tokens, {
    glass: isGlass,
    interactive: !!(onClick || href),
    elevation: isHovered && (onClick || href) ? 'md' : 'sm',
  }), [tokens, onClick]);

  const content = (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        cursor: onClick || href ? 'pointer' : 'default',
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && (onClick || href) ? tokens.motion.transform : 'none',
      }}
      onClick={onClick}
    >
      {/* Image section */}
      {image && (
        <Box
          style={{
            width: '40%',
            minWidth: '200px',
            backgroundColor: tokens.colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {typeof image === 'string' ? (
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            image
          )}
        </Box>
      )}

      {/* Content section */}
      <Box
        style={{
          flex: 1,
          padding: tokens.spacing[6],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
        }}
      >
        {/* Category badge */}
        {category && (
          <Box
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              backgroundColor: tokens.colors.primaryScale[100],
              color: tokens.colors.primaryScale[700],
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              width: 'fit-content',
            }}
          >
            {category}
          </Box>
        )}

        {/* Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            lineHeight: tokens.typography.lineHeight.normal,
          }}
        >
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              lineHeight: tokens.typography.lineHeight.relaxed,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Text>
        )}

        {/* Footer - Author and metadata */}
        {(author || date || readTime) && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              marginTop: 'auto',
              paddingTop: tokens.spacing[4],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            {author && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.full,
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      color: tokens.colors.primaryScale[700],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                    }}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </Box>
                )}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {author.name}
                </Text>
              </Box>
            )}
            {(date || readTime) && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {date && <Text>{date}</Text>}
                {date && readTime && <Text>•</Text>}
                {readTime && <Text>{readTime}</Text>}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          ...style,
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <Box className={className} style={style}>
      {content}
    </Box>
  );
});
