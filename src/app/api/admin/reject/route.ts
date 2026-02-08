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

    await payload.update({
      collection: 'users',
      id: userId,
      data: { status: 'rejected' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Reject failed' }, { status: 500 })
  }
}
