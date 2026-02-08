'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    applicationNote: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '申请失败')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '申请失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1>申请已提交</h1>
        <p style={{ color: 'green' }}>✓ 您的申请已成功提交，请等待管理员审批。</p>
        <p>3秒后自动跳转到首页...</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem' }}>
      <h1>申请加入 InvestBBS</h1>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="applicationNote">申请说明</label>
          <textarea
            id="applicationNote"
            rows={4}
            value={formData.applicationNote}
            onChange={(e) => setFormData({ ...formData, applicationNote: e.target.value })}
            placeholder="请简要说明您为什么想加入..."
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '提交中...' : '提交申请'}
        </button>
      </form>
    </main>
  )
}
