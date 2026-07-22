'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-safe-6 left-0 right-0 mx-auto w-fit z-50 px-5 py-3 bg-slate-800 text-white text-sm font-medium rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400 shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  )
}

function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])
  return { toast, show }
}

function TodoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'hari-ini'

  const setTab = (t) => {
    router.replace(`/todo?tab=${t}`, { scroll: false })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">To-Do</h1>
        <p className="text-sm text-slate-500 mt-1">Rencanakan dan catat impianmu</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'hari-ini', label: 'Hari Ini' },
          { key: 'besok', label: 'Besok' },
          { key: 'wishlist', label: 'Wishlist' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'hari-ini' && <TodoList mode="hari-ini" />}
      {tab === 'besok' && <TodoList mode="besok" />}
      {tab === 'wishlist' && <Wishlist />}
    </div>
  )
}

export default function TodoPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400">Memuat...</div>}>
      <TodoContent />
    </Suspense>
  )
}

function TodoList({ mode }) {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const timeWrapperRef = useRef(null)
  const [timeFocused, setTimeFocused] = useState(false)
  const [adding, setAdding] = useState(false)
  const [targetDate, setTargetDate] = useState('')
  const [notifPermission, setNotifPermission] = useState('default')
  const notifiedRef = useRef(new Set())
  const { toast, show } = useToast()

  useEffect(() => {
    const d = new Date()
    if (mode === 'besok') d.setDate(d.getDate() + 1)
    const dateStr = d.toISOString().split('T')[0]
    setTargetDate(dateStr)
    fetchTodos(dateStr)
  }, [mode])

  useEffect(() => {
    if (mode !== 'hari-ini') return
    if ('Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [mode])

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  const playAlarm = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const beeps = [0, 0.35, 0.7]
      beeps.forEach((delay) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + delay + 0.25)
        gain.gain.setValueAtTime(0.5, ctx.currentTime + delay)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3)
        osc.start(ctx.currentTime + delay)
        osc.stop(ctx.currentTime + delay + 0.3)
      })
    } catch (_) {}
  }

  useEffect(() => {
    if (mode !== 'hari-ini') return

    const check = () => {
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()

      todos.forEach(todo => {
        if (!todo.time || todo.completed || notifiedRef.current.has(todo.id)) return

        const [h, m] = todo.time.split(':').map(Number)
        const todoMinutes = h * 60 + m
        const diff = todoMinutes - nowMinutes

        if (diff === 0) {
          notifiedRef.current.add(todo.id)
          const label = 'Sekarang waktunya!'

          playAlarm()

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⏰ ${todo.title}`, {
              body: label,
              icon: '/favicon.ico',
            })
          }
          show(`⏰ ${todo.title} — ${label}`)
        }
      })
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [todos, mode])

  useEffect(() => {
    function handleClickOutside(e) {
      if (timeWrapperRef.current && !timeWrapperRef.current.contains(e.target)) {
        setTimeFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  async function fetchTodos(date) {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    setTodos(data || [])
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    await supabase.from('todos').insert([{ title: newTitle.trim(), date: targetDate, time: newTime || null, completed: false }])
    setNewTitle('')
    setNewTime('')
    setAdding(false)
    fetchTodos(targetDate)
    show('Tugas berhasil ditambahkan!')
  }

  async function handleToggle(todo) {
    await supabase.from('todos').update({ completed: !todo.completed }).eq('id', todo.id)
    fetchTodos(targetDate)
  }

  async function handleDelete(id) {
    await supabase.from('todos').delete().eq('id', id)
    fetchTodos(targetDate)
    show('Tugas berhasil dihapus!')
  }

  const done = todos.filter(t => t.completed).length

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm font-medium text-slate-600">{formatDate(targetDate)}</p>
        </div>
        {mode === 'hari-ini' && notifPermission !== 'granted' && notifPermission !== 'denied' && 'Notification' in window && (
          <button
            onClick={requestNotifPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 active:bg-amber-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Aktifkan Reminder
          </button>
        )}
        {mode === 'hari-ini' && notifPermission === 'granted' && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Reminder aktif
          </span>
        )}
      </div>

      {todos.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-500">{done} / {todos.length} selesai</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${todos.length ? (done / todos.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <label className="block text-sm font-semibold text-slate-800 mb-3">
          {mode === 'hari-ini' ? 'Tambahkan Tugas Hari Ini' : 'Tambahkan Tugas Besok'}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={mode === 'hari-ini' ? 'Apa yang ingin dikerjakan hari ini?' : 'Apa yang ingin dikerjakan besok?'}
            className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
          <div className="flex gap-3">
            <label
              ref={timeWrapperRef}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer select-none transition-all min-h-[44px] ${timeFocused ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300'}`}
            >
              <span className="text-sm text-slate-900 font-medium whitespace-nowrap">Atur Jam</span>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                onFocus={() => setTimeFocused(true)}
                className="text-sm text-slate-700 focus:outline-none cursor-pointer w-auto min-h-[44px]"
              />
            </label>
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 min-h-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        {todos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>Belum ada tugas</p>
            <p className="text-sm text-slate-300 mt-1">Tambahkan tugas di atas</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center gap-4 px-5 py-4">
                <button
                  onClick={() => handleToggle(todo)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${todo.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 hover:border-blue-400'}`}
                >
                  {todo.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{todo.title}</span>
                  {todo.time && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-slate-400">{todo.time.slice(0, 5)}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(todo.id)} className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}

function Wishlist() {
  const [items, setItems] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newDate, setNewDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState('')
  const { toast, show } = useToast()

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('fetch error:', error.message, error.code, error.details, error.hint)
    setItems(data || [])
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    const { error } = await supabase.from('wishlists').insert([{
      title: newTitle.trim(),
      note: newNote.trim() || null,
      date: newDate || null,
      completed: false,
    }])
    if (error) console.error('insert error:', error.message, error.code, error.details, error.hint)
    setNewTitle('')
    setNewNote('')
    setNewDate('')
    setAdding(false)
    fetchItems()
    show('Wishlist berhasil ditambahkan!')
  }

  async function handleToggle(item) {
    await supabase.from('wishlists').update({ completed: !item.completed }).eq('id', item.id)
    fetchItems()
  }

  async function handleDelete(id) {
    await supabase.from('wishlists').delete().eq('id', id)
    fetchItems()
    show('Wishlist berhasil dihapus!')
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditNote(item.note || '')
    setEditDate(item.date || '')
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editTitle.trim()) return
    await supabase.from('wishlists').update({
      title: editTitle.trim(),
      note: editNote.trim() || null,
      date: editDate || null,
    }).eq('id', editingId)
    setEditingId(null)
    fetchItems()
    show('Wishlist berhasil diperbarui!')
  }

  const done = items.filter(i => i.completed).length

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Tercapai</span>
            <span className="text-sm text-slate-500">{done} / {items.length}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <label className="block text-sm font-semibold text-slate-800 mb-3">Tambahkan Wishlist</label>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Apa yang ingin kamu capai?"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
          <div className="flex gap-3 flex-col sm:flex-row sm:items-end">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Catatan (opsional)"
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
            <div className="flex flex-col gap-1 sm:w-44">
              <label className="text-xs font-medium text-slate-500">Tanggal Target <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full appearance-none px-3 py-2.5 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 min-h-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>Belum ada wishlist</p>
            <p className="text-sm text-slate-300 mt-1">Tambahkan impianmu di atas</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="px-5 py-4">
                {editingId === item.id ? (
                  <form onSubmit={handleEdit} className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Catatan (opsional)"
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-col gap-1 sm:w-40">
                        <label className="text-xs font-medium text-slate-500">Tanggal Target <span className="text-red-500">*</span></label>
                        <div className="relative">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          required
                          className="w-full appearance-none px-3 py-1.5 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">Batal</button>
                      <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggle(item)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 hover:border-blue-400'}`}
                    >
                      {item.completed && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.title}</span>
                      {item.note && <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>}
                      {item.date && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-blue-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          <span className="text-xs text-blue-500">{formatDate(item.date)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}
