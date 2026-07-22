'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { getWeekDays, getDayName, formatDuration, formatDateShort } from '@/lib/utils'

export default function TimesheetPage() {
  const { user } = useAuth()
  const [weekOffset, setWeekOffset] = useState(0)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekDays, setWeekDays] = useState([])

  useEffect(() => {
    const days = getWeekDays(weekOffset)
    setWeekDays(days)
  }, [weekOffset])

  useEffect(() => {
    if (weekDays.length === 0) return
    fetchActivities()
  }, [weekDays])

  async function fetchActivities() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekDays[0])
      .lte('date', weekDays[6])
      .order('created_at', { ascending: true })
    setActivities(data || [])
    setLoading(false)
  }

  const projects = [...new Set(activities.map(a => a.category || 'Tanpa Kategori'))].sort()

  const getMinutes = (cat, date) => {
    return activities
      .filter(a => (a.category || 'Tanpa Kategori') === cat && a.date === date)
      .reduce((sum, a) => sum + (a.duration || 0), 0)
  }

  const getDayTotal = (date) => {
    return activities
      .filter(a => a.date === date)
      .reduce((sum, a) => sum + (a.duration || 0), 0)
  }

  const getProjectTotal = (cat) => {
    return activities
      .filter(a => (a.category || 'Tanpa Kategori') === cat)
      .reduce((sum, a) => sum + (a.duration || 0), 0)
  }

  const grandTotal = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  if (weekDays.length === 0) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Timesheet</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan mingguan berdasarkan kategori</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">
            {formatDateShort(weekDays[0])} — {formatDateShort(weekDays[6])}
          </p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              Minggu ini
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Timesheet grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase sticky left-0 bg-slate-50 min-w-[140px]">
                    Kategori
                  </th>
                  {weekDays.map((day) => (
                    <th key={day} className="text-center px-3 py-3 text-xs font-medium text-slate-500 min-w-[80px]">
                      <div>{getDayName(day)}</div>
                      <div className="text-slate-400 font-normal">{day.slice(8)}</div>
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-700 uppercase bg-slate-100 min-w-[80px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Tidak ada data minggu ini
                    </td>
                  </tr>
                ) : (
                  projects.map((cat) => (
                    <tr key={cat}>
                      <td className="px-4 py-3 font-medium text-slate-700 sticky left-0 bg-white">
                        {cat}
                      </td>
                      {weekDays.map((day) => {
                        const mins = getMinutes(cat, day)
                        return (
                          <td key={day} className="text-center px-3 py-3 text-slate-600">
                            {mins > 0 ? (
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {formatDuration(mins)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-center px-3 py-3 font-medium text-slate-800 bg-slate-50">
                        {formatDuration(getProjectTotal(cat))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {projects.length > 0 && (
                <tfoot>
                  <tr className="bg-blue-600 font-medium">
                    <td className="px-4 py-3 text-white sticky left-0 bg-blue-600">
                      Total
                    </td>
                    {weekDays.map((day) => {
                      const total = getDayTotal(day)
                      return (
                        <td key={day} className="text-center px-3 py-3 text-blue-100">
                          {total > 0 ? formatDuration(total) : '-'}
                        </td>
                      )
                    })}
                    <td className="text-center px-3 py-3 text-white font-bold">
                      {formatDuration(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
