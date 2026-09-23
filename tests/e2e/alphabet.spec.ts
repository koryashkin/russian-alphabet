import { expect, test } from '@playwright/test'

test('opens on the alphabet and exposes all 33 letters', async ({ page }) => {
  await page.goto('.')
  const tiles = page.locator('.letter-tile')
  await expect(tiles).toHaveCount(33)
  for (const tile of await tiles.all()) await expect(tile).toBeEnabled()
  await expect(page.getByRole('heading', { name: 'Выбери букву' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Буквы, которые хочется/ })).toBeVisible()
  await expect(page.locator('.header-count')).toHaveCount(0)
  await expect(page.getByLabel('Возможности азбуки').getByRole('button')).toHaveCount(0)
  await expect(page.getByLabel('Цвета букв')).toHaveText(/Гласные.*Согласные.*Знаки/)
  await expect(page.getByRole('button', { name: /^Открыть букву А:/ })).toHaveClass(/vowel/)
  await expect(page.getByRole('button', { name: /^Открыть букву Б:/ })).toHaveClass(/consonant/)
  await expect(page.getByRole('button', { name: /^Открыть букву Ь:/ })).toHaveClass(/sign/)
  await expect(page.getByText('можно играть')).toHaveCount(0)
  await expect(page.getByText('прототип', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
})

test('main screens do not overflow the viewport', async ({ page }) => {
  await page.goto('.')
  const hasHorizontalOverflow = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  await expect.poll(hasHorizontalOverflow).toBe(false)

  await page.getByRole('button', { name: /^Открыть букву Я:/ }).click()
  await expect.poll(hasHorizontalOverflow).toBe(false)
  await expect(page.locator('.lesson-number')).toHaveText('33')

  await page.getByRole('button', { name: /Попробовать рукой/ }).click()
  await expect.poll(hasHorizontalOverflow).toBe(false)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('every letter opens a complete card', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('.')
  const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  for (const letter of alphabet) {
    await page.getByRole('button', { name: new RegExp(`^Открыть букву ${letter}:`) }).click()
    await expect(page.locator('.big-glyph')).toContainText(letter)
    await expect(page.locator('.word-list button')).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Слушать букву' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Попробовать рукой/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: `Где в слове буква ${letter}?` })).toBeVisible()
    await expect(page.locator('.letter-game .game-choices button')).toHaveCount(3)
    const image = page.locator('.letter-illustration')
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement ? element.naturalWidth : 0), { message: `Image for ${letter} must load` }).toBeGreaterThan(0)
    await page.getByRole('button', { name: '← Вся азбука' }).click()
  }
})

test('letter card has three words and a production image', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву А:/ }).click()
  await expect(page.locator('.word-list button')).toHaveCount(3)
  const image = page.locator('.letter-illustration')
  await expect(image).toBeVisible()
  const imageUrl = await image.getAttribute('src')
  expect(imageUrl).toContain('/assets/words/410-0.webp')
  await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement ? element.naturalWidth : 0)).toBeGreaterThan(0)
  await expect.poll(() => image.evaluate(element => getComputedStyle(element).objectFit)).toBe('contain')
  await expect.poll(() => image.evaluate(element => getComputedStyle(element).objectPosition)).toBe('50% 50%')
  const imageBox = await image.boundingBox()
  expect(imageBox?.width).toBeGreaterThan(200)
  expect(imageBox?.height).toBeGreaterThanOrEqual(180)
  const response = await page.request.get(new URL(imageUrl!, page.url()).toString())
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toBe('image/webp')
  expect((await response.body()).byteLength).toBeGreaterThan(10_000)
})

