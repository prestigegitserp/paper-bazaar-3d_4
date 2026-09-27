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
  viewport: { width: 1280, height: 720 },
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

await page.getByRole('button', { name: /Atlas Paper House/i }).last().click()
await page.waitForTimeout(5500)
await shot('visual-atlas.png')

await page.getByRole('button', { name: /PackLab Supply/i }).last().click()
await page.waitForTimeout(5500)
await shot('visual-packlab.png')

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120_000 })
await page.waitForTimeout(6500)
await shot('visual-mobile.png')

await browser.close()
