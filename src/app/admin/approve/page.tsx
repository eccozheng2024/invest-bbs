import { getPayload } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function AdminApprovePage() {
  const adminApprovalKey = process.env.ADMIN_APPROVAL_KEY || 'dev-approve-key'
  let pendingUsers: { docs: any[] } = { docs: [] }
  let dataWarning = ''
  try {
    const payload = await getPayload({ config })
    pendingUsers = await payload.find({
      collection: 'users',
      where: {
        status: {
          equals: 'pending',
        },
      },
    })
  } catch {
    dataWarning = '数据库未连接，审批列表不可用。'
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>待审批用户 ({pendingUsers.docs.length})</h1>
      {dataWarning ? <p style={{ color: '#a16b00' }}>{dataWarning}</p> : null}
      
      {pendingUsers.docs.length === 0 ? (
        <p>没有待审批的用户</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>邮箱</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>申请说明</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>申请时间</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.docs.map((user: any) => (
              <tr key={user.id}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{user.email}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{user.applicationNote || '-'}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <form action="/api/admin/approve" method="POST" style={{ display: 'inline' }}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="adminKey" value={adminApprovalKey} />
                    <button 
                      type="submit"
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      通过
                    </button>
                  </form>
                  <form action="/api/admin/reject" method="POST" style={{ display: 'inline', marginLeft: '0.5rem' }}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="adminKey" value={adminApprovalKey} />
                    <button 
                      type="submit"
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      拒绝
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
