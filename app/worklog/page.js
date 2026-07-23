'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { getToday, formatDateShort } from '@/lib/utils'
import WorkLogCard from '@/components/WorkLogCard'
import WorkLogForm from '@/components/WorkLogForm'

export default function WorkLogPage() {
  const { user } = useAuth()
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingWorkLog, setEditingWorkLog] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [weekFilter, setWeekFilter] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDateTo(getToday())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !user) return
    fetchWorkLogs()
  }, [dateFrom, dateTo, weekFilter, ready, user])

  async function fetchWorkLogs() {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)
    if (weekFilter) query = query.eq('week_number', parseInt(weekFilter))

    const { data } = await query
    setWorkLogs(data || [])
    setLoading(false)
  }

  const handleUpdate = async (formData) => {
    await supabase.from('work_logs').update(formData).eq('id', editingWorkLog.id)
    setEditingWorkLog(null)
    fetchWorkLogs()
  }

  const handleDelete = async (id) => {
    await supabase.from('work_logs').delete().eq('id', id)
    fetchWorkLogs()
  }

  // Group by date
  const grouped = workLogs.reduce((acc, wl) => {
    if (!acc[wl.date]) acc[wl.date] = []
    acc[wl.date].push(wl)
    return acc
  }, {})

  // Unique week numbers present in data
  const weeks = [...new Set(workLogs.map(wl => wl.week_number))].sort((a, b) => a - b)

  if (!ready) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Logbook Kerja</h1>
        <p className="text-sm text-slate-500 mt-1">{workLogs.length} entri ditemukan</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dari Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full appearance-none px-2.5 py-2.5 pr-7 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sampai Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full appearance-none px-2.5 py-2.5 pr-7 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Filter Pekan</label>
            <div className="relative">
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="w-full appearance-none px-2.5 py-2.5 pr-7 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              >
                <option value="">Semua Pekan</option>
                {weeks.map((w) => (
                  <option key={w} value={w}>Pekan {w}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
        {(dateFrom || weekFilter) && (
          <button
            onClick={() => { setDateFrom(''); setWeekFilter('') }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 min-h-[36px]"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Edit form */}
      {editingWorkLog && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Edit Logbook</h2>
          <WorkLogForm
            workLog={editingWorkLog}
            onSubmit={handleUpdate}
            onCancel={() => setEditingWorkLog(null)}
          />
        </div>
      )}

      {/* List grouped by date */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Memuat...</div>
      ) : workLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-400">Tidak ada logbook ditemukan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                {formatDateShort(date)}
              </h3>
              <div className="space-y-3">
                {items.map((wl) => (
                  <WorkLogCard
                    key={wl.id}
                    workLog={wl}
                    onEdit={(w) => setEditingWorkLog(w)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