test('all 99 word image files load and decode', async ({ page }) => {
  await page.goto('.')
  const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  const base = new URL('assets/words/', page.url())
  for (const letter of alphabet) {
    for (const index of [0, 1, 2]) {
      const label = `${letter}, word ${index + 1}`
      const url = new URL(`${letter.codePointAt(0)!.toString(16)}-${index}.webp`, base).toString()
      const response = await page.request.get(url)
      expect(response.status(), `${label}: ${url}`).toBe(200)
      expect(response.headers()['content-type'], label).toBe('image/webp')
      expect((await response.body()).byteLength, label).toBeGreaterThan(3_000)
      const decoded = await page.evaluate(src => new Promise<boolean>(resolve => { const image = new Image(); image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0); image.onerror = () => resolve(false); image.src = src }), url)
      expect(decoded, `${label} must decode`).toBe(true)
    }
  }
})

test('clicking each word changes the picture and selected state', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву Я:/ }).click()
  const image = page.locator('.letter-illustration')
  const buttons = page.locator('.word-list button')

  await expect(image).toHaveAttribute('src', /42f-0\.webp$/)
  await expect(image).toHaveAttribute('alt', 'Иллюстрация: я́блоко')
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true')

  await buttons.nth(1).click()
  await expect(image).toHaveAttribute('src', /42f-1\.webp$/)
  await expect(image).toHaveAttribute('alt', 'Иллюстрация: я́ма')
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement ? element.naturalWidth : 0)).toBeGreaterThan(0)

  await buttons.nth(2).click()
  await expect(image).toHaveAttribute('src', /42f-2\.webp$/)
  await expect(image).toHaveAttribute('alt', 'Иллюстрация: мя́ч')
  await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true')
})

test('opening another letter resets the selected word and picture', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву Я:/ }).click()
  await page.locator('.word-list button').nth(2).click()
  await expect(page.locator('.letter-illustration')).toHaveAttribute('src', /42f-2\.webp$/)
  await page.getByRole('button', { name: '← Вся азбука' }).click()
  await page.getByRole('button', { name: /^Открыть букву А:/ }).click()
  await expect(page.locator('.letter-illustration')).toHaveAttribute('src', /410-0\.webp$/)
  await expect(page.locator('.word-list button').first()).toHaveAttribute('aria-pressed', 'true')
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
  const newSheet = page.getByRole('button', { name: /Новый лист/ })
  await expect(newSheet).toBeEnabled()
  await newSheet.click()
  await expect(newSheet).toBeDisabled()
  await expect(page.getByText('Начать на чистом листе?')).toHaveCount(0)
  await expect(page.getByText('Для левой руки')).toHaveCount(0)
})

test('show button visibly demonstrates writing stroke by stroke', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву Ё:/ }).click()
  await page.getByRole('button', { name: /Попробовать рукой/ }).click()
  await expect(page.locator('.trace-guide')).toHaveCount(6)
  await expect(page.locator('.stroke-order')).toHaveCount(6)
  const markerPositions = await page.locator('.stroke-order circle').evaluateAll(circles => circles.map(circle => `${circle.getAttribute('cx')},${circle.getAttribute('cy')}`))
  expect(new Set(markerPositions).size).toBe(6)
  await page.getByRole('button', { name: 'Показать по шагам' }).click()
  await expect(page.locator('.trace-reference')).toHaveClass(/demonstrating/)
  await expect(page.locator('.demo-stroke')).toHaveCount(6)
  await expect.poll(() => page.locator('.demo-stroke').first().evaluate(element => getComputedStyle(element).animationName)).toBe('draw-stroke')
  await expect(page.getByRole('status')).toContainText('штрихи появляются по порядку')
  await expect(page.getByRole('button', { name: 'Показать ещё раз' })).toBeVisible()
})

