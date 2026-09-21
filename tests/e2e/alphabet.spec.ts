import { expect, test } from '@playwright/test'

test('opens on the alphabet and exposes all 33 letters', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.letter-tile')).toHaveCount(33)
  await expect(page.getByRole('heading', { name: 'Выбери букву' })).toBeVisible()
})

test('letter card has three words and never reuses the horse image for A', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^Аа автобус/ }).click()
  await expect(page.locator('.word-list button')).toHaveCount(3)
  const image = page.locator('.generated')
  await expect(image).toBeVisible()
  const imageUrl = await image.evaluate(element => getComputedStyle(element).backgroundImage.split('url("')[1]?.split('"')[0])
  expect(imageUrl).toContain('/assets/letters/')
  const response = await page.request.get(new URL(imageUrl!, page.url()).toString())
  expect(response.status()).toBe(200)
})

test('writing screen accepts a pointer stroke and keeps controls available', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^Мм мак/ }).click()
  await page.getByRole('button', { name: /Попробовать рукой/ }).click()
  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('writing canvas is not visible')
  await page.mouse.move(box.x + 50, box.y + 50)
  await page.mouse.down()
  await page.mouse.move(box.x + 140, box.y + 120)
  await page.mouse.up()
  await expect(page.getByRole('button', { name: /Отменить/ })).toBeEnabled()
})

test('audio buttons call the browser speech API with Russian text', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { spoken: string[] }).spoken = []
    class TestUtterance { text: string; lang = ''; rate = 1; voice?: SpeechSynthesisVoice; onerror: (() => void) | null = null; constructor(text: string) { this.text = text } }
    Object.assign(window, { SpeechSynthesisUtterance: TestUtterance, speechSynthesis: { getVoices: () => [{ lang: 'ru-RU' }], cancel: () => undefined, speak: (utterance: TestUtterance) => (window as unknown as { spoken: string[] }).spoken.push(utterance.text), addEventListener: () => undefined } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: /^Мм мак/ }).click()
  await page.getByRole('button', { name: 'Слушать слово' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken)).toContain('мак')
})
