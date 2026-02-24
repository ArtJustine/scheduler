/**
 * Chiyu Social — Theme constants
 * ────────────────────────────────────────────────────────
 * Spacing, typography, and radius values that align with
 * the web app's Tailwind config.
 */

// ── Spacing (based on 4-pt grid, same as Tailwind default) ──────
export const Spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
} as const;

// ── Border radius (mirrors --radius: 0.5rem = 8px) ─────────────
export const Radius = {
    sm: 4,   // calc(var(--radius) - 4px)
    md: 6,   // calc(var(--radius) - 2px)
    lg: 8,   // var(--radius)
    xl: 12,
    '2xl': 16,
    full: 9999,
} as const;

// ── Typography ──────────────────────────────────────────────────
// The web app uses Inter (body) and Outfit (headings) via Google Fonts.
// On mobile we'll default to system fonts and load custom ones later.
export const FontFamily = {
    sans: undefined,                       // system default
    heading: undefined,                    // system default (swap for Outfit later)
    mono: 'SpaceMono',                     // already bundled in template
} as const;

export const FontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
} as const;

export const FontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

// ── Shadows (React Native style) ────────────────────────────────
export const Shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    '2xl': {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;
