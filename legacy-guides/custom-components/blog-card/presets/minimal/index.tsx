import { createPreset } from '../../../factory';
import type { BlogCardProps } from '../../core';
import {
  createSectionHeaderStyle,
} from '../../../helpers';

export const MinimalPreset = createPreset<BlogCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { title, description, category, author, date, readTime, onClick, href, className, style } = props;

  const content = (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[2],
        padding: tokens.spacing[4],
        paddingLeft: tokens.spacing[6],
        borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        transition: `all ${tokens.motion.hover}`,
        cursor: onClick || href ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = tokens.colors.primaryScale[500];
        e.currentTarget.style.paddingLeft = `${tokens.spacing[8]}`;
          e.currentTarget.style.transform = tokens.motion.transform;
        }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = tokens.colors.neutral[200];
        e.currentTarget.style.paddingLeft = `${tokens.spacing[6]}`;
          e.currentTarget.style.transform = 'none';
        }}
      onClick={onClick}
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
          }}
        >
          {description}
        </Text>
      )}

      {/* Metadata */}
      {(author || date || readTime) && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[1],
          }}
        >
          {author && <Text style={{ fontWeight: tokens.typography.fontWeight.medium }}>{author.name}</Text>}
          {author && (date || readTime) && <Text>•</Text>}
          {date && <Text>{date}</Text>}
          {date && readTime && <Text>•</Text>}
          {readTime && <Text>{readTime}</Text>}
        </Box>
      )}
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
