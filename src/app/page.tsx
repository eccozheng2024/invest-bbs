import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SearchBox } from '@/components/SearchBox'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let docs: any[] = []
  let dataWarning = ''
  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      sort: '-createdAt',
      limit: 50,
      depth: 1,
    })
    docs = posts.docs as any[]
  } catch {
    dataWarning = '数据库未连接，当前仅显示静态界面。'
  }

  return (
    <main style={{ maxWidth: 1080, margin: '20px auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>InvestBBS</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/apply">申请加入</Link>
          <Link href="/new">发布新帖</Link>
          <Link href="/admin">管理后台</Link>
        </div>
      </header>

      <div style={{ margin: '10px 0 14px' }}>
        <SearchBox />
      </div>
      {dataWarning ? <p style={{ color: '#a16b00' }}>{dataWarning}</p> : null}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>主题</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px', width: 220 }}>作者</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px', width: 210 }}>时间</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((post: any) => (
            <tr key={post.id}>
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px' }}>
                <Link href={`/post/${post.id}`}>{post.title}</Link>
              </td>
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', color: '#555' }}>
                {typeof post.author === 'object' ? post.author?.email : post.author}
              </td>
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 6px', color: '#666' }}>
                {new Date(post.createdAt).toLocaleString('zh-CN')}
              </td>
            </tr>
          ))}
          {docs.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: 16, color: '#666' }}>暂无帖子</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}
