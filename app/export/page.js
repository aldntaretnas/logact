'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getToday, formatDateShort, formatDuration, getCategoryColor } from '@/lib/utils'
import { generatePDF } from '@/components/ExportPDF'

export default function ExportPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeRange, setActiveRange] = useState('month')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const today = getToday()
    const firstDay = today.slice(0, 7) + '-01'
    setDateFrom(firstDay)
    setDateTo(today)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    fetchActivities()
  }, [dateFrom, dateTo, ready])

  async function fetchActivities() {
    setLoading(true)
    let query = supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true })
      .order('created_at', { ascending: true })

    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data } = await query
    setActivities(data || [])
    setLoading(false)
  }

  const handleExport = async () => {
    setExporting(true)
    await generatePDF(activities, dateFrom, dateTo)
    setExporting(false)
  }

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  const setQuickRange = (type) => {
    const today = getToday()
    const now = new Date()
    setActiveRange(type)
    if (type === 'today') {
      setDateFrom(today)
      setDateTo(today)
    } else if (type === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1)
      setDateFrom(startOfWeek.toISOString().split('T')[0])
      setDateTo(today)
    } else if (type === 'month') {
      setDateFrom(today.slice(0, 7) + '-01')
      setDateTo(today)
    }
  }

  const handleDateChange = () => setActiveRange(null)

  if (!ready) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Export Laporan Log Activity</h1>
        <p className="text-sm text-slate-500 mt-1">Pilih rentang tanggal dan download laporan</p>
      </div>

      {/* Date range & quick filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'today', label: 'Hari Ini' },
            { key: 'week', label: 'Minggu Ini' },
            { key: 'month', label: 'Bulan Ini' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setQuickRange(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeRange === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); handleDateChange() }}
                className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); handleDateChange() }}
                className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {activities.length} aktivitas | {totalDuration > 0 ? formatDuration(totalDuration) : '0 Jam'}
          </p>
          <button
            onClick={handleExport}
            disabled={activities.length === 0 || exporting}
            className="shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>{exporting ? '...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Preview table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">Preview Laporan</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Tidak ada aktivitas dalam rentang tanggal ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Aktivitas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDateShort(a.date)}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{a.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(a.category)}`}>
                        {a.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600">{a.duration ? formatDuration(a.duration) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
