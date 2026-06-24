import { expect, test } from '@playwright/test'

import { addFirstProductToCart, addSameConfigTwice } from './helpers'

test.describe('Feature: Cart — empty state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart')
  })

  test('Given an empty cart, When opening it, Then only "Continue shopping" is offered', async ({
    page,
  }) => {
    await expect(page.getByRole('link', { name: /continue shopping/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^pay$/i })).toHaveCount(0)
  })

  test('Given an empty cart, When clicking "Continue shopping", Then it navigates home', async ({
    page,
  }) => {
    await page.getByRole('link', { name: /continue shopping/i }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Feature: Cart — with items', () => {
  test.beforeEach(async ({ page }) => {
    await addFirstProductToCart(page)
  })

  test('Given an added product, When viewing the cart, Then its row and config are shown', async ({
    page,
  }) => {
    const item = page.getByRole('listitem').first()
    await expect(item).toBeVisible()
    await expect(item.getByText(/\d+(\.\d+)?\sEUR/).first()).toBeVisible()
    await expect(item.getByText(/\|/).first()).toBeVisible()
  })

  test('Given a non-empty cart, When viewing the footer, Then total, Pay and Continue are visible', async ({
    page,
  }) => {
    const footer = page.locator('footer')
    await expect(footer.getByText(/^total$/i)).toBeVisible()
    await expect(footer.getByText(/\d+(\.\d+)?\sEUR/)).toBeVisible()
    await expect(page.getByRole('button', { name: /^pay$/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /continue shopping/i })).toBeVisible()
  })

  test('Given an item in the cart, When removing it, Then the cart becomes empty', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /remove .+ from cart/i }).click()

    await expect(page.getByRole('listitem')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^pay$/i })).toHaveCount(0)
  })

  test('Given an item in the cart, When reloading the page, Then it persists via localStorage', async ({
    page,
  }) => {
    await expect(page.getByRole('link', { name: /^cart,\s1\sitem$/i })).toBeVisible()

    await page.reload()

    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByRole('link', { name: /^cart,\s1\sitem$/i })).toBeVisible()
  })
})

test.describe('Feature: Cart — duplicate lines', () => {
  test('Given the same product config is added twice, When viewing the cart, Then two lines are shown', async ({
    page,
  }) => {
    await addSameConfigTwice(page)

    await expect(page.getByRole('link', { name: /^cart,\s2\sitems$/i })).toBeVisible()
    await expect(page.getByRole('listitem')).toHaveCount(2)
  })

  test('Given two identical lines, When removing one, Then one line remains', async ({ page }) => {
    await addSameConfigTwice(page)

    await page
      .getByRole('button', { name: /remove .+ from cart/i })
      .first()
      .click()

    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByRole('link', { name: /^cart,\s1\sitem$/i })).toBeVisible()
  })

  test('Given two identical lines, When reloading, Then both persist', async ({ page }) => {
    await addSameConfigTwice(page)

    await page.reload()

    await expect(page.getByRole('listitem')).toHaveCount(2)
    await expect(page.getByRole('link', { name: /^cart,\s2\sitems$/i })).toBeVisible()
  })

  test('Given two identical lines, When viewing the footer, Then the total doubles', async ({
    page,
  }) => {
    await addSameConfigTwice(page)

    const unitPriceText = await page
      .getByRole('listitem')
      .first()
      .getByText(/\d+(\.\d+)?\sEUR/)
      .textContent()
    const unitPrice = Number.parseFloat(unitPriceText?.replace(/[^\d.]/g, '') ?? '0')

    const totalText = await page
      .locator('footer')
      .getByText(/\d+(\.\d+)?\sEUR/)
      .textContent()
    const total = Number.parseFloat(totalText?.replace(/[^\d.]/g, '') ?? '0')

    expect(total).toBeCloseTo(unitPrice * 2, 2)
  })
})

test.describe('Feature: Header navigation', () => {
  test('Given any page, When clicking the logo, Then it navigates home', async ({ page }) => {
    await page.goto('/cart')
    await page.getByRole('link', { name: 'Zara' }).click()
    await expect(page).toHaveURL('/')
  })

  test('Given the home page, When clicking the cart icon, Then it navigates to the cart', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /^cart$/i }).click()
    await expect(page).toHaveURL('/cart')
  })
})
