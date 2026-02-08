import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SearchBox } from '@/components/SearchBox'

export const dynamic = 'force-dynamic'

function highlight(text: string, q: string) {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return text.slice(0, 120)
  const start = Math.max(0, idx - 24)
  const end = Math.min(text.length, idx + q.length + 48)
  return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim()
  let docs: any[] = []
  let dataWarning = ''
  try {
    const payload = await getPayload({ config })
    docs = query
      ? (
          await payload.find({
            collection: 'posts',
            where: { or: [{ title: { contains: query } }, { content: { contains: query } }] },
            sort: '-createdAt',
            limit: 50,
          })
        ).docs
      : []
  } catch {
    dataWarning = '数据库未连接，搜索结果不可用。'
  }

  return (
    <main style={{ maxWidth: 980, margin: '20px auto', padding: 16 }}>
      <h1>搜索</h1>
      <SearchBox />
      {dataWarning ? <p style={{ color: '#a16b00' }}>{dataWarning}</p> : null}
      <p style={{ color: '#666' }}>关键词: {query || '（空）'} | 结果: {docs.length}</p>
      {docs.length === 0 ? (
        <p>没有匹配结果。</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {docs.map((post: any) => (
            <article key={post.id} style={{ border: '1px solid #ddd', padding: 10 }}>
              <Link href={`/post/${post.id}`}>{post.title}</Link>
              <div style={{ color: '#666', fontSize: 13 }}>{new Date(post.createdAt).toLocaleString('zh-CN')}</div>
              <div style={{ marginTop: 6 }}>{highlight(post.title || '', query)}</div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
