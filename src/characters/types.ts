// Tüm karakterlerin paylaştığı ortak tipler.
// SVG çizimleri sonra tek tek eklenecek — bu arayüz sabit kalır.

export type Mood = 'idle' | 'happy' | 'sad' | 'thinking' | 'celebrate'

export interface CharacterProps {
  /** Karakterin ruh hali — animasyonu belirler. Varsayılan: 'idle' */
  mood?: Mood
  /** Piksel cinsinden kare boyut (genişlik = yükseklik). Varsayılan: 160 */
  size?: number
}
