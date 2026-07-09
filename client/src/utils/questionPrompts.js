const CATEGORY_TOPICS = {
  startup: 'validation, co-founders, incorporation, or early-stage strategy',
  finance: 'taxes, bookkeeping, fundraising terms, or financial planning',
  legal: 'contracts, incorporation, compliance, or IP protection',
  marketing: 'growth strategy, positioning, channels, or brand building',
  engineering: 'architecture, hiring, tech stack, or scaling your team',
  career: 'career moves, interviews, leadership, or skill development',
  product: 'roadmap, user research, prioritization, or product-market fit',
  other: 'your specific situation or challenge',
}

const EXPERT_TOPIC_OVERRIDES = {
  founder: {
    startup: 'validation, co-founders, incorporation, or early-stage strategy',
    product: 'product-market fit, early users, roadmap tradeoffs, or founder-led product decisions',
  },
  'co-founder': {
    startup: 'finding a co-founder, equity splits, roles, or partnership dynamics',
  },
  'angel investor': {
    startup: 'pitching, valuations, term sheets, or raising your first round',
    finance: 'angel terms, cap tables, SAFE notes, or early fundraising strategy',
  },
  'vc mentor': {
    startup: 'fundraising strategy, investor outreach, diligence, or scaling with venture capital',
    finance: 'venture metrics, runway planning, or preparing for institutional rounds',
  },
  ca: {
    finance: 'GST, audits, bookkeeping, compliance, or tax planning for your business',
  },
  cfo: {
    finance: 'cash flow, unit economics, financial models, or board reporting',
  },
  lawyer: {
    legal: 'contracts, founder agreements, compliance, or IP protection',
  },
  mentor: {
    career: 'career moves, leadership growth, interviews, or navigating your next role',
  },
}

function normalizeKey(value) {
  return (value || '').toLowerCase().trim().replace(/\s+/g, '-')
}

function categorySlug(category) {
  return normalizeKey(category?.slug || category?.name)
}

function expertSlug(expertType) {
  return normalizeKey(expertType?.slug || expertType?.name)
}

export function getQuestionPlaceholder(category, expertType) {
  if (expertType?.placeholder?.trim()) return expertType.placeholder.trim()
  if (!expertType?.name) {
    return (
      category?.placeholder?.trim() ||
      category?.description?.trim() ||
      'Describe your question in detail...'
    )
  }

  const role = expertType.name.toLowerCase()
  const catKey = categorySlug(category)
  const typeKey = expertSlug(expertType)
  const topics =
    EXPERT_TOPIC_OVERRIDES[typeKey]?.[catKey] ||
    EXPERT_TOPIC_OVERRIDES[role]?.[catKey] ||
    CATEGORY_TOPICS[catKey] ||
    category?.description?.trim() ||
    'your situation'

  return `Ask a ${role} about ${topics}...`
}

export function getQuestionSuggestions(category, expertType) {
  if (expertType?.suggestions?.length) return expertType.suggestions
  if (!expertType?.name) return category?.suggestions || []

  const role = expertType.name
  const catName = (category?.name || 'this area').toLowerCase()
  const catSuggestions = category?.suggestions || []

  if (catSuggestions.length) {
    return catSuggestions.map((text) =>
      text.replace(/\b(expert|founder|mentor)\b/gi, role).replace(/\b(this category|this area)\b/gi, catName)
    )
  }

  return [
    `What should I ask a ${role} about ${catName} right now?`,
    `How can a ${role} help me make a better decision in ${catName}?`,
    `What mistakes do people make before consulting a ${role} in ${catName}?`,
  ]
}
