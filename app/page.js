'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { getToday, formatDuration, formatDate, getInternshipWeek } from '@/lib/utils'
import ActivityForm from '@/components/ActivityForm'
import ActivityCard from '@/components/ActivityCard'
import StatsCard from '@/components/StatsCard'
import Timer from '@/components/Timer'
import WorkLogForm from '@/components/WorkLogForm'
import WorkLogCard from '@/components/WorkLogCard'

export default function HomePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('personal')

  // --- Aktivitas Pribadi ---
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [today, setToday] = useState('')
  const [toast, setToast] = useState(null)

  // --- Aktivitas Kerja ---
  const [workLogs, setWorkLogs] = useState([])
  const [loadingWork, setLoadingWork] = useState(true)
  const [showWorkForm, setShowWorkForm] = useState(false)
  const [editingWorkLog, setEditingWorkLog] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    setToday(getToday())
  }, [])

  useEffect(() => {
    document.body.style.overflow = (showForm || editingActivity || showWorkForm || editingWorkLog) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showForm, editingActivity, showWorkForm, editingWorkLog])

  const fetchActivities = useCallback(async () => {
    if (!today || !user) return
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('date', today)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setActivities(data || [])
    setLoading(false)
  }, [today, user])

  const fetchWorkLogs = useCallback(async () => {
    if (!today || !user) return
    const { data } = await supabase
      .from('work_logs')
      .select('*')
      .eq('date', today)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setWorkLogs(data || [])
    setLoadingWork(false)
  }, [today, user])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  useEffect(() => {
    fetchWorkLogs()
  }, [fetchWorkLogs])

  // Aktivitas Pribadi handlers
  const handleCreate = async (formData) => {
    await supabase.from('activities').insert([{ ...formData, user_id: user.id }])
    setShowForm(false)
    fetchActivities()
    showToast('Aktivitas berhasil ditambahkan!')
  }

  const handleUpdate = async (formData) => {
    await supabase.from('activities').update(formData).eq('id', editingActivity.id)
    setEditingActivity(null)
    fetchActivities()
    showToast('Aktivitas berhasil diperbarui!')
  }

  const handleDelete = async (id) => {
    await supabase.from('activities').delete().eq('id', id)
    fetchActivities()
    showToast('Aktivitas berhasil dihapus!')
  }

  // Aktivitas Kerja handlers
  const handleCreateWork = async (formData) => {
    await supabase.from('work_logs').insert([{ ...formData, user_id: user.id }])
    setShowWorkForm(false)
    fetchWorkLogs()
    showToast('Logbook berhasil ditambahkan!')
  }

  const handleUpdateWork = async (formData) => {
    await supabase.from('work_logs').update(formData).eq('id', editingWorkLog.id)
    setEditingWorkLog(null)
    fetchWorkLogs()
    showToast('Logbook berhasil diperbarui!')
  }

  const handleDeleteWork = async (id) => {
    await supabase.from('work_logs').delete().eq('id', id)
    fetchWorkLogs()
    showToast('Logbook berhasil dihapus!')
  }

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)
  const currentWeek = today ? getInternshipWeek(today) : null

  if (!today) return null

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Hari Ini</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDate(today)}</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('personal')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            tab === 'personal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Aktivitas Pribadi
        </button>
        <button
          onClick={() => setTab('work')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            tab === 'work'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Aktivitas Kerja
        </button>
      </div>

      {/* --- TAB: Aktivitas Pribadi --- */}
      {tab === 'personal' && (
        <>
          <Timer onActivitySaved={fetchActivities} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Total Aktivitas"
              value={activities.length}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              }
            />
            <StatsCard
              title="Total Durasi"
              value={formatDuration(totalDuration)}
              subtitle={totalDuration > 0 ? `${totalDuration} menit` : null}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              title="Kategori"
              value={new Set(activities.map(a => a.category)).size}
              subtitle="jenis aktivitas"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              }
            />
          </div>

          {!editingActivity && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 active:bg-blue-50 transition-all hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)] flex items-center justify-center gap-2 min-h-[48px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Aktivitas Baru</span>
            </button>
          )}

          {showForm && (
            <div className="mb-6">
              <ActivityForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {editingActivity && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Edit Aktivitas</h2>
              <ActivityForm activity={editingActivity} onSubmit={handleUpdate} onCancel={() => setEditingActivity(null)} />
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Daftar Aktivitas</h2>
            {loading ? (
              <div className="text-center py-12 text-slate-400">Memuat...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400">Belum ada aktivitas hari ini</p>
                <p className="text-sm text-slate-300 mt-1">Klik tombol di atas untuk menambah</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={(a) => { setShowForm(false); setEditingActivity(a) }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB: Aktivitas Kerja --- */}
      {tab === 'work' && (
        <>
          {currentWeek && (
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                Pekan {currentWeek}
              </span>
              <span className="text-sm text-slate-400">masa magang</span>
            </div>
          )}

          {!editingWorkLog && (
            <button
              onClick={() => setShowWorkForm(true)}
              className="w-full mb-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 active:bg-blue-50 transition-all hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)] flex items-center justify-center gap-2 min-h-[48px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Logbook Kerja</span>
            </button>
          )}

          {showWorkForm && (
            <div className="mb-6">
              <WorkLogForm onSubmit={handleCreateWork} onCancel={() => setShowWorkForm(false)} />
            </div>
          )}

          {editingWorkLog && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Edit Logbook</h2>
              <WorkLogForm workLog={editingWorkLog} onSubmit={handleUpdateWork} onCancel={() => setEditingWorkLog(null)} />
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Logbook Hari Ini</h2>
            {loadingWork ? (
              <div className="text-center py-12 text-slate-400">Memuat...</div>
            ) : workLogs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400">Belum ada logbook hari ini</p>
                <p className="text-sm text-slate-300 mt-1">Klik tombol di atas untuk menambah</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workLogs.map((wl) => (
                  <WorkLogCard
                    key={wl.id}
                    workLog={wl}
                    onEdit={(w) => { setShowWorkForm(false); setEditingWorkLog(w) }}
                    onDelete={handleDeleteWork}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-safe-6 left-0 right-0 mx-auto w-fit z-50 px-5 py-3 bg-slate-800 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  )
}
