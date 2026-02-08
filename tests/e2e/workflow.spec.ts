import { expect, test } from '@playwright/test'

test('apply -> approve -> post workflow', async ({ page }) => {
  const email = `user_${Date.now()}@example.com`
  const password = 'Password123!'
  const title = `E2E Post ${Date.now()}`

  await page.goto('/apply')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#applicationNote', 'E2E application')
  await page.getByRole('button', { name: '提交申请' }).click()
  await expect(page.getByText('申请已提交')).toBeVisible()

  await page.goto('/admin/approve')
  await expect(page.getByText(email)).toBeVisible()
  const row = page.locator('tr').filter({ hasText: email }).first()
  const userId = await row.locator('input[name="userId"]').first().getAttribute('value')
  expect(userId).toBeTruthy()
  const approve = await page.request.post('/api/admin/approve', {
    data: { userId, adminKey: 'change-me-in-production' },
  })
  expect(approve.ok()).toBeTruthy()

  await page.goto('/new')
  await page.getByPlaceholder('已审批用户邮箱').fill(email)
  await page.getByPlaceholder('标题').fill(title)
  await page.getByPlaceholder('正文').fill('workflow content')
  await page.getByRole('button', { name: '发布' }).click()

  await expect(page).toHaveURL(/\/post\//)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(title)

})
