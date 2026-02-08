'use client'

import { FormEvent, useState } from 'react'

export function CommentComposer({ postId }: { postId: string }) {
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(email ? { 'x-user-email': email } : {}),
      },
      body: JSON.stringify({ postId, content }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || '评论失败')
      return
    }
    setContent('')
    setMsg('评论已提交，刷新可见')
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
      <input
        placeholder="已审批用户邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <textarea
        placeholder="写下你的评论"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">发表评论</button>
      {msg ? <small>{msg}</small> : null}
    </form>
  )
}
