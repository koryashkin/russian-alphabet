import { expect, test } from '@playwright/test'

test('opens on the alphabet and exposes all 33 letters', async ({ page }) => {
  await page.goto('.')
  const tiles = page.locator('.letter-tile')
  await expect(tiles).toHaveCount(33)
  for (const tile of await tiles.all()) await expect(tile).toBeEnabled()
  await expect(page.getByRole('heading', { name: 'Выбери букву' })).toBeVisible()
  await expect(page.locator('.intro')).toContainText('Все 33 буквы доступны.')
  await expect(page.getByText('можно играть')).toHaveCount(0)
})

test('every letter opens a complete card', async ({ page }) => {
  await page.goto('.')
  const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  for (const letter of alphabet) {
    await page.getByRole('button', { name: new RegExp(`^Открыть букву ${letter}:`) }).click()
    await expect(page.locator('.big-glyph')).toContainText(letter)
    await expect(page.locator('.word-list button')).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Слушать букву' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Попробовать рукой/ })).toBeVisible()
    const image = page.locator('.letter-illustration')
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement ? element.naturalWidth : 0), { message: `Image for ${letter} must load` }).toBeGreaterThan(0)
    await page.getByRole('button', { name: '← Вся азбука' }).click()
  }
})

test('letter card has three words and never reuses the horse image for A', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву А:/ }).click()
  await expect(page.locator('.word-list button')).toHaveCount(3)
  const image = page.locator('.letter-illustration')
  await expect(image).toBeVisible()
  const imageUrl = await image.getAttribute('src')
  expect(imageUrl).toContain('/assets/letters/')
  await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement ? element.naturalWidth : 0)).toBeGreaterThan(0)
  await expect.poll(() => image.evaluate(element => getComputedStyle(element).objectFit)).toBe('contain')
  await expect.poll(() => image.evaluate(element => getComputedStyle(element).objectPosition)).toBe('50% 50%')
  const imageBox = await image.boundingBox()
  expect(imageBox?.width).toBeGreaterThan(200)
  expect(imageBox?.height).toBeGreaterThanOrEqual(180)
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
  await page.getByRole('button', { name: /^Открыть букву М:/ }).click()
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

test('show button visibly demonstrates writing stroke by stroke', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву Ё:/ }).click()
  await page.getByRole('button', { name: /Попробовать рукой/ }).click()
  await expect(page.locator('.trace-guide')).toHaveCount(6)
  await expect(page.locator('.stroke-order')).toHaveCount(6)
  await page.getByRole('button', { name: 'Показать по шагам' }).click()
  await expect(page.locator('.trace-reference')).toHaveClass(/demonstrating/)
  await expect(page.locator('.demo-stroke')).toHaveCount(6)
  await expect.poll(() => page.locator('.demo-stroke').first().evaluate(element => getComputedStyle(element).animationName)).toBe('draw-stroke')
  await expect(page.getByRole('status')).toContainText('штрихи появляются по порядку')
  await expect(page.getByRole('button', { name: 'Показать ещё раз' })).toBeVisible()
})

test('E lesson gives feedback and advances to the next word', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву Е:/ }).click()
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
  await page.getByRole('button', { name: /^Открыть букву М:/ }).click()
  await page.locator('.word-list button').first().click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken)).toContain('ма́к')
})
