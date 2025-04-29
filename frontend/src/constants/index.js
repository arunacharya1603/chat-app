export const THEMES = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
  ];

// Custom theme colors in OKLCH format
export const CUSTOM_THEME = {
  base: {
    100: 'oklch(98% 0.02 240)',
    200: 'oklch(95% 0.03 240)',
    300: 'oklch(92% 0.04 240)',
    content: 'oklch(20% 0.05 240)'
  },
  primary: {
    DEFAULT: 'oklch(55% 0.3 240)',
    content: 'oklch(98% 0.01 240)'
  },
  secondary: {
    DEFAULT: 'oklch(70% 0.25 200)',
    content: 'oklch(98% 0.01 200)'
  },
  accent: {
    DEFAULT: 'oklch(65% 0.25 160)',
    content: 'oklch(98% 0.01 160)'
  },
  neutral: {
    DEFAULT: 'oklch(50% 0.05 240)',
    content: 'oklch(98% 0.01 240)'
  },
  info: {
    DEFAULT: 'oklch(70% 0.2 220)',
    content: 'oklch(98% 0.01 220)'
  },
  success: {
    DEFAULT: 'oklch(65% 0.25 140)',
    content: 'oklch(98% 0.01 140)'
  },
  warning: {
    DEFAULT: 'oklch(80% 0.25 80)',
    content: 'oklch(20% 0.05 80)'
  },
  error: {
    DEFAULT: 'oklch(65% 0.3 30)',
    content: 'oklch(98% 0.01 30)'
  }
};

export const THEME_CONFIG = {
  radius: {
    selector: '1rem',
    field: '0.25rem',
    box: '0.5rem'
  },
  size: {
    selector: '0.25rem',
    field: '0.25rem'
  },
  border: '1px',
  effects: {
    depth: 1,
    noise: 0
  }
};