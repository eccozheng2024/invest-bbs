import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const ALLOWED = new Set([
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
])

const MAX = 50 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: '文件类型不允许' }, { status: 400 })
    if (file.size > MAX) return NextResponse.json({ error: '文件超过50MB限制' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const outDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(outDir, { recursive: true })
    const outputName = `${Date.now()}_${safeName}`
    const output = path.join(outDir, outputName)
    await fs.writeFile(output, buffer)
    return NextResponse.json({ success: true, url: `/uploads/${outputName}` })
  } catch {
    return NextResponse.json({ error: 'upload failed' }, { status: 500 })
  }
}
