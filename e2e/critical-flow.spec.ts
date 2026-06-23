import { expect, test } from '@playwright/test'

import { PRODUCT_CARD } from './helpers'

test.describe('Feature: Critical flow — listing to cart total', () => {
  test('Given a search in listing, When selecting configuration and adding to cart, Then cart shows item and matching total', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('searchbox').fill('Samsung')
    await expect(page).toHaveURL(/\/\?search=Samsung/)
    const filteredCard = page.locator(`${PRODUCT_CARD}[aria-label*="Samsung"]`).first()
    await expect(filteredCard).toBeVisible()

    await filteredCard.click()
    await expect(page).toHaveURL(/\/products\//)

    const addToCartButton = page.getByRole('button', { name: /add .+ to cart/i })
    await expect(addToCartButton).toBeDisabled()

    const storageButton = page
      .getByRole('group', { name: /storage/i })
      .getByRole('button')
      .first()
    const selectedStorage = (await storageButton.textContent())?.trim() ?? ''
    await storageButton.click()
    await expect(storageButton).toHaveAttribute('aria-pressed', 'true')

    const colorButton = page.getByRole('group', { name: /color/i }).getByRole('button').first()
    const selectedColorLabel = (await colorButton.getAttribute('aria-label')) ?? ''
    const selectedColor = selectedColorLabel.replace(/^Select color\s+/i, '').trim()
    await colorButton.click()
    await expect(colorButton).toHaveAttribute('aria-pressed', 'true')

    await expect(addToCartButton).toBeEnabled()

    const selectedDetailPrice = (
      await page
        .getByText(/^\d+(\.\d+)?\sEUR$/)
        .first()
        .innerText()
    ).trim()

    await addToCartButton.click()
    await expect(page).toHaveURL('/cart')

    const cartItem = page.getByRole('listitem').first()
    await expect(cartItem).toContainText(selectedStorage)
    await expect(cartItem).toContainText(selectedColor)
    await expect(cartItem).toContainText(selectedDetailPrice)

    const cartFooter = page.locator('footer')
    await expect(cartFooter.getByText(selectedDetailPrice, { exact: true })).toBeVisible()
  })
})
