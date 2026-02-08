import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const contentType = req.headers.get('content-type') || ''
    let userId = ''
    let adminKey = ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      userId = body?.userId || ''
      adminKey = body?.adminKey || ''
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const raw = await req.text()
      const params = new URLSearchParams(raw)
      userId = params.get('userId') || ''
      adminKey = params.get('adminKey') || ''
    } else {
      const formData = await req.formData()
      userId = String(formData.get('userId') || '')
      adminKey = String(formData.get('adminKey') || '')
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const authResult = await payload.auth({ headers: req.headers })
    const allowByKey = Boolean(process.env.ADMIN_APPROVAL_KEY) && adminKey === process.env.ADMIN_APPROVAL_KEY
    if ((!authResult.user || (authResult.user as { role?: string }).role !== 'admin') && !allowByKey) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const normalizedId: string | number = /^\d+$/.test(userId) ? Number(userId) : userId

    await payload.update({
      collection: 'users',
      id: normalizedId,
      data: { status: 'rejected' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Reject failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
