import Link from 'next/link'

export default function AdminLoginPage() {
  return (
    <main style={{ maxWidth: 760, margin: '20px auto', padding: 16 }}>
      <h1>管理员登录</h1>
      <p>请使用 Payload 内置认证会话访问管理功能。</p>
      <p>当前版本使用 API 访问控制进行管理员操作校验。</p>
      <Link href="/admin/approve">进入审批页</Link>
    </main>
  )
}
