'use client'

import { useState, useEffect } from 'react'
import { getToday } from '@/lib/utils'
import CategoryInput from './CategoryInput'

export default function ActivityForm({ activity, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    category: activity?.category || '',

    duration: activity?.duration || '',
    date: activity?.date || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!form.date) {
      setForm(f => ({ ...f, date: getToday() }))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      ...form,
      duration: form.duration ? parseInt(form.duration) : null,
    })
    setLoading(false)
    if (!activity) {
      setForm({
        title: '',
        description: '',
        category: '',
        duration: '',
        date: getToday(),
      })
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Judul Aktivitas <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Ketik judul aktivitas"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Kategori <span className="text-red-500">*</span>
          </label>
          <CategoryInput
            value={form.category}
            onChange={(val) => setForm({ ...form, category: val })}
            placeholder="Ketik kategori"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Durasi (menit) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            min="1"
            required
            placeholder="Durasi dalam menit"
            inputMode="numeric"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full appearance-none px-3 py-2.5 pr-8 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deskripsi / Catatan
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Tulis catatan tambahan..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none sm:px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors min-h-[44px]"
        >
          {loading ? 'Menyimpan...' : activity ? 'Update' : 'Tambah Aktivitas'}
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
