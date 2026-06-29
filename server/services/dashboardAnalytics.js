export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getLastNDays(n = 14) {
  const days = []
  const today = startOfDay()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function fillDailySeries(aggregated, days, field = 'count') {
  const map = Object.fromEntries(
    aggregated.map((row) => [row._id, row[field] ?? row.total ?? 0])
  )
  return days.map((date) => ({
    date,
    label: new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    }),
    value: map[date] ?? 0,
  }))
}

export async function getPeriodTrend(Model, filter = {}, days = 30) {
  const now = new Date()
  const currentStart = new Date(now)
  currentStart.setDate(currentStart.getDate() - days)
  const previousStart = new Date(currentStart)
  previousStart.setDate(previousStart.getDate() - days)

  const [current, previous] = await Promise.all([
    Model.countDocuments({ ...filter, createdAt: { $gte: currentStart } }),
    Model.countDocuments({
      ...filter,
      createdAt: { $gte: previousStart, $lt: currentStart },
    }),
  ])

  if (previous === 0) {
    return { change: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' }
  }

  const change = Math.round(((current - previous) / previous) * 100)
  return { change: Math.abs(change), direction: change >= 0 ? 'up' : 'down' }
}

export async function aggregateByDay(Model, match, valueField, days = 14) {
  const since = startOfDay()
  since.setDate(since.getDate() - (days - 1))

  const groupStage =
    valueField === 'amount'
      ? { total: { $sum: '$amount' }, count: { $sum: 1 } }
      : { count: { $sum: 1 } }

  const aggregated = await Model.aggregate([
    { $match: { ...match, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        ...groupStage,
      },
    },
    { $sort: { _id: 1 } },
  ])

  const dayKeys = getLastNDays(days)
  return fillDailySeries(
    aggregated.map((row) => ({
      _id: row._id,
      count: row.count ?? 0,
      total: row.total ?? 0,
    })),
    dayKeys,
    valueField === 'amount' ? 'total' : 'count'
  )
}
