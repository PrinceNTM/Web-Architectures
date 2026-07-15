const normalizeCategory = (category) => (category || 'General').toString().trim().toLowerCase()

const categoryPalette = {
  general: {
    slug: 'general',
    light: {
      cardBg: '#f7f9fb',
      text: '#111827',
      accent: '#6b7280',
      border: '#d3d9e1',
      badgeBg: 'rgba(107, 114, 128, 0.12)',
      shadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    },
    dark: {
      cardBg: '#1f2630',
      text: '#edf2fb',
      accent: '#9ca3af',
      border: '#2f3843',
      badgeBg: 'rgba(156, 163, 175, 0.14)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.24)',
    },
  },
  'health & fitness': {
    slug: 'health-fitness',
    light: {
      cardBg: '#e8f7ee',
      text: '#0f3d1f',
      accent: '#1f8a3a',
      border: '#9ed1a1',
      badgeBg: 'rgba(31, 138, 58, 0.14)',
      shadow: '0 18px 40px rgba(31, 138, 58, 0.16)',
    },
    dark: {
      cardBg: '#17331f',
      text: '#ecf9f0',
      accent: '#71c58d',
      border: '#2e6c45',
      badgeBg: 'rgba(71, 197, 141, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  exercise: {
    slug: 'exercise',
    light: {
      cardBg: '#e8f7ee',
      text: '#104027',
      accent: '#1f8a3a',
      border: '#8bc590',
      badgeBg: 'rgba(31, 138, 58, 0.14)',
      shadow: '0 18px 40px rgba(31, 138, 58, 0.16)',
    },
    dark: {
      cardBg: '#16371f',
      text: '#e9f6ef',
      accent: '#79c287',
      border: '#2d6944',
      badgeBg: 'rgba(121, 194, 135, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  wellness: {
    slug: 'wellness',
    light: {
      cardBg: '#eef4fb',
      text: '#10294a',
      accent: '#2c6eb7',
      border: '#b2d0ec',
      badgeBg: 'rgba(44, 110, 183, 0.14)',
      shadow: '0 18px 40px rgba(44, 110, 183, 0.16)',
    },
    dark: {
      cardBg: '#172a42',
      text: '#e8f1fb',
      accent: '#7fb1e0',
      border: '#3f6090',
      badgeBg: 'rgba(127, 177, 224, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  'mental health': {
    slug: 'mental-health',
    light: {
      cardBg: '#eef2fb',
      text: '#1c3053',
      accent: '#4a6cb8',
      border: '#a5b8dd',
      badgeBg: 'rgba(74, 108, 184, 0.14)',
      shadow: '0 18px 40px rgba(74, 108, 184, 0.16)',
    },
    dark: {
      cardBg: '#1c2c4c',
      text: '#e9eff9',
      accent: '#90a7de',
      border: '#415c88',
      badgeBg: 'rgba(144, 167, 222, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  learning: {
    slug: 'learning',
    light: {
      cardBg: '#fff7e2',
      text: '#4b3201',
      accent: '#d78d18',
      border: '#f3d18d',
      badgeBg: 'rgba(215, 141, 24, 0.14)',
      shadow: '0 18px 40px rgba(215, 141, 24, 0.16)',
    },
    dark: {
      cardBg: '#40321a',
      text: '#f9f2d8',
      accent: '#f4b14e',
      border: '#8f741b',
      badgeBg: 'rgba(244, 177, 78, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  sleep: {
    slug: 'sleep',
    light: {
      cardBg: '#f2effc',
      text: '#382f60',
      accent: '#7d5bbf',
      border: '#c6b7e1',
      badgeBg: 'rgba(125, 91, 191, 0.14)',
      shadow: '0 18px 40px rgba(125, 91, 191, 0.16)',
    },
    dark: {
      cardBg: '#2a2640',
      text: '#ede9ff',
      accent: '#a58be6',
      border: '#6f61a7',
      badgeBg: 'rgba(165, 139, 230, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  work: {
    slug: 'work',
    light: {
      cardBg: '#edf2fb',
      text: '#15263f',
      accent: '#4f6d95',
      border: '#b7c7e0',
      badgeBg: 'rgba(79, 109, 149, 0.14)',
      shadow: '0 18px 40px rgba(79, 109, 149, 0.16)',
    },
    dark: {
      cardBg: '#1e2737',
      text: '#dee8f5',
      accent: '#80a3d0',
      border: '#41577b',
      badgeBg: 'rgba(128, 163, 208, 0.18)',
      shadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    },
  },
  'daily routine': {
    slug: 'daily-routine',
    light: {
      cardBg: '#f4fbfa',
      text: '#103238',
      accent: '#4a9fae',
      border: '#b9d8d6',
      badgeBg: 'rgba(74, 159, 174, 0.14)',
      shadow: '0 18px 40px rgba(74, 159, 174, 0.16)',
    },
    dark: {
      cardBg: '#15282a',
      text: '#d9f0f2',
      accent: '#8cc7d1',
      border: '#3f686d',
      badgeBg: 'rgba(140, 199, 209, 0.18)',
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

export const getCategoryStyle = (category, theme = 'light') => {
  const meta = getCategoryMeta(category)
  const variant = meta[theme] || meta.light

  return {
    '--category-card-bg': variant.cardBg,
    '--category-text': variant.text,
    '--category-accent': variant.accent,
    '--category-border': variant.border,
    '--category-badge-bg': variant.badgeBg,
    '--category-shadow': variant.shadow,
  }
}
