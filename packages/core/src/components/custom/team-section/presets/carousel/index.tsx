'use client';

import { useState, useRef, useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { TeamSectionProps } from '../../core';

export const CarouselPreset = createPreset<TeamSectionProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text, Button } = primitives;
  const { members, title, description, className, style } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const cardStyle = useMemo(() => createCardStyle(tokens, {
    glass: isGlass,
    interactive: false,
    elevation: 'md',
  }), [tokens]);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[8],
        padding: tokens.spacing[8],
        position: 'relative',
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
          position: 'relative',
        }}
      >
        {/* Scroll left button */}
        {canScrollLeft && (
          <Button
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: tokens.spacing[4],
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: tokens.borderRadius.full,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.colors.common.white,
              boxShadow: tokens.shadows.md,
            }}
          >
            ←
          </Button>
        )}

        {/* Scroll right button */}
        {canScrollRight && (
          <Button
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: tokens.spacing[4],
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: tokens.borderRadius.full,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.colors.common.white,
              boxShadow: tokens.shadows.md,
            }}
          >
            →
          </Button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          style={{
            display: 'flex',
            gap: tokens.spacing[6],
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            padding: tokens.spacing[2],
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
                minWidth: '320px',
                maxWidth: '320px',
              }}
            >
              {/* Avatar */}
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: tokens.borderRadius.full,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    color: tokens.colors.primaryScale[700],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize['3xl'],
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
                  fontSize: tokens.typography.fontSize.xl,
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
                    fontSize: tokens.typography.fontSize.sm,
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
                        width: '36px',
                        height: '36px',
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
        </div>
      </Box>

      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </Box>
  );
});
