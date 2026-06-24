import { expect, type Page } from '@playwright/test'

export const PRODUCT_CARD = 'a[href^="/products/"]'

/**
 * Navigates home and opens the first product in the grid.
 * Returns the detail href so callers can assert against the real (API-driven) id
 * instead of hardcoding one.
 */
export async function openFirstProductDetail(page: Page): Promise<string> {
  await page.goto('/')
  const firstCard = page.locator(PRODUCT_CARD).first()
  await expect(firstCard).toBeVisible()

  const href = await firstCard.getAttribute('href')
  if (!href) throw new Error('First product card is missing an href')

  // Navigate directly so the detail tests are isolated from the card's
  // View Transition navigation (already covered by the listing spec).
  await page.goto(href)
  await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeVisible()

  return href
}

/**
 * Picks the first storage and color so "Add to cart" becomes enabled.
 * Selection lives in the URL, so there is no default — a configuration must be chosen.
 */
export async function selectFirstConfiguration(page: Page): Promise<void> {
  // Selections are written to the URL, so wait for each to commit (aria-pressed)
  // before the next click — two rapid router.replace calls would otherwise race
  // and the second would overwrite the first with stale search params.
  const storage = page
    .getByRole('group', { name: /storage/i })
    .getByRole('button')
    .first()
  await storage.click()
  await expect(storage).toHaveAttribute('aria-pressed', 'true')

  const color = page.getByRole('group', { name: /color/i }).getByRole('button').first()
  await color.click()
  await expect(color).toHaveAttribute('aria-pressed', 'true')

  await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeEnabled()
}

/**
 * Opens a product, configures it and adds it to the cart.
 * Adding redirects to /cart, so the page lands there on success.
 */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await openFirstProductDetail(page)
  await selectFirstConfiguration(page)
  await page.getByRole('button', { name: /add .+ to cart/i }).click()
  await expect(page).toHaveURL('/cart')
}

/**
 * Adds the same product configuration twice so the cart shows two separate lines.
 */
export async function addSameConfigTwice(page: Page): Promise<void> {
  await openFirstProductDetail(page)
  await selectFirstConfiguration(page)
  const configuredUrl = page.url()

  await page.getByRole('button', { name: /add .+ to cart/i }).click()
  await expect(page).toHaveURL('/cart')

  await page.goto(configuredUrl)
  await expect(page.getByRole('button', { name: /add .+ to cart/i })).toBeEnabled()
  await page.getByRole('button', { name: /add .+ to cart/i }).click()
  await expect(page).toHaveURL('/cart')
  await expect(page.getByRole('listitem')).toHaveCount(2)
}
