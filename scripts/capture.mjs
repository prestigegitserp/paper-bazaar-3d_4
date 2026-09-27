import { chromium } from 'playwright'

const baseUrl = process.env.VISUAL_URL ?? 'http://127.0.0.1:4173/paper-bazaar-3d_4/'
const browser = await chromium.launch({
  headless: true,
  args: [
    '--use-gl=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--disable-dev-shm-usage',
  ],
})

const page = await browser.newPage({
  viewport: { width: 1120, height: 630 },
  deviceScaleFactor: 1,
})

page.setDefaultTimeout(120_000)

page.on('console', (message) => {
  if (message.type() === 'error') console.error('[browser]', message.text())
})
page.on('pageerror', (error) => console.error('[pageerror]', error.message))

await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120_000 })
await page.waitForTimeout(8500)

const webgl = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl')
  return {
    canvas: Boolean(canvas),
    webgl: Boolean(gl),
    width: canvas?.width ?? 0,
    height: canvas?.height ?? 0,
  }
})
console.log('visual-runtime', JSON.stringify(webgl))
if (!webgl.canvas || !webgl.webgl) throw new Error('WebGL canvas failed to initialize')

const shot = (path) =>
  page.screenshot({
    path,
    fullPage: false,
    animations: 'disabled',
    timeout: 120_000,
  })

await page.mouse.move(980, 310)
await page.waitForTimeout(500)
await shot('visual-home.png')

for (const [name, file] of [
  ['Atlas Paper House', 'visual-atlas.png'],
  ['PackLab Supply', 'visual-packlab.png'],
  ['Chroma Mill', 'visual-chroma.png'],
  ['Circula Fiber', 'visual-circula.png'],
]) {
  await page.getByRole('button', { name: new RegExp(name, 'i') }).last().click()
  await page.waitForTimeout(3000)
  await shot(file)
}

await page.getByRole('button', { name: /HALL/i }).last().click()
await page.waitForTimeout(1000)

const walkButton = page.locator('.walk-trigger').first()
await walkButton.click()
await page.waitForTimeout(1200)

const pointerLocked = await page.evaluate(() => Boolean(document.pointerLockElement))
console.log('pointer-lock', pointerLocked)

if (pointerLocked) {
  await page.keyboard.down('w')
  await page.waitForTimeout(2200)
  await page.keyboard.up('w')
  await page.mouse.move(760, 340)
  await page.waitForTimeout(500)
  await shot('visual-walk.png')
  await page.keyboard.press('Escape')
} else {
  console.warn('Pointer lock not available in this headless runtime; desktop browsers will still use the same control path.')
}

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120_000 })
await page.waitForTimeout(6500)
await shot('visual-mobile.png')

await browser.close()
