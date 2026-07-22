'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function TodoPage() {
  const [tab, setTab] = useState('besok')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">To-Do</h1>
        <p className="text-sm text-slate-500 mt-1">Rencanakan dan catat impianmu</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('besok')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'besok'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          To-Do Besok
        </button>
        <button
          onClick={() => setTab('wishlist')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'wishlist'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Wishlist
        </button>
      </div>

      {tab === 'besok' ? <TodoBesok /> : <Wishlist />}
    </div>
  )
}

function TodoBesok() {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const timeInputRef = useRef(null)
  const timeWrapperRef = useRef(null)
  const [timeFocused, setTimeFocused] = useState(false)
  const [adding, setAdding] = useState(false)
  const [tomorrow, setTomorrow] = useState('')

  useEffect(() => {
    const t = new Date()
    t.setDate(t.getDate() + 1)
    const tomorrowStr = t.toISOString().split('T')[0]
    setTomorrow(tomorrowStr)
    fetchTodos(tomorrowStr)
  }, [])

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
    await supabase.from('todos').insert([{ title: newTitle.trim(), date: tomorrow, time: newTime || null, completed: false }])
    setNewTitle('')
    setNewTime('')
    setAdding(false)
    fetchTodos(tomorrow)
  }

  async function handleToggle(todo) {
    await supabase.from('todos').update({ completed: !todo.completed }).eq('id', todo.id)
    fetchTodos(tomorrow)
  }

  async function handleDelete(id) {
    await supabase.from('todos').delete().eq('id', id)
    fetchTodos(tomorrow)
  }

  const done = todos.filter(t => t.completed).length

  const formatTomorrow = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">{formatTomorrow(tomorrow)}</p>

      {todos.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-500">{done} / {todos.length} selesai</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${todos.length ? (done / todos.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
        <label className="block text-sm font-semibold text-slate-800 mb-3">Tambahkan Tugas</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Apa yang ingin dikerjakan besok?"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            <div
              ref={timeWrapperRef}
              onClick={() => { timeInputRef.current?.showPicker(); setTimeFocused(true) }}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer select-none transition-all ${
                timeFocused ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300'
              }`}
            >
              <span className="text-sm text-slate-900 font-medium whitespace-nowrap">Atur Jam</span>
              <input
                ref={timeInputRef}
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                onFocus={() => setTimeFocused(true)}
                className="text-sm text-slate-700 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
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
            <p>Belum ada tugas untuk besok</p>
            <p className="text-sm text-slate-300 mt-1">Tambahkan tugas di atas</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center gap-4 px-5 py-4">
                <button
                  onClick={() => handleToggle(todo)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    todo.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {todo.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {todo.title}
                  </span>
                  {todo.time && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-slate-400">{todo.time.slice(0, 5)}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Wishlist() {
  const [items, setItems] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    const { data } = await supabase
      .from('wishlists')
      .select('*')
      .order('created_at', { ascending: false })
    setItems(data || [])
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    await supabase.from('wishlists').insert([{ title: newTitle.trim(), note: newNote.trim() || null, completed: false }])
    setNewTitle('')
    setNewNote('')
    setAdding(false)
    fetchItems()
  }

  async function handleToggle(item) {
    await supabase.from('wishlists').update({ completed: !item.completed }).eq('id', item.id)
    fetchItems()
  }

  async function handleDelete(id) {
    await supabase.from('wishlists').delete().eq('id', id)
    fetchItems()
  }

  const done = items.filter(i => i.completed).length

  return (
    <div>
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Tercapai</span>
            <span className="text-sm text-slate-500">{done} / {items.length}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
            />
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Catatan (opsional)"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
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
              <li key={item.id} className="flex items-start gap-4 px-5 py-4">
                <button
                  onClick={() => handleToggle(item)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {item.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {item.title}
                  </span>
                  {item.note && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
