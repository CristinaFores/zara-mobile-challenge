import { expect, test } from '@playwright/test'

import { PRODUCT_CARD } from './helpers'

test.describe('Feature: Product listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Given the home page, When it loads, Then the product grid is rendered', async ({
    page,
  }) => {
    await expect(page.locator(PRODUCT_CARD).first()).toBeVisible()
  })

  test('Given a product card, When inspecting it, Then it exposes brand, name and price', async ({
    page,
  }) => {
    const firstCard = page.locator(PRODUCT_CARD).first()
    await expect(firstCard).toBeVisible()

    const label = await firstCard.getAttribute('aria-label')
    expect(label).toMatch(/.+,\s\d+(\.\d+)?\sEUR$/)
  })

  test('Given a search term, When typing it, Then only matching products remain', async ({
    page,
  }) => {
    await page.getByRole('searchbox').fill('Samsung')

    await expect(page.locator(`${PRODUCT_CARD}[aria-label*="Samsung"]`).first()).toBeVisible()
    await expect(page.locator(`${PRODUCT_CARD}:not([aria-label*="Samsung"])`)).toHaveCount(0)
  })

  test('Given a query with no matches, When typing it, Then the grid becomes empty', async ({
    page,
  }) => {
    await page.getByRole('searchbox').fill('zzzznonexistentphone')

    await expect(page.locator(PRODUCT_CARD)).toHaveCount(0)
    await expect(page.getByText(/^0 results$/)).toBeVisible()
    await expect(page.getByText('No smartphones match your search.')).toBeVisible()
  })

  test('Given an active search, When clearing it, Then the full grid is restored', async ({
    page,
  }) => {
    const cards = page.locator(PRODUCT_CARD)
    const initialCount = await cards.count()

    await page.getByRole('searchbox').fill('Samsung')
    await expect(page.locator(`${PRODUCT_CARD}:not([aria-label*="Samsung"])`)).toHaveCount(0)

    await page.getByRole('button', { name: /clear search/i }).click()
    await expect(cards).toHaveCount(initialCount)
  })

  test('Given a product card, When clicking it, Then it navigates to the detail page', async ({
    page,
  }) => {
    const firstCard = page.locator(PRODUCT_CARD).first()
    const href = await firstCard.getAttribute('href')

    await firstCard.click()
    await expect(page).toHaveURL(href!)
  })
})
