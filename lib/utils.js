const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800',
  'bg-red-100 text-red-800',
  'bg-cyan-100 text-cyan-800',
]

export function getCategoryColor(category) {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

export function formatDuration(minutes) {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getToday() {
  return new Date().toISOString().split('T')[0]
}

export function getWeekDays(offsetWeeks = 0) {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offsetWeeks * 7)

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

  const days = []
  for (let i = 0; i < startPad; i++) {
    const d = new Date(firstDay)
    d.setDate(d.getDate() - startPad + i)
    days.push({ date: d.toISOString().split('T')[0], currentMonth: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ date: d.toISOString().split('T')[0], currentMonth: true })
  }
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDay)
      d.setDate(d.getDate() + i)
      days.push({ date: d.toISOString().split('T')[0], currentMonth: false })
    }
  }
  return days
}

export function getDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' })
}

export function getMonthName(month) {
  return new Date(2024, month).toLocaleDateString('id-ID', { month: 'long' })
}

// Internship: 15 Jul 2026 – 15 Sep 2026, week 1 = 15-17 Jul, then Mon–Fri
const INTERNSHIP_START = new Date('2026-07-15')

export function getInternshipWeek(dateStr) {
  const date = new Date(dateStr)
  if (date < INTERNSHIP_START) return null
  // Days since start
  const diffDays = Math.floor((date - INTERNSHIP_START) / (1000 * 60 * 60 * 24))
  // Week 1: days 0-4 (15-17 Jul + Mon-based), then every 7 days
  if (diffDays < 5) return 1
  return Math.floor((diffDays - 5) / 7) + 2
}

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
