import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

type Article = {
  title: string
  description: string
  url: string
}

async function getArticles(seed?: string): Promise<Article[]> {
  const key = process.env.GNEWS_API_KEY
  if (!key) {
    const suffix = seed || 'sample-ai-news-1'
    return [
      {
        title: 'AI行业示例快讯：上市公司发布AI产品进展',
        description: '本地模式示例新闻，用于验证自动发帖链路。',
        url: `local://${suffix}`,
      },
    ]
  }

  const q = encodeURIComponent('(AI OR 人工智能) AND (company OR 上市公司 OR stock)')
  const endpoint = `https://gnews.io/api/v4/search?q=${q}&lang=zh,en&max=10&apikey=${key}`
  const res = await fetch(endpoint)
  if (!res.ok) return []
  const data = (await res.json()) as { articles?: Array<{ title?: string; description?: string; url?: string }> }
  return (data.articles || [])
    .filter((a) => a.title && a.url)
    .map((a) => ({ title: a.title as string, description: a.description || '', url: a.url as string }))
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const seed = req.nextUrl.searchParams.get('seed') || undefined
    const articles = await getArticles(seed)
    let published = 0

    for (const article of articles) {
      const exists = await payload.find({
        collection: 'posts',
        where: { originalUrl: { equals: article.url } },
        limit: 1,
      })
      if (exists.docs.length > 0) continue

      await payload.create({
        collection: 'posts',
        data: {
          title: article.title,
          content: article.description,
          source: 'ai-ingest',
          originalUrl: article.url,
        },
        overrideAccess: true,
      })
      published += 1
    }

    return NextResponse.json({ success: true, published, fetched: articles.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ingest failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
