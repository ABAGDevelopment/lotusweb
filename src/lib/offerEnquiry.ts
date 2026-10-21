import { z } from 'zod'

/**
 * The offer enquiry rules, shared by the form and api/offer-enquiry.ts so the
 * two cannot disagree. The API imports this file by relative path, so keep it
 * free of `@/` aliases, browser globals and import.meta.env.
 */

export const CONTACT_METHODS = ['phone', 'email', 'whatsapp'] as const
export type ContactMethod = (typeof CONTACT_METHODS)[number]

/** Error codes, not messages: the form shows them in the visitor's language. */
export type FieldErrorCode =
  | 'required'
  | 'tooLong'
  | 'invalidName'
  | 'invalidEmail'
  | 'invalidPhone'
  | 'invalidOption'
  | 'consent'

/** Offers a visitor may see and enquire about. Needs a `$today` param (see dubaiToday). */
export const LIVE_OFFER = /* groq */ `_type == "offer" && published == true && defined(slug.current)
  && (!defined(startDate) || startDate <= $today) && (!defined(endDate) || endDate >= $today)`

/** Today's date in the UAE as YYYY-MM-DD. The UAE has no daylight saving: always UTC+4. */
export function dubaiToday(now = new Date()): string {
  return new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** An offer date (YYYY-MM-DD) as "31 December 2026", in the page language. */
export function formatOfferDate(date: string, locale: 'en' | 'ar'): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

/** Control characters, zero-width and bidi overrides: invisible, and a spoofing tool. */
// eslint-disable-next-line no-control-regex -- stripping control characters is the point
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g

export function cleanText(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').replace(INVISIBLE, '').trim()
}

/**
 * Accepts the ways people write a UAE number — 050 123 4567, 50-123-4567,
 * +971 50 123 4567, 00971501234567 — and returns it as +971XXXXXXXXX, or
 * null. Mobiles are 5 + 8 digits; landlines an area code (2, 3, 4, 6, 7, 9)
 * + 7 digits.
 */
export function normalizeUaePhone(input: string): string | null {
  let digits = input.replace(/[\s().-]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  else if (digits.startsWith('00')) digits = digits.slice(2)
  if (!/^\d+$/.test(digits)) return null
  digits = digits.replace(/^971/, '').replace(/^0/, '')
  return /^(5\d{8}|[234679]\d{7})$/.test(digits) ? `+971${digits}` : null
}

const NAME = /^\p{L}[\p{L}\p{M}' .-]*$/u

const text = (max: number) =>
  z
    .string({ required_error: 'required', invalid_type_error: 'required' })
    .transform(cleanText)
    .pipe(z.string().min(1, 'required').max(max, 'tooLong'))

/** `modelOptions` are the offer's English model names; empty means no model question. */
export function offerEnquirySchema(modelOptions: string[] = []) {
  return z.object({
    fullName: text(120).refine((v) => NAME.test(v), 'invalidName'),
    email: text(200).pipe(z.string().email('invalidEmail')),
    phone: text(40).transform((v, ctx) => {
      const phone = normalizeUaePhone(v)
      if (!phone) ctx.addIssue({ code: 'custom', message: 'invalidPhone' })
      return phone ?? z.NEVER
    }),
    model: modelOptions.length
      ? text(80).refine((v) => modelOptions.includes(v), 'invalidOption')
      : z.unknown().transform(() => ''),
    contactMethod: z.enum(CONTACT_METHODS, { errorMap: () => ({ message: 'required' }) }),
    consent: z.literal(true, { errorMap: () => ({ message: 'consent' }) }),
  })
}

export type OfferEnquiryFields = z.output<ReturnType<typeof offerEnquirySchema>>
export type FieldErrors = Partial<Record<keyof OfferEnquiryFields, FieldErrorCode>>

/** The first error per field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof OfferEnquiryFields
    out[field] ??= issue.message as FieldErrorCode
  }
  return out
}

const optional = (max: number) =>
  z.string().transform(cleanText).pipe(z.string().max(max)).optional().catch(undefined)

/**
 * Everything the form sends besides the visitor's answers. A malformed value
 * here is dropped rather than failing the lead.
 */
export const enquiryMetaSchema = z.object({
  // Published offer IDs have no dots: this also refuses drafts and private paths.
  offerId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
  locale: z.enum(['en', 'ar']).catch('en'),
  source: z
    .object({
      utmSource: optional(200),
      utmMedium: optional(200),
      utmCampaign: optional(200),
      utmTerm: optional(200),
      utmContent: optional(200),
      page: optional(300),
      referrer: optional(300),
    })
    .catch({}),
})

export type EnquirySource = z.output<typeof enquiryMetaSchema>['source']

/** What the form POSTs. `website` is the honeypot: people never fill it. */
export interface OfferEnquiryRequest {
  offerId: string
  locale: string
  source: EnquirySource
  fullName: string
  email: string
  phone: string
  model: string
  contactMethod: string
  consent: boolean
  website: string
}
