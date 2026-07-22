'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function CategoryInput({ value, onChange, placeholder = 'Ketik kategori' }) {
  const [input, setInput] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [allCategories, setAllCategories] = useState([])
  const wrapperRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setInput(value || '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchCategories() {
    const { data } = await supabase
      .from('activities')
      .select('category')
    if (data) {
      const unique = [...new Set(data.map(d => d.category))].sort()
      setAllCategories(unique)
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)
    onChange(val)

    if (val.trim()) {
      const filtered = allCategories.filter(c =>
        c.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setSuggestions(allCategories)
      setShowDropdown(allCategories.length > 0)
    }
  }

  const handleFocus = () => {
    fetchCategories()
    if (input.trim()) {
      const filtered = allCategories.filter(c =>
        c.toLowerCase().includes(input.toLowerCase())
      )
      setSuggestions(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setSuggestions(allCategories)
      setShowDropdown(allCategories.length > 0)
    }
  }

  const handleSelect = (category) => {
    setInput(category)
    onChange(category)
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={handleFocus}
        required
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((cat) => (
            <li
              key={cat}
              onClick={() => handleSelect(cat)}
              className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
