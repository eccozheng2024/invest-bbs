import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const { email, password, applicationNote } = await req.json()

    // 基本验证
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码至少需要8位' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // 检查邮箱是否已存在
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 创建待审批用户
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        role: 'user',
        status: 'pending',
        applicationNote: applicationNote || '',
      },
    })

    return NextResponse.json({
      success: true,
      message: '申请已提交，请等待管理员审批',
      userId: user.id,
    })
  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json(
      { error: '申请处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}
