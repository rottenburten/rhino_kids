import { localizeDigits } from './digits'

/**
 * Manuel sayı → YAZIYLA çevirici. Ebeveyn kapısı için: ekranda sayı yazıyla
 * gösterilir, kullanıcı rakamla girer (çocuk yazamaz, ebeveyn kolay çözer).
 *
 * Hedef aralık 1000–9999; güvenlik için 0–9999 tamamını kapsar.
 * Bağımsız (kütüphane yok) — küçük aralık olduğu için tam kontrol + sıfır boyut.
 *
 * Diller: tr, en, ar (MSA — Modern Standart Arapça). Desteklenmeyen dilde
 * rakama düşer. NOT: Arapça kelimeler TASLAK — anadili konuşan biri doğrulamalı
 * (cinsiyet uyumu, مائة/آلاف biçimleri zor).
 */

// ── Türkçe ──
const TR_ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
const TR_TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']

function tr(n: number): string {
  const parts: string[] = []
  const th = Math.floor(n / 1000)
  const rem = n % 1000
  if (th === 1) parts.push('bin') // "bir bin" değil, sadece "bin"
  else if (th > 1) parts.push(TR_ONES[th], 'bin')
  const h = Math.floor(rem / 100)
  if (h === 1) parts.push('yüz') // "bir yüz" değil, sadece "yüz"
  else if (h > 1) parts.push(TR_ONES[h], 'yüz')
  const to = rem % 100
  const t = Math.floor(to / 10)
  const o = to % 10
  if (t > 0) parts.push(TR_TENS[t])
  if (o > 0) parts.push(TR_ONES[o])
  return parts.join(' ')
}

// ── İngilizce ──
const EN_ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen',
]
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function en(n: number): string {
  const parts: string[] = []
  const th = Math.floor(n / 1000)
  const rem = n % 1000
  if (th > 0) parts.push(`${EN_ONES[th]} thousand`)
  const h = Math.floor(rem / 100)
  if (h > 0) parts.push(`${EN_ONES[h]} hundred`)
  const to = rem % 100
  if (to > 0) {
    if (to < 20) parts.push(EN_ONES[to])
    else {
      const t = Math.floor(to / 10)
      const o = to % 10
      parts.push(o === 0 ? EN_TENS[t] : `${EN_TENS[t]}-${EN_ONES[o]}`)
    }
  }
  return parts.join(' ')
}

// ── Arapça (MSA) ──
const AR_ONES = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
const AR_TEENS = [
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر',
  'ثمانية عشر', 'تسعة عشر',
]
const AR_TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
const AR_HUNDREDS = [
  '', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة',
]

function arTensOnes(to: number): string {
  if (to < 10) return AR_ONES[to]
  if (to < 20) return AR_TEENS[to - 10]
  const t = Math.floor(to / 10)
  const o = to % 10
  if (o === 0) return AR_TENS[t]
  // birler ÖNCE, sonra onlar: "أربعة وعشرون" (24)
  return `${AR_ONES[o]} و${AR_TENS[t]}`
}

function ar(n: number): string {
  const parts: string[] = []
  const th = Math.floor(n / 1000)
  const rem = n % 1000
  if (th === 1) parts.push('ألف')
  else if (th === 2) parts.push('ألفان') // MSA ikil (dual)
  else if (th >= 3) parts.push(`${AR_ONES[th]} آلاف`) // 3–9 bin: çoğul "آلاف"
  const h = Math.floor(rem / 100)
  if (h > 0) parts.push(AR_HUNDREDS[h])
  const to = rem % 100
  if (to > 0) parts.push(arTensOnes(to))
  // Gruplar arası "و" bağlacı: "ثلاثة آلاف ومائة وأربعة وعشرون"
  return parts.join(' و')
}

/**
 * Sayıyı aktif dilde yazıya çevirir (0–9999). Desteklenmeyen dilde rakam döner.
 */
export function numberToWords(n: number, lng: string | undefined): string {
  const base = (lng || 'tr').split('-')[0]
  const v = Math.floor(Math.abs(n))
  if (base === 'tr') return v === 0 ? 'sıfır' : tr(v)
  if (base === 'en') return v === 0 ? 'zero' : en(v)
  if (base === 'ar') return v === 0 ? 'صفر' : ar(v)
  return localizeDigits(v, base)
}

/** Ebeveyn kapısı için 4 basamaklı rastgele sayı (1000–9999). */
export function randomGateNumber(): number {
  return 1000 + Math.floor(Math.random() * 9000)
}
