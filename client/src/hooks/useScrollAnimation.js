/**
 * Shared Framer Motion animation variants for scroll-triggered reveals.
 * Used across all pages for consistent entrance behaviour matching
 * The Curated Canvas editorial aesthetic.
 */

/* ── Fade Up (default section entrance) ── */
export const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ── Fade In (simple opacity) ── */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: 'easeOut',
    },
  }),
};

/* ── Slide from Left ── */
export const slideLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ── Slide from Right ── */
export const slideRight = {
  hidden: { opacity: 0, x: 80 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ── Scale Up (card pops in) ── */
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ── Stagger Container (parent orchestrator) ── */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/* ── Float (gentle bounce for decorative elements) ── */
export const float = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/* ── Default viewport trigger settings ── */
export const scrollViewport = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -60px 0px',
};
