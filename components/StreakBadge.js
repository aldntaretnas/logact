'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export default function StreakBadge() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (user) calculateStreak()
  }, [user])

  async function calculateStreak() {
    if (!user) return
    const today = new Date()
    let count = 0
    let checkDate = new Date(today)

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]

      const [{ count: actCount }, { count: journalCount }] = await Promise.all([
        supabase.from('activities').select('*', { count: 'exact', head: true }).eq('date', dateStr).eq('user_id', user.id),
        supabase.from('journals').select('*', { count: 'exact', head: true }).eq('date', dateStr).eq('user_id', user.id),
      ])

      if ((actCount || 0) > 0 || (journalCount || 0) > 0) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        break
      }
    }

    setStreak(count)
  }

  if (streak === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
      <span className="text-orange-400 text-lg">🔥</span>
      <div>
        <p className="text-sm font-semibold text-white">{streak} hari</p>
        <p className="text-xs text-slate-400">berturut-turut</p>
      </div>
    </div>
  )
}
