import { useColorScheme } from 'react-native';

const light = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F6',
  text: '#13141B',
  textMuted: '#686C7E',
  border: '#E3E5EE',
  primary: '#4B54D1',
  primarySoft: '#E7E9FF',
  onPrimary: '#FFFFFF',
  success: '#15803D',
  successSoft: '#DCF5E4',
  danger: '#D92D20',
  overlay: 'rgba(10, 12, 24, 0.45)',
};

const dark: typeof light = {
  bg: '#0D0E14',
  surface: '#171922',
  surfaceAlt: '#20232F',
  text: '#F1F2F7',
  textMuted: '#9B9FB2',
  border: '#272A37',
  primary: '#8C94FF',
  primarySoft: '#24284A',
  onPrimary: '#0D0E14',
  success: '#4ADE80',
  successSoft: '#143323',
  danger: '#F97066',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export type Palette = typeof light;
export const Palettes = { light, dark };

export function usePalette(): Palette & { isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { ...(isDark ? dark : light), isDark };
}

/** Colors users can pick for an action. All have good contrast with white icons. */
export const ACTION_COLORS = [
  '#4B54D1', // indigo
  '#0E9F6E', // green
  '#E8590C', // orange
  '#D6336C', // pink
  '#0B7EC2', // blue
  '#9C36B5', // purple
  '#C2410C', // rust
  '#475467', // slate
];

export const ACTION_ICONS = [
  'door-closed-lock',
  'stove',
  'pill',
  'paw',
  'car',
  'garage-lock',
  'window-closed-variant',
  'power-plug-off-outline',
  'iron-outline',
  'water-outline',
  'lightbulb-off-outline',
  'fridge-outline',
  'washing-machine',
  'sprout-outline',
  'key-variant',
  'wallet-outline',
  'cellphone',
  'coffee-outline',
  'toothbrush',
  'baby-carriage',
] as const;

export type ActionIcon = (typeof ACTION_ICONS)[number];

export const Radius = { sm: 10, md: 14, lg: 20, pill: 999 };
