import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

type Article = {
  title: string
  description: string
  url: string
}

function decodeXml(text: string) {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function parseRss(xml: string): Article[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
  return items
    .map((item) => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''
      const desc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || ''
      return {
        title: decodeXml(title).trim(),
        description: decodeXml(desc).trim(),
        url: decodeXml(link).trim(),
      }
    })
    .filter((a) => a.title && a.url)
}

async function getArticles(seed?: string): Promise<Article[]> {
  const key = process.env.GNEWS_API_KEY
  if (!key) {
    const queries = [
      'AI 上市公司',
      'artificial intelligence listed company',
      'NVIDIA OpenAI Microsoft AI',
    ]
    const results: Article[] = []
    for (const q of queries) {
      const endpoint = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`
      try {
        const res = await fetch(endpoint, { next: { revalidate: 0 } })
        if (!res.ok) continue
        const xml = await res.text()
        results.push(...parseRss(xml))
      } catch {
        // ignore one source failure
      }
    }

    if (results.length === 0) {
      const suffix = seed || String(Date.now())
      return [
        {
          title: 'AI行业示例快讯：上市公司发布AI产品进展',
          description: '无Key模式下的回退示例新闻，用于验证自动发帖链路。',
          url: `local://${suffix}`,
        },
      ]
    }

    const map = new Map<string, Article>()
    for (const r of results) {
      if (!map.has(r.url)) map.set(r.url, r)
    }
    return Array.from(map.values()).slice(0, 20)
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

async function handleIngest(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isVercelCronUA = (req.headers.get('user-agent') || '').toLowerCase().includes('vercel-cron')

    if (cronSecret) {
      const token = authHeader.replace(/^Bearer\s+/i, '')
      if (token !== cronSecret) {
        return NextResponse.json({ success: false, error: 'Unauthorized cron request' }, { status: 401 })
      }
    } else if (req.method === 'GET' && !isVercelCronUA) {
      return NextResponse.json({ success: false, error: 'Only Vercel cron GET is allowed without CRON_SECRET' }, { status: 401 })
    }

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

export async function POST(req: NextRequest) {
  return handleIngest(req)
}

export async function GET(req: NextRequest) {
  return handleIngest(req)
}
