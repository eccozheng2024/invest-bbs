type CommentItem = {
  id: string
  content: string
  createdAt?: string
  author?: { email?: string } | string
  parentComment?: string | null
}

export function CommentList({ comments }: { comments: CommentItem[] }) {
  const roots = comments.filter((c) => !c.parentComment)
  const childrenMap = new Map<string, CommentItem[]>()

  for (const c of comments) {
    if (!c.parentComment) continue
    const list = childrenMap.get(String(c.parentComment)) || []
    list.push(c)
    childrenMap.set(String(c.parentComment), list)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {roots.map((root) => {
        const replies = childrenMap.get(root.id) || []
        return (
          <article key={root.id} style={{ border: '1px solid #ddd', padding: 10 }}>
            <div style={{ fontSize: 12, color: '#666' }}>
              {typeof root.author === 'string' ? root.author : root.author?.email || '匿名'}
            </div>
            <div>{root.content}</div>
            {replies.length > 0 && (
              <div style={{ marginTop: 8, marginLeft: 18, display: 'grid', gap: 8 }}>
                {replies.slice(0, 20).map((reply) => (
                  <div key={reply.id} style={{ borderLeft: '3px solid #ddd', paddingLeft: 8 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {typeof reply.author === 'string' ? reply.author : reply.author?.email || '匿名'}
                    </div>
                    <div>{reply.content}</div>
                  </div>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
