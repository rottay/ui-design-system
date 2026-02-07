import type { Variants } from 'framer-motion';

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

export const cardTap: Variants = {
  rest: {
    scale: 1,
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export const cardImageHover: Variants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export const cardGlow: Variants = {
  rest: {
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    boxShadow: '0 0 20px 0 rgba(59, 130, 246, 0.3)',
    transition: {
      duration: 0.2,
    },
  },
};

export const cardElevate: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
};

export const cardBorderGlow: Variants = {
  rest: {
    borderColor: 'rgba(229, 231, 235, 1)',
    boxShadow: 'inset 0 0 0 1px rgba(229, 231, 235, 1)',
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 12px 0 rgba(59, 130, 246, 0.2)',
    transition: {
      duration: 0.2,
    },
  },
};
