import type { ComponentType } from 'react'
import type { CharacterProps } from './types'

import Reno from './Reno'
import Zara from './Zara'
import Eko from './Eko'
import Zigi from './Zigi'
import Leo from './Leo'
import Momo from './Momo'

export { Reno, Zara, Eko, Zigi, Leo, Momo }
export { default as CharacterShell } from './CharacterShell'
export { useCharacterMood } from './useCharacterMood'
export type { CharacterProps, Mood } from './types'

// Modül id → öğretmen karakter eşlemesi (moduleList.ts ile aynı id'ler).
const MODULE_CHARACTERS: Record<string, ComponentType<CharacterProps>> = {
  count: Zara, // SAYMA  — Zürafa Zara
  add: Eko, //   TOPLAMA — Fil Eko
  sub: Zigi, //  ÇIKARMA — Zebra Zigi
  mul: Leo, //   ÇARPMA  — Aslan Leo
  div: Momo, //  BÖLME   — Maymun Momo
}

/**
 * Bir modül id'si için ilgili karakter bileşenini döndürür.
 * Eşleşme yoksa (ör. "yakında" modüller) undefined döner — çağıran
 * taraf emoji fallback'e düşebilir.
 */
export function getCharacter(moduleId: string): ComponentType<CharacterProps> | undefined {
  return MODULE_CHARACTERS[moduleId]
}
