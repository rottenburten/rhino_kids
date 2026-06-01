import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

// App Store 6.9" hedef tuval (Apple'ın kabul ettiği en büyük zorunlu boyut).
const W = 1290
const H = 2796

// Savana paleti (uygulamanın gradient'iyle uyumlu).
const BG_TOP = '#fde68a'    // sıcak sarı
const BG_MID = '#fbbf24'    // amber
const BG_BOT = '#f59e0b'    // turuncu
const DEEP = '#5b4636'      // savana-deep (metin)
const ACCENT = '#ea7a3b'    // turuncu vurgu

// Telefon çerçevesi yerleşimi: tuvalde ortalı, üstte metin için yer bırak.
const PHONE_W = 980          // çerçeve genişliği
const FRAME = 26             // çerçeve kalınlığı (bezel)
const SHOT_W = PHONE_W - FRAME * 2
const TITLE_BAND = 420       // üstte başlık için ayrılan dikey alan

// Başlık SVG'si — iki satıra kadar otomatik sarmalı.
function titleSvg(text, w, h) {
  // Basit kelime sarma: ~14 karakter/satır hedefi.
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const word of words) {
    if ((cur + ' ' + word).trim().length > 16 && cur) {
      lines.push(cur)
      cur = word
    } else {
      cur = (cur + ' ' + word).trim()
    }
  }
  if (cur) lines.push(cur)

  const fontSize = lines.length > 1 ? 92 : 104
  const lineH = fontSize * 1.15
  const totalH = lines.length * lineH
  const startY = (h - totalH) / 2 + fontSize * 0.8

  const tspans = lines
    .map((ln, i) => {
      const esc = ln.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<text x="${w / 2}" y="${startY + i * lineH}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="${DEEP}" text-anchor="middle" letter-spacing="-1">${esc}</text>`
    })
    .join('')

  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${tspans}</svg>`
  )
}

// Arka plan gradient + yumuşak doku (güneş ışıltısı) SVG'si.
function backgroundSvg() {
  return Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${BG_TOP}"/>
          <stop offset="55%" stop-color="${BG_MID}"/>
          <stop offset="100%" stop-color="${BG_BOT}"/>
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffbe6" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <circle cx="${W * 0.82}" cy="${H * 0.12}" r="320" fill="url(#sun)"/>
      <!-- alt savana tepe silüeti -->
      <path d="M0 ${H} L0 ${H - 180} Q ${W * 0.25} ${H - 280} ${W * 0.5} ${H - 200}
               Q ${W * 0.75} ${H - 120} ${W} ${H - 240} L${W} ${H} Z"
            fill="#c98a3c" opacity="0.35"/>
    </svg>`)
}

// Yuvarlatılmış köşe maskesi (ekran görüntüsünü telefon ekranına oturtmak için).
function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  )
}

// Telefon gövdesi (koyu bezel + yuvarlak köşe + hafif gölge zaten composite'te).
function phoneBodySvg(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
       <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#2d2218"/>
     </svg>`
  )
}

async function buildOne(srcPath, title, outPath) {
  // 1) Ham ekranı telefon ekran boyutuna ölçekle, köşelerini yuvarlat.
  const shotMeta = await sharp(srcPath).metadata()
  const shotH = Math.round(SHOT_W * (shotMeta.height / shotMeta.width))
  const screenRadius = 56
  const shot = await sharp(srcPath)
    .resize(SHOT_W, shotH)
    .composite([{ input: roundedMask(SHOT_W, shotH, screenRadius), blend: 'dest-in' }])
    .png()
    .toBuffer()

  // 2) Telefon gövdesi (bezel) — ekran + çerçeve.
  const phoneH = shotH + FRAME * 2
  const phoneRadius = screenRadius + FRAME
  const phone = await sharp(phoneBodySvg(PHONE_W, phoneH, phoneRadius))
    .composite([{ input: shot, top: FRAME, left: FRAME }])
    .png()
    .toBuffer()

  // 3) Telefonun altına yumuşak gölge.
  const shadow = await sharp({
    create: { width: PHONE_W, height: phoneH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: await sharp(phoneBodySvg(PHONE_W, phoneH, phoneRadius))
          .blur(28)
          .png()
          .toBuffer(),
      },
    ])
    .png()
    .toBuffer()

  // 4) Arka plan + başlık + (gölge → telefon) kompozisyonu.
  const phoneLeft = Math.round((W - PHONE_W) / 2)
  const phoneTop = TITLE_BAND // başlık bandının hemen altı

  const title_ = await sharp(titleSvg(title, W, TITLE_BAND)).png().toBuffer()

  await sharp(backgroundSvg())
    .composite([
      { input: title_, top: 70, left: 0 },
      { input: shadow, top: phoneTop + 22, left: phoneLeft }, // gölge biraz aşağı
      { input: phone, top: phoneTop, left: phoneLeft },
    ])
    .png()
    .toFile(outPath)
}

// ─── İş listesi ───
const EN_DIR = '/Users/creditreform/Downloads/rhino_kids_eng '
const TR_DIR = '/Users/creditreform/Downloads/rhino_kids_tr'
const OUT_EN = path.resolve('output/screenshots_en')
const OUT_TR = path.resolve('output/screenshots_tr')

const EN_MAP = [
  ['IMG_2610.PNG', '8 Fun Math Adventures'],
  ['IMG_2611.PNG', 'Learn by Playing'],
  ['IMG_2615.PNG', 'See Math Come to Life'],
  ['IMG_2620.PNG', 'Shapes, Colors & More'],
  ['IMG_2617.PNG', 'Celebrate Every Win'],
  ['IMG_2618.PNG', 'Earn Badges & Rewards'],
  ['IMG_2619.PNG', 'Meet the Savanna Friends'],
]
const TR_MAP = [
  ['IMG_2602.PNG', '8 Eğlenceli Matematik Macerası'],
  ['IMG_2603.PNG', 'Oynayarak Öğren'],
  ['IMG_2604.PNG', 'Matematik Canlansın'],
  ['IMG_2606.PNG', 'Eşit Paylaştır'],
  ['IMG_2607.PNG', 'Rozetler ve Ödüller Kazan'],
  ['IMG_2608.PNG', 'Savana Arkadaşlarıyla Tanış'],
]

const onlySample = process.argv.includes('--sample')

;(async () => {
  fs.mkdirSync(OUT_EN, { recursive: true })
  fs.mkdirSync(OUT_TR, { recursive: true })

  const enJobs = onlySample ? EN_MAP.slice(0, 1) : EN_MAP
  const trJobs = onlySample ? TR_MAP.slice(4, 5) : TR_MAP // örnek: rozet ekranı

  for (let i = 0; i < enJobs.length; i++) {
    const [file, title] = enJobs[i]
    const out = path.join(OUT_EN, `${String(i + 1).padStart(2, '0')}_${file}`)
    await buildOne(path.join(EN_DIR, file), title, out)
    console.log('EN ✓', out)
  }
  for (let i = 0; i < trJobs.length; i++) {
    const [file, title] = trJobs[i]
    const out = path.join(OUT_TR, `${String(i + 1).padStart(2, '0')}_${file}`)
    await buildOne(path.join(TR_DIR, file), title, out)
    console.log('TR ✓', out)
  }
  console.log('Bitti.')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
