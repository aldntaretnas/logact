'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMonthDays, getMonthName, getToday } from '@/lib/utils'

const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function CalendarPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [year, setYear] = useState(0)
  const [month, setMonth] = useState(0)
  const [days, setDays] = useState([])
  const [activityCounts, setActivityCounts] = useState({})
  const [today, setToday] = useState('')

  useEffect(() => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth())
    setToday(getToday())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    setDays(getMonthDays(year, month))
    fetchCounts()
  }, [year, month, ready])

  async function fetchCounts() {
    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0)
    const lastDayStr = lastDay.toISOString().split('T')[0]

    const { data } = await supabase
      .from('activities')
      .select('date')
      .gte('date', firstDay)
      .lte('date', lastDayStr)

    const counts = {}
    if (data) {
      data.forEach((a) => {
        counts[a.date] = (counts[a.date] || 0) + 1
      })
    }
    setActivityCounts(counts)
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const goToToday = () => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const getIntensity = (count) => {
    if (!count) return ''
    if (count <= 1) return 'bg-blue-100'
    if (count <= 3) return 'bg-blue-200'
    if (count <= 5) return 'bg-blue-300'
    return 'bg-blue-400'
  }

  if (!ready) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kalender</h1>
        <p className="text-sm text-slate-500 mt-1">Lihat aktivitas per hari</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">
            {getMonthName(month)} {year}
          </p>
          <button
            onClick={goToToday}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            Hari ini
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-slate-50">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center py-3 text-xs font-medium text-slate-500 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map(({ date, currentMonth }, i) => {
            const count = activityCounts[date] || 0
            const isToday = date === today
            return (
              <button
                key={i}
                onClick={() => router.push(`/activities?date=${date}`)}
                className={`
                  relative p-3 min-h-[80px] border-t border-r border-slate-100 text-left
                  hover:bg-blue-50 transition-colors
                  ${!currentMonth ? 'opacity-40' : ''}
                  ${isToday ? 'ring-2 ring-inset ring-blue-500' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${isToday ? 'text-blue-600' : 'text-slate-700'}
                `}>
                  {parseInt(date.slice(8))}
                </span>
                {count > 0 && (
                  <div className={`mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getIntensity(count)} text-blue-800`}>
                    {count}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span>Sedikit</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-blue-100"></div>
          <div className="w-4 h-4 rounded bg-blue-200"></div>
          <div className="w-4 h-4 rounded bg-blue-300"></div>
          <div className="w-4 h-4 rounded bg-blue-400"></div>
        </div>
        <span>Banyak</span>
      </div>
    </div>
  )
}
