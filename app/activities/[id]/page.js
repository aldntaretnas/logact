'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ActivityForm from '@/components/ActivityForm'

export default function EditActivityPage() {
  const { id } = useParams()
  const router = useRouter()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single()
      setActivity(data)
      setLoading(false)
    }
    fetchActivity()
  }, [id])

  const handleUpdate = async (formData) => {
    await supabase.from('activities').update(formData).eq('id', id)
    router.push('/activities')
  }

  const handleDelete = async () => {
    await supabase.from('activities').delete().eq('id', id)
    router.push('/activities')
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Memuat...</div>
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Aktivitas tidak ditemukan</p>
        <button
          onClick={() => router.push('/activities')}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          Kembali ke daftar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Aktivitas</h1>
          <p className="text-sm text-slate-500 mt-1">{activity.title}</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Hapus
        </button>
      </div>

      <ActivityForm
        activity={activity}
        onSubmit={handleUpdate}
        onCancel={() => router.push('/activities')}
      />
    </div>
  )
}
