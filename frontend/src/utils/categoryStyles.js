const normalizeCategory = (category) => (category || 'General').toString().trim().toLowerCase()

const categoryPalette = {
  general: {
    slug: 'general',
    light: {
      cardBg: '#f1f5f9',
      accent: '#6b7280',
      border: '#cbd5e1',
      badgeBg: 'rgba(107, 114, 128, 0.12)',
      shadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    },
    dark: {
      cardBg: '#1e293b',
      accent: '#9ca3af',
      border: '#334155',
      badgeBg: 'rgba(156, 163, 175, 0.14)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.24)',
    },
  },
  'health & fitness': {
    slug: 'health-fitness',
    light: {
      cardBg: '#ecfdf5',
      accent: '#10b981',
      border: '#a7f3d0',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      shadow: '0 18px 40px rgba(16, 185, 129, 0.08)',
    },
    dark: {
      cardBg: '#064e3b',
      accent: '#34d399',
      border: '#0f766e',
      badgeBg: 'rgba(52, 211, 153, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  exercise: {
    slug: 'exercise',
    light: {
      cardBg: '#fff1f2',
      accent: '#f43f5e',
      border: '#fecdd3',
      badgeBg: 'rgba(244, 63, 94, 0.12)',
      shadow: '0 18px 40px rgba(244, 63, 94, 0.08)',
    },
    dark: {
      cardBg: '#4c0519',
      accent: '#fb7185',
      border: '#9f1239',
      badgeBg: 'rgba(251, 113, 133, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  wellness: {
    slug: 'wellness',
    light: {
      cardBg: '#f0f9ff',
      accent: '#0ea5e9',
      border: '#bae6fd',
      badgeBg: 'rgba(14, 165, 233, 0.12)',
      shadow: '0 18px 40px rgba(14, 165, 233, 0.08)',
    },
    dark: {
      cardBg: '#0c4a6e',
      accent: '#38bdf8',
      border: '#0369a1',
      badgeBg: 'rgba(56, 189, 248, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  'mental health': {
    slug: 'mental-health',
    light: {
      cardBg: '#eef2ff',
      accent: '#6366f1',
      border: '#c7d2fe',
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      shadow: '0 18px 40px rgba(99, 102, 241, 0.08)',
    },
    dark: {
      cardBg: '#1e1b4b',
      accent: '#818cf8',
      border: '#4338ca',
      badgeBg: 'rgba(129, 140, 248, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  learning: {
    slug: 'learning',
    light: {
      cardBg: '#fffbeb',
      accent: '#d97706',
      border: '#fde68a',
      badgeBg: 'rgba(217, 119, 6, 0.12)',
      shadow: '0 18px 40px rgba(217, 119, 6, 0.08)',
    },
    dark: {
      cardBg: '#4c1c02',
      accent: '#fbbf24',
      border: '#854d0e',
      badgeBg: 'rgba(251, 191, 36, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  sleep: {
    slug: 'sleep',
    light: {
      cardBg: '#f5f3ff',
      accent: '#8b5cf6',
      border: '#ddd6fe',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      shadow: '0 18px 40px rgba(139, 92, 246, 0.08)',
    },
    dark: {
      cardBg: '#2d124d',
      accent: '#a78bfa',
      border: '#5b21b6',
      badgeBg: 'rgba(167, 139, 250, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  work: {
    slug: 'work',
    light: {
      cardBg: '#ecfeff',
      accent: '#06b6d4',
      border: '#a5f3fc',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      shadow: '0 18px 40px rgba(6, 182, 212, 0.08)',
    },
    dark: {
      cardBg: '#083344',
      accent: '#22d3ee',
      border: '#0e7490',
      badgeBg: 'rgba(34, 211, 238, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  'daily routine': {
    slug: 'daily-routine',
    light: {
      cardBg: '#fdf2f8',
      accent: '#ec4899',
      border: '#fbcfe8',
      badgeBg: 'rgba(236, 72, 153, 0.12)',
      shadow: '0 18px 40px rgba(236, 72, 153, 0.08)',
    },
    dark: {
      cardBg: '#4d0721',
      accent: '#f472b6',
      border: '#9d174d',
      badgeBg: 'rgba(244, 114, 182, 0.16)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
}

const aliasMap = {
  fitness: 'exercise',
  mindfulness: 'wellness',
  health: 'health & fitness',
  'health & fitness': 'health & fitness',
  'mental health': 'mental health',
  'mental-health': 'mental health',
  wellness: 'wellness',
  learning: 'learning',
  sleep: 'sleep',
  exercise: 'exercise',
  work: 'work',
  routine: 'daily routine',
  'daily routine': 'daily routine',
}

const getCategoryKey = (category) => {
  const normalized = normalizeCategory(category)
  return aliasMap[normalized] || 'general'
}

export const getCategoryMeta = (category) => {
  const key = getCategoryKey(category)
  return categoryPalette[key] || categoryPalette.general
}

export const getCategoryClass = (category) => `habit-card--${getCategoryMeta(category).slug}`

export const getCategoryColor = (category, theme = 'light') => {
  const meta = getCategoryMeta(category)
  const variant = meta[theme] || meta.light

  return {
    accent: variant.accent,
    bg: variant.cardBg,
    text: theme === 'light' ? '#111827' : '#ffffff', // automatic black/white text choice
    border: variant.border,
    badgeBg: variant.badgeBg,
    shadow: variant.shadow,
  }
}

export const getCategoryStyle = (category, theme = 'light') => {
  const colors = getCategoryColor(category, theme)

  return {
    '--category-card-bg': colors.bg,
    '--category-text': colors.text,
    '--category-accent': colors.accent,
    '--category-border': colors.border,
    '--category-badge-bg': colors.badgeBg,
    '--category-shadow': colors.shadow,
  }
}
