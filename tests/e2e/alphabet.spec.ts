import { expect, test } from '@playwright/test'

test('opens on the alphabet and exposes all 33 letters', async ({ page }) => {
  await page.goto('.')
  await expect(page.locator('.letter-tile')).toHaveCount(33)
  await expect(page.getByRole('heading', { name: 'Выбери букву' })).toBeVisible()
})

test('letter card has three words and never reuses the horse image for A', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Аа автобус/ }).click()
  await expect(page.locator('.word-list button')).toHaveCount(3)
  const image = page.locator('.generated')
  await expect(image).toBeVisible()
  const imageUrl = await image.evaluate(element => getComputedStyle(element).backgroundImage.split('url("')[1]?.split('"')[0])
  expect(imageUrl).toContain('/assets/letters/')
  await expect.poll(() => image.evaluate(element => getComputedStyle(element).backgroundSize)).toBe('contain')
  const response = await page.request.get(new URL(imageUrl!, page.url()).toString())
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toBe('image/png')
  expect((await response.body()).byteLength).toBeGreaterThan(10_000)
})

test('all 33 production image files load and decode', async ({ page }) => {
  await page.goto('.')
  const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  const base = new URL('assets/letters/', page.url())
  for (const letter of alphabet) {
    const url = new URL(`${letter.codePointAt(0)!.toString(16)}.png`, base).toString()
    const response = await page.request.get(url)
    expect(response.status(), `${letter}: ${url}`).toBe(200)
    expect(response.headers()['content-type'], letter).toBe('image/png')
    expect((await response.body()).byteLength, letter).toBeGreaterThan(10_000)
    const decoded = await page.evaluate(src => new Promise<boolean>(resolve => { const image = new Image(); image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0); image.onerror = () => resolve(false); image.src = src }), url)
    expect(decoded, `${letter} must decode`).toBe(true)
  }
})

test('writing screen accepts a pointer stroke and keeps controls available', async ({ page }) => {
  await page.goto('.')
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

test('E lesson gives feedback and advances to the next word', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Ее ель/ }).click()
  await expect(page.getByRole('heading', { name: 'Слышим Е в начале слова' })).toBeVisible()
  await page.getByRole('button', { name: 'И', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Послушай слово ещё раз')
  await page.getByRole('button', { name: 'Е', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Верно')
  await page.getByRole('button', { name: 'Следующее слово' }).click()
  await expect(page.locator('.game-prompt strong')).toHaveText('еда́')
})

test('audio buttons call the browser speech API with Russian text', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { spoken: string[] }).spoken = []
    class TestUtterance { text: string; lang = ''; rate = 1; voice?: SpeechSynthesisVoice; onerror: (() => void) | null = null; constructor(text: string) { this.text = text } }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: TestUtterance })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [{ lang: 'ru-RU' }], cancel: () => undefined, speak: (utterance: TestUtterance) => (window as unknown as { spoken: string[] }).spoken.push(utterance.text), addEventListener: () => undefined } })
  })
  await page.goto('.')
  await page.getByRole('button', { name: /^Мм мак/ }).click()
  await page.locator('.word-list button').first().click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken)).toContain('ма́к')
})
