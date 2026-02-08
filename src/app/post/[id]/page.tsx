import { getPayload } from 'payload'
import config from '@/payload.config'
import { CommentList } from '@/components/CommentList'
import { CommentComposer } from '@/components/CommentComposer'

export const dynamic = 'force-dynamic'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const post = await payload.findByID({ collection: 'posts', id, depth: 2 })
  const commentsResult = await payload.find({
    collection: 'comments',
    where: { post: { equals: id } },
    depth: 1,
    limit: 200,
    sort: 'createdAt',
  })

  return (
    <main style={{ maxWidth: 980, margin: '20px auto', padding: 16 }}>
      <h1>{post.title}</h1>
      <p style={{ color: '#666' }}>
        作者: {typeof post.author === 'object' ? post.author?.email : post.author} | 时间:{' '}
        {new Date(post.createdAt).toLocaleString('zh-CN')}
      </p>

      <section style={{ border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(post.content, null, 2)}</pre>
      </section>

      {Array.isArray((post as any).attachmentUrls) && (post as any).attachmentUrls.length > 0 ? (
        <section style={{ marginTop: 12 }}>
          <h3>附件</h3>
          <ul>
            {(post as any).attachmentUrls.map((item: any) => {
              const url = typeof item === 'string' ? item : item?.url
              if (!url) return null
              return (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <h2 style={{ marginTop: 18 }}>评论</h2>
      <CommentComposer postId={id} />
      <CommentList comments={commentsResult.docs as never[]} />
    </main>
  )
}