test('all 33 letters have complete, separated writing guides', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('.')
  const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'

  for (const letter of alphabet) {
    await page.getByRole('button', { name: new RegExp(`^Открыть букву ${letter}:`) }).click()
    await page.getByRole('button', { name: /Попробовать рукой/ }).click()

    const board = page.locator('.writing-board')
    const guides = page.locator('.trace-guide')
    const markers = page.locator('.stroke-order')
    const guideCount = await guides.count()
    expect(guideCount, `${letter}: guide count`).toBeGreaterThan(0)
    await expect(markers, `${letter}: one number per stroke`).toHaveCount(guideCount)
    await expect(page.getByLabel(`Образец написания ${letter}`)).toBeVisible()
    await expect(page.getByLabel('Поле для рисования')).toBeVisible()

    const markerData = await markers.evaluateAll(nodes => nodes.map(node => {
      const circle = node.querySelector('circle')
      return {
        label: node.querySelector('text')?.textContent,
        x: Number(circle?.getAttribute('cx')),
        y: Number(circle?.getAttribute('cy')),
      }
    }))
    expect(markerData.map(marker => marker.label), `${letter}: marker order`).toEqual(
      Array.from({ length: guideCount }, (_, index) => String(index + 1)),
    )
    for (let first = 0; first < markerData.length; first += 1) {
      expect(markerData[first].x, `${letter}: marker ${first + 1} x`).toBeGreaterThanOrEqual(3.2)
      expect(markerData[first].x, `${letter}: marker ${first + 1} x`).toBeLessThanOrEqual(96.8)
      expect(markerData[first].y, `${letter}: marker ${first + 1} y`).toBeGreaterThanOrEqual(3.2)
      expect(markerData[first].y, `${letter}: marker ${first + 1} y`).toBeLessThanOrEqual(96.8)
      for (let second = first + 1; second < markerData.length; second += 1) {
        const distance = Math.hypot(markerData[first].x - markerData[second].x, markerData[first].y - markerData[second].y)
        expect(distance, `${letter}: markers ${first + 1} and ${second + 1} overlap`).toBeGreaterThan(6.4)
      }
    }

    const boardBox = await board.boundingBox()
    expect(boardBox, `${letter}: writing board`).not.toBeNull()
    await page.getByRole('button', { name: 'Показать по шагам' }).click()
    await expect(page.locator('.demo-stroke'), `${letter}: animated strokes`).toHaveCount(guideCount)
    await page.getByRole('button', { name: `← К букве ${letter}` }).click()
    await page.getByRole('button', { name: '← Вся азбука' }).click()
  }
})

test('E lesson asks where the letter is in three different words', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву Е:/ }).click()
  const gameResult = page.locator('.game-result')
  await expect(page.getByRole('heading', { name: 'Где в слове буква Е?' })).toBeVisible()
  await expect(page.locator('.game-prompt strong')).toHaveText('еда́')
  await page.getByRole('button', { name: 'В середине', exact: true }).click()
  await expect(gameResult).toContainText('Послушай слово ещё раз')
  await page.getByRole('button', { name: 'В начале', exact: true }).click()
  await expect(gameResult).toContainText('Буква Е стоит первой')
  await page.getByRole('button', { name: 'Следующее слово' }).click()
  await expect(page.locator('.game-prompt strong')).toHaveText('по́езд')
  await page.getByRole('button', { name: 'В середине', exact: true }).click()
  await expect(gameResult).toContainText('Буква Е стоит в середине')
  await page.getByRole('button', { name: 'Следующее слово' }).click()
  await expect(page.locator('.game-prompt strong')).toHaveText('кафе́')
  await page.getByRole('button', { name: 'В конце', exact: true }).click()
  await expect(gameResult).toContainText('Буква Е стоит последней')
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

test('shows a clear sound-help message when browser speech is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined })
  })
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву А:/ }).click()
  await page.locator('.word-list button').first().click()
  await expect(page.locator('.audio-support [role="status"]')).toContainText('Звук не слышно?')
  await expect(page.getByRole('button', { name: 'Повторить' })).toBeVisible()
})

test('offers sound directions on request when a device is silent', async ({ page }) => {
  await page.goto('.')
  await page.getByRole('button', { name: /^Открыть букву А:/ }).click()
  await page.getByRole('button', { name: 'Нет звука?' }).click()
  await expect(page.locator('.audio-support [role="status"]')).toContainText('Увеличьте громкость мультимедиа')
  await expect(page.getByRole('button', { name: 'Повторить' })).toBeVisible()
})
