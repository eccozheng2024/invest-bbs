import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() || ''
    if (!q) return NextResponse.json({ docs: [] })

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      limit: 30,
      where: {
        or: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      sort: '-createdAt',
    })

    return NextResponse.json({ docs: result.docs })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
