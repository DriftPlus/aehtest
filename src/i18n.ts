import en from './locales/en.json'
import pl from './locales/pl.json'
import uk from './locales/uk.json'
import fil from './locales/fil.json'
import be from './locales/be.json'
import hi from './locales/hi.json'
import si from './locales/si.json'
import ta from './locales/ta.json'

export type Lang = 'en' | 'pl' | 'uk' | 'fil' | 'be' | 'hi' | 'si' | 'ta'

const dict: Record<Lang, any> = { en, pl, uk, fil, be, hi, si, ta }

export function t(lang: Lang, key: string): string {
  const parts = key.split('.')
  let cur: any = dict[lang] || dict.en
  for (const p of parts) {
    cur = cur?.[p]
    if (cur == null) return key
  }
  return String(cur)
}
