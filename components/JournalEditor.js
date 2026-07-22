'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import confetti from 'canvas-confetti'

export default function JournalEditor({ date }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [planTomorrow, setPlanTomorrow] = useState('')
  const [saving, setSaving] = useState(false)
  const [journalId, setJournalId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!date) return
    fetchJournal()
  }, [date])

  async function fetchJournal() {
    if (!user) return
    const { data } = await supabase
      .from('journals')
      .select('*')
      .eq('date', date)
      .eq('user_id', user.id)
      .single()

    if (data) {
      setJournalId(data.id)
      setContent(data.content || '')
      setPlanTomorrow(data.plan_tomorrow || '')
    } else {
      setJournalId(null)
      setContent('')
      setPlanTomorrow('')
    }
  }

  async function saveJournal() {
    if (!user) return
    setSaving(true)
    if (journalId) {
      await supabase
        .from('journals')
        .update({ content, plan_tomorrow: planTomorrow })
        .eq('id', journalId)
    } else {
      const { data } = await supabase
        .from('journals')
        .insert([{ date, content, plan_tomorrow: planTomorrow, user_id: user.id }])
        .select()
        .single()
      if (data) setJournalId(data.id)
    }
    setSaving(false)
    setShowModal(true)
    fireConfetti()
  }

  function fireConfetti() {
    const duration = 3000
    const end = Date.now() + duration

    const colors = ['#1d4ed8', '#3b82f6', '#93c5fd', '#fbbf24', '#f472b6', '#34d399']

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
          <label className="block text-sm font-semibold text-slate-800 mb-3">Catatan / Refleksi Hari Ini</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Apa yang kamu pelajari hari ini? Ada hal menarik? Tantangan yang dihadapi?"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
          <label className="block text-sm font-semibold text-slate-800 mb-3">Harapan di Hari Esok</label>
          <textarea
            value={planTomorrow}
            onChange={(e) => setPlanTomorrow(e.target.value)}
            rows={4}
            placeholder="Apa harapanmu untuk hari esok?"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveJournal}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan Journal'}
          </button>
        </div>
      </div>

      {/* Success modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-[fadeScaleIn_0.3s_ease-out]">
            {/* Sparkle icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Journal Tersimpan!</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Semangat terus ya, semoga tercapai harapannya. Jangan lupa usaha dan terus berdoa.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Terima kasih!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
