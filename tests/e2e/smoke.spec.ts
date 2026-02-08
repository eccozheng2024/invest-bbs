import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/InvestBBS/)
    await expect(page.locator('h1')).toContainText('InvestBBS')
  })

  test('apply page loads', async ({ page }) => {
    await page.goto('/apply')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toContainText('申请加入 InvestBBS')
  })
})
