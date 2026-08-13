export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xl2: 20,
    xl3: 24,
    xl4: 28,
    xl5: 32,
    hero: 36,
  },

  lineHeight: {
    tight: 14,
    snug: 18,
    normal: 20,
    relaxed: 22,
    loose: 24,
    spacious: 30,
  },

  textStyles: {
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
    h3: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
    title: { fontSize: 18, fontWeight: '600', lineHeight: 22 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    bodyStrong: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
    label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    overline: { fontSize: 10, fontWeight: '600', lineHeight: 14 },
  },
} as const;
