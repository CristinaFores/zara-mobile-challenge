import { expect, test } from '@playwright/test'

import { openFirstProductDetail, selectFirstConfiguration } from './helpers'

test.describe('Feature: Product detail', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstProductDetail(page)
  })

  test('Given a product, When the detail loads, Then heading and add-to-cart are present', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeVisible()
  })

  test('Given no configuration chosen, When the detail loads, Then add-to-cart is disabled', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeDisabled()
  })

  test('Given the detail page, When selecting a storage, Then its option becomes pressed', async ({
    page,
  }) => {
    const storage = page
      .getByRole('group', { name: /storage/i })
      .getByRole('button')
      .first()
    await storage.click()
    await expect(storage).toHaveAttribute('aria-pressed', 'true')
  })

  test('Given a storage selection, When chosen, Then the price drops the "From" prefix', async ({
    page,
  }) => {
    await expect(page.getByText(/^From\s\d/).first()).toBeVisible()

    await page
      .getByRole('group', { name: /storage/i })
      .getByRole('button')
      .first()
      .click()

    await expect(page.getByText(/^\d+(\.\d+)?\sEUR$/).first()).toBeVisible()
  })

  test('Given the detail page, When selecting a color, Then its swatch becomes pressed', async ({
    page,
  }) => {
    const color = page.getByRole('group', { name: /color/i }).getByRole('button').first()
    await color.click()
    await expect(color).toHaveAttribute('aria-pressed', 'true')
  })

  test('Given color and storage selected, When both chosen, Then add-to-cart is enabled', async ({
    page,
  }) => {
    await selectFirstConfiguration(page)
    await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeEnabled()
  })

  test('Given two quick selections, When chosen back-to-back, Then neither overwrites the other', async ({
    page,
  }) => {
    const storage = page
      .getByRole('group', { name: /storage/i })
      .getByRole('button')
      .first()
    const color = page.getByRole('group', { name: /color/i }).getByRole('button').first()

    await storage.click()
    await color.click()

    await expect(storage).toHaveAttribute('aria-pressed', 'true')
    await expect(color).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeEnabled()
  })

  test('Given a configured product, When adding to cart, Then it redirects to the cart', async ({
    page,
  }) => {
    await selectFirstConfiguration(page)
    await page.getByRole('button', { name: /add .+ to cart/i }).click()

    await expect(page).toHaveURL('/cart')
    await expect(page.getByRole('link', { name: /^cart,/i })).toBeVisible()
  })

  test('Given the detail page, When clicking the back control, Then it returns to the previous page', async ({
    page,
  }) => {
    await page
      .getByRole('navigation', { name: /breadcrumb/i })
      .getByRole('button')
      .click()
    await expect(page).toHaveURL('/')
  })
})
