'use client'

import { useState, useEffect } from 'react'
import { getToday, getInternshipWeek } from '@/lib/utils'

export default function WorkLogForm({ workLog, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    date: workLog?.date || '',
    week_number: workLog?.week_number || '',
    activity: workLog?.activity || '',
    result: workLog?.result || '',
    doc_url: workLog?.doc_url || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!form.date) {
      const today = getToday()
      const week = getInternshipWeek(today)
      setForm(f => ({ ...f, date: today, week_number: week || '' }))
    }
  }, [])

  const handleDateChange = (e) => {
    const date = e.target.value
    const week = getInternshipWeek(date)
    setForm(f => ({ ...f, date, week_number: week || '' }))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      ...form,
      week_number: parseInt(form.week_number) || 1,
    })
    setLoading(false)
    if (!workLog) {
      const today = getToday()
      setForm({
        date: today,
        week_number: getInternshipWeek(today) || '',
        activity: '',
        result: '',
        doc_url: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleDateChange}
              required
              className="w-full appearance-none px-3 py-2.5 pr-8 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pekan Ke <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="week_number"
            value={form.week_number}
            onChange={handleChange}
            min="1"
            required
            placeholder="Dihitung otomatis"
            inputMode="numeric"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Kegiatan <span className="text-red-500">*</span>
          </label>
          <textarea
            name="activity"
            value={form.activity}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Tulis kegiatan yang dilakukan..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hasil Kegiatan <span className="text-red-500">*</span>
          </label>
          <textarea
            name="result"
            value={form.result}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Tulis hasil dari kegiatan..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Link Dokumentasi
          </label>
          <input
            type="url"
            name="doc_url"
            value={form.doc_url}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
          />
          <p className="text-xs text-slate-400 mt-1">Opsional — link Google Drive atau dokumen lainnya</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none sm:px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors min-h-[44px]"
        >
          {loading ? 'Menyimpan...' : workLog ? 'Update' : 'Tambah Logbook'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none sm:px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors min-h-[44px]"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  )
}
