'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatTime, getToday } from '@/lib/utils'
import CategoryInput from './CategoryInput'

const TIMER_KEY = 'log-activity-timer'

function getTimerState() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(TIMER_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveTimerState(state) {
  if (state) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(TIMER_KEY)
  }
}

export default function Timer({ onActivitySaved }) {
  const [running, setRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')

  const [expanded, setExpanded] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    const saved = getTimerState()
    if (saved && saved.startTime) {
      setRunning(true)
      setStartTime(saved.startTime)
      setTitle(saved.title || '')
      setCategory(saved.category || '')
      setExpanded(true)
    }
  }, [])

  useEffect(() => {
    if (running && startTime) {
      const tick = () => {
        const now = Date.now()
        setElapsed(Math.floor((now - startTime) / 1000))
      }
      tick()
      intervalRef.current = setInterval(tick, 1000)
      return () => clearInterval(intervalRef.current)
    } else {
      setElapsed(0)
    }
  }, [running, startTime])

  const handleStart = () => {
    const now = Date.now()
    setRunning(true)
    setStartTime(now)
    setExpanded(true)
    saveTimerState({ startTime: now, title, category })
  }

  const handleStop = async () => {
    if (!title.trim()) return

    const endTime = Date.now()
    const durationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000))

    await supabase.from('activities').insert([{
      title: title.trim(),
      category: category.trim() || 'other',
      duration: durationMinutes,
      date: getToday(),
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      is_running: false,
    }])

    setRunning(false)
    setStartTime(null)
    setElapsed(0)
    setTitle('')
    setCategory('')
    setExpanded(false)
    saveTimerState(null)
    onActivitySaved?.()
  }

  const handleDiscard = () => {
    setRunning(false)
    setStartTime(null)
    setElapsed(0)
    setTitle('')
    setCategory('')
    setExpanded(false)
    saveTimerState(null)
  }

  useEffect(() => {
    if (running) {
      saveTimerState({ startTime, title, category })
    }
  }, [title, category, running, startTime])

  return (
    <div className="bg-white rounded-xl border border-slate-200 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
      <div className="flex items-center gap-4 p-4 min-h-[56px]">
        {!running ? (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-slate-800 transition-colors flex-1 text-left min-h-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timer
            </button>
            {expanded ? (
              <button
                onClick={handleStart}
                className="ml-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center gap-1.5 shrink-0 min-h-[44px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Start
              </button>
            ) : (
              <button
                onClick={() => setExpanded(true)}
                className="ml-auto p-2 text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Mulai timer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-slate-800">
                {formatTime(elapsed)}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleDiscard}
                className="px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors min-h-[44px]"
              >
                Buang
              </button>
              <button
                onClick={handleStop}
                disabled={!title.trim()}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0014.5 3h-9z" clipRule="evenodd" />
                </svg>
                <span className="hidden xs:inline sm:inline">Stop & Simpan</span>
                <span className="xs:hidden sm:hidden">Stop</span>
              </button>
            </div>
          </>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Apa yang sedang dikerjakan?"
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
            <CategoryInput
              value={category}
              onChange={setCategory}
            />
          </div>
        </div>
      )}
    </div>
  )
}
