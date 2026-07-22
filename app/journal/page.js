'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getToday, formatDate, formatDateShort, formatDuration } from '@/lib/utils'
import JournalEditor from '@/components/JournalEditor'
import CategoryBadge from '@/components/CategoryBadge'

export default function JournalPage() {
  const [today, setToday] = useState('')
  const [activities, setActivities] = useState([])
  const [journals, setJournals] = useState([])

  useEffect(() => {
    const t = getToday()
    setToday(t)
    fetchActivities(t)
    fetchJournals()
  }, [])

  async function fetchActivities(date) {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true })
    setActivities(data || [])
  }

  async function fetchJournals() {
    const { data } = await supabase
      .from('journals')
      .select('*')
      .not('content', 'is', null)
      .order('date', { ascending: false })
      .limit(10)
    setJournals((data || []).filter(j => j.content?.trim() || j.plan_tomorrow?.trim()))
  }

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)

  if (!today) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Journal</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDate(today)}</p>
      </div>

      <JournalEditor date={today} />

      {/* Rekapan Aktivitas Hari Ini */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Rekapan Aktivitas Hari Ini</h2>
          <p className="text-xs text-slate-400">
            {`${activities.length} aktivitas hari ini, kamu udah hebat sejauh ini, jangan ngeluh lagi ya!`}
          </p>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada aktivitas hari ini</p>
        ) : (
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <CategoryBadge category={a.category} />
                <span className="text-sm text-slate-700 flex-1">{a.title}</span>
                {a.duration && (
                  <span className="text-xs text-slate-400">{formatDuration(a.duration)}</span>
                )}
              </div>
            ))}
            <div className="pt-2 text-xs text-slate-400 text-right">
              Total: {formatDuration(totalDuration)}
            </div>
          </div>
        )}
      </div>

      {/* Rekapan Refleksi dan Harapan */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Rekapan Refleksi dan Harapanmu Selama Ini</h2>

        {journals.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada catatan journal yang tersimpan</p>
        ) : (
          <div className="space-y-4">
            {journals.map((j) => (
              <div key={j.id} className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 mb-3">{formatDateShort(j.date)}</p>
                {j.content?.trim() && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Catatan / Refleksi</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{j.content}</p>
                  </div>
                )}
                {j.plan_tomorrow?.trim() && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Harapan di Hari Esok</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{j.plan_tomorrow}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
