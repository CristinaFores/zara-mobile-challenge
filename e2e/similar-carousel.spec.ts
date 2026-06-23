import { expect, test } from '@playwright/test'

import { openFirstProductDetail } from './helpers'

test.describe('Feature: Similar products carousel', () => {
  test('Given the detail page, When dragging the carousel and then clicking a card, Then it scrolls without navigating and opens the product', async ({
    page,
  }) => {
    await openFirstProductDetail(page)

    const scroller = page.locator('[data-carousel-progress]').first()
    await scroller.scrollIntoViewIfNeeded()
    await expect(scroller).toBeVisible()
    expect(await scroller.locator('[class*="product-card"]').count()).toBeGreaterThan(1)

    const startUrl = page.url()
    const track = scroller.locator('ul')
    const startProgress = Number(await scroller.getAttribute('data-carousel-progress'))
    const startTransform = await track.evaluate((element) => getComputedStyle(element).transform)
    const box = await scroller.boundingBox()
    expect(box).not.toBeNull()

    if (!box) {
      throw new Error('Missing similar products carousel box.')
    }

    const y = box.y + box.height * 0.48
    await page.mouse.move(box.x + box.width * 0.82, y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.62, y, { steps: 4 })
    await page.mouse.move(box.x + box.width * 0.42, y, { steps: 4 })
    await page.mouse.move(box.x + box.width * 0.22, y, { steps: 4 })
    await page.mouse.up()

    await expect
      .poll(async () => Number(await scroller.getAttribute('data-carousel-progress')))
      .toBeGreaterThan(startProgress + 0.5)
    const draggedTransform = await track.evaluate((element) => getComputedStyle(element).transform)
    expect(draggedTransform).not.toBe(startTransform)
    await expect(page).toHaveURL(startUrl)

    const target = await scroller.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const [visibleLink] = Array.from(
        element.querySelectorAll<HTMLAnchorElement>('a[href^="/products/"]')
      )
        .map((link) => {
          const linkRect = link.getBoundingClientRect()
          const visibleLeft = Math.max(linkRect.left, rect.left)
          const visibleRight = Math.min(linkRect.right, rect.right)
          const visibleTop = Math.max(linkRect.top, rect.top)
          const visibleBottom = Math.min(linkRect.bottom, rect.bottom)
          const visibleWidth = Math.max(0, visibleRight - visibleLeft)
          const visibleHeight = Math.max(0, visibleBottom - visibleTop)

          return {
            href: link.getAttribute('href'),
            visibleArea: visibleWidth * visibleHeight,
            x: visibleLeft + visibleWidth / 2,
            y: visibleTop + visibleHeight / 2,
          }
        })
        .filter((entry) => entry.href !== null && entry.visibleArea > 1600)
        .sort((a, b) => b.visibleArea - a.visibleArea)

      return visibleLink ?? null
    })

    if (target === null) {
      throw new Error('No clickable carousel product link found after dragging.')
    }

    await page.mouse.click(target.x, target.y)
    await expect(page).toHaveURL(new RegExp(`${target.href}$`))

    await page.getByRole('button', { name: /^back$/i }).click()
    await expect(page).toHaveURL(startUrl)
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(120)
  })
})
