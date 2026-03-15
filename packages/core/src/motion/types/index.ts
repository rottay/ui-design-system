import { CSSProperties, ReactNode } from 'react';

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export interface BaseMotionProps {
  duration?: number;
  delay?: number;
  once?: boolean;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

export interface FadeInProps extends BaseMotionProps {
  direction?: AnimationDirection;
  distance?: number;
}

export interface SlideInProps extends BaseMotionProps {
  direction?: AnimationDirection;
  distance?: number;
}

export interface ScaleInProps extends BaseMotionProps {
  initialScale?: number;
}

export interface ScrollRevealProps extends BaseMotionProps {
  threshold?: number;
  rootMargin?: string;
}

export interface StaggerChildrenProps extends BaseMotionProps {
  staggerDelay?: number;
  delayChildren?: number;
}

export interface ParallaxProps {
  speed?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface MagneticProps {
  strength?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface TextRevealProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  type?: 'char' | 'word' | 'line';
}

export interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
}

export interface MorphProps {
  children: ReactNode;
  layoutId?: string;
  className?: string;
  style?: CSSProperties;
}

export interface GlassCardProps {
  blur?: number;
  bgOpacity?: number;
  borderOpacity?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface GradientBackgroundProps {
  colors?: string[];
  animate?: boolean;
  duration?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface GlowEffectProps {
  color?: string;
  intensity?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ShimmerTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export interface SpotlightProps {
  size?: number;
  color?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface AuroraProps {
  colors?: string[];
  speed?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ParticlesProps {
  count?: number;
  color?: string;
  speed?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface NoiseTextureProps {
  opacity?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface GridPatternProps {
  size?: number;
  color?: string;
  opacity?: number;
  animate?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
