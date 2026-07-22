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

  useEffect(() => {
    setToday(getToday())
  }, [])

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
  }

  const handleUpdate = async (formData) => {
    await supabase.from('activities').update(formData).eq('id', editingActivity.id)
    setEditingActivity(null)
    fetchActivities()
  }

  const handleDelete = async (id) => {
    await supabase.from('activities').delete().eq('id', id)
    fetchActivities()
  }

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  if (!today) return null

  return (
    <div>
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
      {!showForm && !editingActivity && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Aktivitas Baru
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Tambah Aktivitas</h2>
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
    </div>
  )
}
