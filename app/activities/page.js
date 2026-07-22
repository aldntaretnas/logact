'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDateShort, getToday } from '@/lib/utils'
import ActivityCard from '@/components/ActivityCard'
import ActivityForm from '@/components/ActivityForm'

export default function ActivitiesPage() {
  const searchParams = useSearchParams()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingActivity, setEditingActivity] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setDateFrom(dateParam)
      setDateTo(dateParam)
    } else {
      setDateTo(getToday())
    }
    setReady(true)
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!ready) return
    fetchActivities()
  }, [dateFrom, dateTo, categoryFilter, ready])

  async function fetchCategories() {
    const { data } = await supabase.from('activities').select('category')
    if (data) {
      setCategories([...new Set(data.map(d => d.category))].sort())
    }
  }

  async function fetchActivities() {
    setLoading(true)
    let query = supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)
    if (categoryFilter) query = query.eq('category', categoryFilter)

    const { data } = await query
    setActivities(data || [])
    setLoading(false)
  }

  const handleUpdate = async (formData) => {
    await supabase.from('activities').update(formData).eq('id', editingActivity.id)
    setEditingActivity(null)
    fetchActivities()
    fetchCategories()
  }

  const handleDelete = async (id) => {
    await supabase.from('activities').delete().eq('id', id)
    fetchActivities()
    fetchCategories()
  }

  const grouped = activities.reduce((acc, activity) => {
    const date = activity.date
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {})

  if (!ready) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Semua Aktivitas</h1>
        <p className="text-sm text-slate-500 mt-1">
          {activities.length} aktivitas ditemukan
        </p>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori</label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none px-2.5 py-2.5 pr-7 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
        {(dateFrom || categoryFilter) && (
          <button
            onClick={() => { setDateFrom(''); setCategoryFilter('') }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 min-h-[36px]"
          >
            Reset filter
          </button>
        )}
      </div>

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

      {/* Activity list grouped by date */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Memuat...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-400">Tidak ada aktivitas ditemukan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                {formatDateShort(date)}
              </h3>
              <div className="space-y-3">
                {items.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={(a) => setEditingActivity(a)}
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
