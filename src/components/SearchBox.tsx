'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function SearchBox() {
  const router = useRouter()
  const [q, setQ] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const value = q.trim()
    if (!value) return
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索标题或正文"
        style={{ padding: '6px 8px', border: '1px solid #ccc', minWidth: 220 }}
      />
      <button type="submit">搜索</button>
    </form>
  )
}
