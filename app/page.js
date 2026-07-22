'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getToday, formatDuration, formatDate } from '@/lib/utils'
import ActivityForm from '@/components/ActivityForm'
import ActivityCard from '@/components/ActivityCard'
import StatsCard from '@/components/StatsCard'
import Timer from '@/components/Timer'

export default function HomePage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [today, setToday] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    setToday(getToday())
  }, [])

  useEffect(() => {
    document.body.style.overflow = (showForm || editingActivity) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showForm, editingActivity])

  const fetchActivities = useCallback(async () => {
    if (!today) return
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('date', today)
      .order('created_at', { ascending: false })
    setActivities(data || [])
    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleCreate = async (formData) => {
    await supabase.from('activities').insert([formData])
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

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  if (!today) return null

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Aktivitas Hari Ini</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDate(today)}</p>
      </div>

      {/* Timer */}
      <Timer onActivitySaved={fetchActivities} />

      {/* Stats */}
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

      {/* Add button */}
      {!editingActivity && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Tambah Aktivitas Baru</span>
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6">
          <ActivityForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editingActivity && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Edit Aktivitas</h2>
          <ActivityForm
            activity={editingActivity}
            onSubmit={handleUpdate}
            onCancel={() => setEditingActivity(null)}
          />
        </div>
      )}

      {/* Activity list */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Daftar Aktivitas
        </h2>
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
                onEdit={(a) => {
                  setShowForm(false)
                  setEditingActivity(a)
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-fit z-50 px-5 py-3 bg-slate-800 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  )
}
