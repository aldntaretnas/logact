'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { getToday, formatDateShort, formatDuration, getCategoryColor } from '@/lib/utils'
import { generatePDF, generateWorkLogPDF } from '@/components/ExportPDF'

export default function ExportPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('activities')

  // --- Aktivitas Harian ---
  const [activities, setActivities] = useState([])
  const [loadingAct, setLoadingAct] = useState(false)
  const [exportingAct, setExportingAct] = useState(false)
  const [dateFromAct, setDateFromAct] = useState('')
  const [dateToAct, setDateToAct] = useState('')
  const [activeRange, setActiveRange] = useState('month')

  // --- Logbook Kerja ---
  const [workLogs, setWorkLogs] = useState([])
  const [loadingWork, setLoadingWork] = useState(false)
  const [exportingWork, setExportingWork] = useState(false)
  const [dateFromWork, setDateFromWork] = useState('')
  const [dateToWork, setDateToWork] = useState('')
  const [weekFilter, setWeekFilter] = useState('')

  const [ready, setReady] = useState(false)

  useEffect(() => {
    const today = getToday()
    const firstDay = today.slice(0, 7) + '-01'
    setDateFromAct(firstDay)
    setDateToAct(today)
    setDateToWork(today)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !user) return
    fetchActivities()
  }, [dateFromAct, dateToAct, ready, user])

  useEffect(() => {
    if (!ready || !user) return
    fetchWorkLogs()
  }, [dateFromWork, dateToWork, weekFilter, ready, user])

  async function fetchActivities() {
    if (!user) return
    setLoadingAct(true)
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true })
    if (dateFromAct) query = query.gte('date', dateFromAct)
    if (dateToAct) query = query.lte('date', dateToAct)
    const { data } = await query
    setActivities(data || [])
    setLoadingAct(false)
  }

  async function fetchWorkLogs() {
    if (!user) return
    setLoadingWork(true)
    let query = supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true })
    if (dateFromWork) query = query.gte('date', dateFromWork)
    if (dateToWork) query = query.lte('date', dateToWork)
    if (weekFilter) query = query.eq('week_number', parseInt(weekFilter))
    const { data } = await query
    setWorkLogs(data || [])
    setLoadingWork(false)
  }

  const handleExportActivities = async () => {
    setExportingAct(true)
    await generatePDF(activities, dateFromAct, dateToAct)
    setExportingAct(false)
  }

  const handleExportWorkLogs = async () => {
    setExportingWork(true)
    await generateWorkLogPDF(workLogs, dateFromWork, dateToWork)
    setExportingWork(false)
  }

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  const setQuickRange = (type) => {
    const today = getToday()
    const now = new Date()
    setActiveRange(type)
    if (type === 'today') {
      setDateFromAct(today); setDateToAct(today)
    } else if (type === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1)
      setDateFromAct(startOfWeek.toISOString().split('T')[0])
      setDateToAct(today)
    } else if (type === 'month') {
      setDateFromAct(today.slice(0, 7) + '-01')
      setDateToAct(today)
    }
  }

  const weeks = [...new Set(workLogs.map(wl => wl.week_number))].sort((a, b) => a - b)

  if (!ready) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Export Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">Pilih jenis laporan dan download PDF</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('activities')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            tab === 'activities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Aktivitas Harian
        </button>
        <button
          onClick={() => setTab('worklog')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            tab === 'worklog'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Logbook Kerja
        </button>
      </div>

      {/* ---- TAB: Aktivitas Harian ---- */}
      {tab === 'activities' && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: 'today', label: 'Hari Ini' },
                { key: 'week', label: 'Minggu Ini' },
                { key: 'month', label: 'Bulan Ini' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setQuickRange(key)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
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
                    value={dateFromAct}
                    onChange={(e) => { setDateFromAct(e.target.value); setActiveRange(null) }}
                    className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
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
                    value={dateToAct}
                    onChange={(e) => { setDateToAct(e.target.value); setActiveRange(null) }}
                    className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
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
                onClick={handleExportActivities}
                disabled={activities.length === 0 || exportingAct}
                className="shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>{exportingAct ? 'Menyiapkan...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Preview Laporan</h2>
            </div>
            {loadingAct ? (
              <div className="text-center py-12 text-slate-400">Memuat...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Tidak ada aktivitas dalam rentang tanggal ini</div>
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
        </>
      )}

      {/* ---- TAB: Logbook Kerja ---- */}
      {tab === 'worklog' && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFromWork}
                    onChange={(e) => setDateFromWork(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
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
                    value={dateToWork}
                    onChange={(e) => setDateToWork(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Filter Pekan</label>
                <div className="relative">
                  <select
                    value={weekFilter}
                    onChange={(e) => setWeekFilter(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
                  >
                    <option value="">Semua Pekan</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Pekan {i + 1}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{workLogs.length} entri logbook</p>
              <button
                onClick={handleExportWorkLogs}
                disabled={workLogs.length === 0 || exportingWork}
                className="shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>{exportingWork ? 'Menyiapkan...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Preview Logbook</h2>
            </div>
            {loadingWork ? (
              <div className="text-center py-12 text-slate-400">Memuat...</div>
            ) : workLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Tidak ada logbook dalam rentang tanggal ini</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">No</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Pekan Ke</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Kegiatan</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Hasil Kegiatan</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Dokumentasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workLogs.map((wl, i) => (
                      <tr key={wl.id}>
                        <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDateShort(wl.date)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Pekan {wl.week_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-800 max-w-xs">
                          <p className="line-clamp-3 whitespace-pre-wrap">{wl.activity}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-800 max-w-xs">
                          <p className="line-clamp-3 whitespace-pre-wrap">{wl.result}</p>
                        </td>
                        <td className="px-4 py-3">
                          {wl.doc_url ? (
                            <a
                              href={wl.doc_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                              Buka
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
