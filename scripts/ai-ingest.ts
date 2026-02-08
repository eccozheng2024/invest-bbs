/* eslint-disable no-console */

type GNewsResp = {
  articles?: Array<{
    title?: string
    description?: string
    url?: string
    publishedAt?: string
    content?: string
  }>
}

async function fetchNews(): Promise<GNewsResp['articles']> {
  const key = process.env.GNEWS_API_KEY
  if (!key) {
    return [
      {
        title: 'AI行业示例快讯：上市公司发布AI产品进展',
        description: '这是本地运行模式下的示例新闻，用于验证自动发帖与去重流程。',
        url: 'local://sample-ai-news-1',
        publishedAt: new Date().toISOString(),
      },
    ]
  }
  const q = encodeURIComponent('(AI OR 人工智能) AND (company OR 上市公司 OR stock)')
  const url = `https://gnews.io/api/v4/search?q=${q}&lang=zh,en&max=10&apikey=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`gnews failed: ${res.status}`)
  const data = (await res.json()) as GNewsResp
  return data.articles || []
}

async function summarize(title: string, description: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return `${title}\n\n${description}`

  const resp = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: `Summarize this investment news into 3 concise Chinese bullet points:\nTitle: ${title}\nDescription: ${description}`,
    }),
  })

  if (!resp.ok) return `${title}\n\n${description}`
  const json = (await resp.json()) as { output_text?: string }
  return json.output_text || `${title}\n\n${description}`
}

async function run() {
  console.log('fetched: start')
  let getPayloadFn: any = null
  let payloadConfig: any = null
  try {
    const mod = await import('payload')
    getPayloadFn = mod.getPayload
    const cfg = await import('../src/payload.config')
    payloadConfig = cfg.default
  } catch {
    getPayloadFn = null
  }

  const hasDb = Boolean(process.env.DATABASE_URI)
  const articles = (await fetchNews()) || []
  console.log(`fetched: ${articles.length}`)

  if (!getPayloadFn || !hasDb) {
    console.log('filtered: skipped (no db runtime)')
    console.log('summarized: skipped (no db runtime)')
    console.log('published: 0')
    console.log('done: published=0')
    return
  }

  const payload = await getPayloadFn({ config: payloadConfig })

  let published = 0
  for (const item of articles) {
    const title = item.title?.trim()
    const url = item.url?.trim()
    if (!title || !url) continue

    const existing = await payload.find({
      collection: 'posts',
      where: { originalUrl: { equals: url } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`deduplicated: ${url}`)
      continue
    }

    console.log('filtered: pass')
    const summary = await summarize(title, item.description || '')
    console.log('summarized: ok')

    await payload.create({
      collection: 'posts',
      data: {
        title,
        content: summary,
        source: 'ai-ingest',
        originalUrl: url,
      },
      overrideAccess: true,
    })
    published += 1
    console.log('published: 1')
  }

  console.log(`done: published=${published}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
