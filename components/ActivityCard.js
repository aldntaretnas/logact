'use client'

import { useState } from 'react'
import CategoryBadge from './CategoryBadge'
import { formatDuration } from '@/lib/utils'

export default function ActivityCard({ activity, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={activity.category} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 truncate">{activity.title}</h3>
            {activity.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{activity.description}</p>
            )}
            {activity.duration && (
              <p className="text-xs text-slate-400 mt-2">
                Durasi: {formatDuration(activity.duration)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 ml-4 shrink-0">
            <button
              onClick={() => onEdit(activity)}
              className="p-1.5 text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-slate-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-[fadeScaleIn_0.25s_ease-out]">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Hapus Aktivitas?</h3>
            <p className="text-sm text-slate-500 mb-1">Kamu yakin mau hapus aktivitasmu yang ini?</p>
            <p className="text-sm font-medium text-slate-700 mb-5 truncate">"{activity.title}"</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowConfirm(false); onDelete(activity.id) }}
                className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes fadeScaleIn {
              from { opacity: 0; transform: scale(0.85); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
