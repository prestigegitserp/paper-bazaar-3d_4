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
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})

page.on('console', (message) => {
  if (message.type() === 'error') console.error('[browser]', message.text())
})
page.on('pageerror', (error) => console.error('[pageerror]', error.message))

await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.waitForTimeout(4200)

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

await page.screenshot({ path: 'visual-home.png', fullPage: true })

await page.getByRole('button', { name: /Atlas Paper House/i }).last().click()
await page.waitForTimeout(2200)
await page.screenshot({ path: 'visual-atlas.png', fullPage: true })

await page.getByRole('button', { name: /PackLab Supply/i }).last().click()
await page.waitForTimeout(2200)
await page.screenshot({ path: 'visual-packlab.png', fullPage: true })

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.waitForTimeout(3200)
await page.screenshot({ path: 'visual-mobile.png', fullPage: true })

await browser.close()
