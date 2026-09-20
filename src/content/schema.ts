import { z } from 'zod'
import rawLetters from '../../content/letters.json'

export const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
export const letterSchema = z.object({
  id: z.string().regex(/^letter-\d{2}$/), uppercase: z.string().length(1), lowercase: z.string().length(1),
  alphabetIndex: z.number().int().min(1).max(33), word: z.string().min(1), accentedWord: z.string(),
  lessonBlock: z.number().int().min(1).max(17), note: z.string(),
  kind: z.enum(['sign', 'contextual', 'sound']), reviewStatus: z.enum(['draft', 'approved']), prototype: z.boolean(),
}).superRefine((letter, ctx) => {
  if (letter.uppercase !== alphabet[letter.alphabetIndex - 1] || letter.lowercase !== letter.uppercase.toLowerCase())
    ctx.addIssue({ code: 'custom', message: 'Alphabet index or case mismatch' })
  if ('ЬЪ'.includes(letter.uppercase) && letter.kind !== 'sign')
    ctx.addIssue({ code: 'custom', message: 'Signs cannot have a phoneme' })
  if (letter.word !== letter.word.normalize('NFC')) ctx.addIssue({ code: 'custom', message: 'Text must be NFC' })
})
export const catalogueSchema = z.array(letterSchema).length(33).superRefine((letters, ctx) => {
  if (new Set(letters.map(l => l.id)).size !== 33 || new Set(letters.map(l => l.uppercase)).size !== 33)
    ctx.addIssue({ code: 'custom', message: 'Duplicate letter or ID' })
})
export type Letter = z.infer<typeof letterSchema>
export const letters = catalogueSchema.parse(rawLetters)
export const prototypeLetters = letters.filter(l => l.prototype)
