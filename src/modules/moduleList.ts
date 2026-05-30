import type { ModuleDef } from '../types'

export const MODULES: ModuleDef[] = [
  {
    id: 'count',
    name: 'SAYMA',
    icon: '🦒',
    character: '🦒',
    characterName: 'Zürafa Zara',
    description: 'Zara ile sayıları öğren',
  },
  {
    id: 'add',
    name: 'TOPLAMA',
    icon: '🐘',
    character: '🐘',
    characterName: 'Fil Eko',
    description: 'Eko ile toplama oyna',
  },
  {
    id: 'sub',
    name: 'ÇIKARMA',
    icon: '🦓',
    character: '🦓',
    characterName: 'Zebra Zigi',
    description: 'Zigi ile çıkarma yap',
  },
  {
    id: 'mul',
    name: 'ÇARPMA',
    icon: '🦁',
    character: '🦁',
    characterName: 'Aslan Leo',
    description: 'Leo ile çarpma uzmanı ol',
  },
  {
    id: 'div',
    name: 'BÖLME',
    icon: '🐒',
    character: '🐒',
    characterName: 'Maymun Momo',
    description: 'Momo ile paylaş',
  },
  {
    id: 'seq',
    name: 'SIRA',
    icon: '🔢',
    character: '🦅',
    characterName: 'Kartal Kira',
    description: 'Eksik sayıyı bul',
  },
  {
    id: 'shape',
    name: 'ŞEKİL',
    icon: '🔺',
    character: '🐢',
    characterName: 'Kaplumbağa Tomi',
    description: 'Şekilleri tanı',
  },
  {
    id: 'clock',
    name: 'SAAT',
    icon: '⏰',
    character: '🦘',
    characterName: 'Kanguru Kalo',
    description: 'Saati öğren',
  },
]

export function getModule(id: string): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id)
}