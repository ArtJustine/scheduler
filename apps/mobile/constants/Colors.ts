/**
 * Chiyu Social — Color constants
 * ────────────────────────────────────────────────────────
 * Mirrored from the web app's globals.css HSL variables.
 * Keep these in sync whenever the web branding changes.
 *
 * Conversion reference (HSL → hex):
 *   --primary (light): 0 0% 9%       → #171717
 *   --primary (dark):  0 0% 98%      → #FAFAFA
 *   --background (light): 0 0% 100%  → #FFFFFF
 *   --background (dark):  0 0% 3.9%  → #0A0A0A
 */

// ── Brand accent (the blue used in buttons / links on the web) ──
const CHIYU_BLUE = '#70A5EE';

const light = {
  // Surfaces
  background: '#FFFFFF',
  foreground: '#0A0A0A',
  card: '#FFFFFF',
  cardForeground: '#0A0A0A',

  // Brand
  primary: '#171717',
  primaryForeground: '#FAFAFA',
  accent: '#F5F5F5',        // 0 0% 96.1%
  accentForeground: '#171717',
  brand: CHIYU_BLUE,

  // Secondary / muted
  secondary: '#F5F5F5',
  secondaryForeground: '#171717',
  muted: '#F5F5F5',
  mutedForeground: '#737373', // 0 0% 45.1%

  // Semantic
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',
  border: '#E5E5E5',        // 0 0% 89.8%
  input: '#E5E5E5',
  ring: '#0A0A0A',

  // Tabs
  tint: CHIYU_BLUE,
  tabIconDefault: '#B0B0B0',
  tabIconSelected: CHIYU_BLUE,

  // Charts (from CSS)
  chart1: '#E06B45',
  chart2: '#389882',
  chart3: '#2F5364',
  chart4: '#D7B758',
  chart5: '#E08F42',

  // Platform colours (from getPlatformColor in utils.ts)
  platformInstagram: '#C32AA3',
  platformYoutube: '#FF0000',
  platformTiktok: '#000000',
  platformFacebook: '#1877F2',
  platformTwitter: '#1DA1F2',
  platformLinkedin: '#0A66C2',
  platformPinterest: '#E60023',
  platformThreads: '#000000',
  platformBluesky: '#0085FF',
};

const dark = {
  // Surfaces
  background: '#0A0A0A',
  foreground: '#FAFAFA',
  card: '#0A0A0A',
  cardForeground: '#FAFAFA',

  // Brand
  primary: '#FAFAFA',
  primaryForeground: '#171717',
  accent: '#262626',        // 0 0% 14.9%
  accentForeground: '#FAFAFA',
  brand: CHIYU_BLUE,

  // Secondary / muted
  secondary: '#262626',
  secondaryForeground: '#FAFAFA',
  muted: '#262626',
  mutedForeground: '#A3A3A3', // 0 0% 63.9%

  // Semantic
  destructive: '#7F1D1D',
  destructiveForeground: '#FAFAFA',
  border: '#262626',
  input: '#262626',
  ring: '#D4D4D4',

  // Tabs
  tint: CHIYU_BLUE,
  tabIconDefault: '#6B6B6B',
  tabIconSelected: CHIYU_BLUE,

  // Charts
  chart1: '#3B82F6',
  chart2: '#34D399',
  chart3: '#F59E0B',
  chart4: '#A78BFA',
  chart5: '#F472B6',

  // Platform colours
  platformInstagram: '#C32AA3',
  platformYoutube: '#FF0000',
  platformTiktok: '#FFFFFF',
  platformFacebook: '#1877F2',
  platformTwitter: '#1DA1F2',
  platformLinkedin: '#0A66C2',
  platformPinterest: '#E60023',
  platformThreads: '#FFFFFF',
  platformBluesky: '#0085FF',
};

export type ColorScheme = typeof light;

export default { light, dark } as const;
export { CHIYU_BLUE };
