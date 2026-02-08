'use client'

import { ChangeEvent, useState } from 'react'

const ALLOWED = [
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
]

const MAX = 50 * 1024 * 1024

export function FileUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) {
      return
    }
    if (!ALLOWED.includes(file.type)) {
      setError('文件类型不允许')
      return
    }
    if (file.size > MAX) {
      setError('文件超过50MB限制')
      return
    }
    setError('')
    setLoading(true)

    const form = new FormData()
    form.append('file', file)
    fetch('/api/upload', { method: 'POST', body: form })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || '上传失败')
        onUploaded(data.url)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '上传失败')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <input type="file" onChange={onChange} />
      {loading ? <p>上传中...</p> : null}
      {error ? <p style={{ color: '#c00' }}>{error}</p> : null}
    </div>
  )
}
