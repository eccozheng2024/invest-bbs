import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const auth = await payload.auth({ headers: req.headers })
    let user = auth.user as { id?: string; email?: string; status?: string } | null

    if (!user?.id) {
      const email = req.headers.get('x-user-email') || ''
      if (email) {
        const found = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
        })
        user = (found.docs[0] as any) || null
      }
    }

    if (!user?.id || user.status !== 'approved') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    if (!body?.postId || !body?.content) {
      return NextResponse.json({ error: 'postId/content required' }, { status: 400 })
    }

    const normalizedPostId: string | number = /^\d+$/.test(String(body.postId))
      ? Number(body.postId)
      : String(body.postId)

    const postExists = await payload.findByID({
      collection: 'posts',
      id: normalizedPostId,
      depth: 0,
      disableErrors: true,
    })

    if (!postExists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const doc = await payload.create({
      collection: 'comments',
      overrideAccess: true,
      data: {
        content: body.content,
        post: normalizedPostId,
        author: user?.id,
        parentComment: body.parentCommentId || undefined,
      },
    })

    return NextResponse.json({ success: true, id: doc.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || 'Create comment failed')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
