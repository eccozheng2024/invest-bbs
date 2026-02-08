import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const auth = await payload.auth({ headers: req.headers })
    let user = auth.user as { id?: string; status?: string; email?: string } | null

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
    if (!body?.title || !body?.content) {
      return NextResponse.json({ error: 'title/content required' }, { status: 400 })
    }

    const doc = await payload.create({
      collection: 'posts',
      data: {
        title: body.title,
        content: body.content,
        author: user.id,
        source: 'user',
        attachmentUrls: Array.isArray(body.attachmentUrls)
          ? body.attachmentUrls
              .filter((x: unknown) => typeof x === 'string' && x.length > 0)
              .map((url: string) => ({ url }))
          : [],
      },
    })

    return NextResponse.json({ success: true, id: doc.id })
  } catch {
    return NextResponse.json({ error: 'Create post failed' }, { status: 500 })
  }
}
