import Link from 'next/link'

export default function AdminPage() {
  return (
    <main style={{ maxWidth: 760, margin: '20px auto', padding: 16 }}>
      <h1>管理员中心</h1>
      <ul>
        <li><Link href="/admin/approve">用户审批</Link></li>
        <li><Link href="/admin/login">管理员登录</Link></li>
      </ul>
    </main>
  )
}
