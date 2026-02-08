'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { FileUpload } from '@/components/FileUpload'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(email ? { 'x-user-email': email } : {}),
        },
        body: JSON.stringify({ title, content, attachmentUrls }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '发帖失败')
      router.push(`/post/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发帖失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <h1>发布新帖</h1>
      {error ? <p style={{ color: '#c00' }}>{error}</p> : null}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="已审批用户邮箱" required />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="正文" required />
        <div>
          <div>附件（可选）</div>
          <FileUpload onUploaded={(url) => setAttachmentUrls((prev) => [...prev, url])} />
          {attachmentUrls.length > 0 ? (
            <ul>
              {attachmentUrls.map((url) => (
                <li key={url}>{url}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <button disabled={loading} type="submit">{loading ? '提交中...' : '发布'}</button>
      </form>
    </main>
  )
}
