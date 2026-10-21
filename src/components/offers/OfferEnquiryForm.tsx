import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import CmsLink from '@/components/common/CmsLink'
import TextField from '@/components/testdrive/TextField'
import { CARD_FOCUS, Checkbox, FieldError, SECTION_HEADING } from '@/components/testdrive/TestDriveForm'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import {
  CONTACT_METHODS,
  fieldErrors,
  offerEnquirySchema,
  type FieldErrorCode,
  type FieldErrors,
  type OfferEnquiryRequest,
} from '@/lib/offerEnquiry'
import { postJson } from '@/lib/submitEnquiry'
import { enquirySource } from '@/lib/utm'
import { cn } from '@/lib/utils'
import type { OfferDetailData, OffersPageDoc } from '@/sanity/types'

const ENDPOINT = '/api/offer-enquiry'
/** The phone check is UAE-only, so the prefix is fixed rather than content. */
const PHONE_PREFIX = '+971'

interface Values {
  fullName: string
  email: string
  phone: string
  model: string
  contactMethod: string
  consent: boolean
}

const EMPTY: Values = { fullName: '', email: '', phone: '', model: '', contactMethod: '', consent: false }

const LABEL = 'text-xs leading-4 tracking-[0.15em] uppercase text-[#5a5a5a]'

/**
 * The enquiry form on an offer page. Checked in the browser with the same
 * zod schema the API uses; the API's verdict wins. All copy is the Offers
 * page document, error messages are ui.ts.
 */
export default function OfferEnquiryForm({
  offer,
  page,
}: {
  offer: OfferDetailData
  page?: OffersPageDoc | null
}) {
  const { t, locale } = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const sentRef = useRef<HTMLHeadingElement>(null)
  const [values, setValues] = useState<Values>(EMPTY)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const models = offer.modelOptions ?? []
  const modelKey = models.map((m) => m.en).join('|')
  const schema = useMemo(() => offerEnquirySchema(modelKey ? modelKey.split('|') : []), [modelKey])

  // Move focus to the confirmation so screen readers announce it.
  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus()
  }, [status])

  const message = (code?: FieldErrorCode) => (code ? ui(locale, code) : undefined)

  const set = <K extends keyof Values>(field: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setFormError('')
  }

  const focusFirstInvalid = () =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[data-invalid="true"]')?.focus())

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (status === 'sending') return

    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      focusFirstInvalid()
      return
    }

    setStatus('sending')
    const payload: OfferEnquiryRequest = { ...values, offerId: offer._id, locale, source: enquirySource(), website }
    try {
      const response = await postJson(ENDPOINT, payload)
      if (response.ok) {
        setStatus('sent')
        return
      }
      const body = (await response.json().catch(() => ({}))) as { fields?: FieldErrors }
      if (response.status === 400 && body.fields) {
        setErrors(body.fields)
        focusFirstInvalid()
      } else {
        setFormError(
          ui(locale, response.status === 404 ? 'offerEnded' : response.status === 429 ? 'tooManyEnquiries' : 'enquiryFailed'),
        )
      }
    } catch {
      setFormError(ui(locale, 'enquiryFailed'))
    }
    setStatus('idle')
  }

  if (status === 'sent') {
    return (
      <div className="bg-white p-6 text-black sm:p-10">
        <h2 ref={sentRef} tabIndex={-1} className={cn(SECTION_HEADING, 'outline-none')}>
          {t(page?.successHeading)}
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#5a5a5a]">{t(page?.successBody)}</p>
      </div>
    )
  }

  // {privacy} in the consent text becomes the CMS privacy link.
  const consentText = t(page?.consent)
    .split(/(\{privacy\})/)
    .map((part, i) =>
      part === '{privacy}' ? (
        <CmsLink key={i} link={page?.privacyLink} className="underline decoration-1 underline-offset-2" />
      ) : (
        part
      ),
    )

  const sending = status === 'sending'
  const methodLabel = { phone: page?.contactPhone, email: page?.contactEmail, whatsapp: page?.contactWhatsapp }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="enquire-heading"
      className="relative bg-white p-6 text-black sm:p-10"
    >
      <h2 id="enquire-heading" className={SECTION_HEADING}>
        {t(page?.formHeading)}
      </h2>
      {t(page?.formIntro) ? (
        <p className="mt-3 text-sm font-light leading-5 text-[#5a5a5a]">{t(page?.formIntro)}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-6">
        <TextField
          label={t(page?.fullName)}
          name="fullName"
          autoComplete="name"
          maxLength={120}
          required
          value={values.fullName}
          onChange={(v) => set('fullName', v)}
          error={message(errors.fullName)}
        />
        <TextField
          label={t(page?.email)}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={200}
          required
          value={values.email}
          onChange={(v) => set('email', v)}
          error={message(errors.email)}
        />
        <TextField
          label={t(page?.phone)}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          prefix={PHONE_PREFIX}
          placeholder={t(page?.phonePlaceholder)}
          maxLength={20}
          required
          value={values.phone}
          onChange={(v) => set('phone', v)}
          error={message(errors.phone)}
        />

        {models.length ? (
          <label className="flex flex-col gap-2">
            <span className={LABEL}>{t(page?.model)}</span>
            <select
              name="model"
              required
              value={values.model}
              onChange={(e) => set('model', e.target.value)}
              data-invalid={errors.model ? 'true' : 'false'}
              aria-invalid={!!errors.model}
              className={cn(
                'border bg-white px-4 py-4 text-sm leading-5 text-black outline-none transition-colors',
                errors.model ? 'border-[#d32f2f]' : 'border-black/20 focus:border-black',
              )}
            >
              <option value="" disabled>
                {t(page?.modelPlaceholder)}
              </option>
              {models.map((m) => (
                <option key={m._key} value={m.en ?? ''}>
                  {t(m)}
                </option>
              ))}
            </select>
            <FieldError message={message(errors.model)} />
          </label>
        ) : null}

        <fieldset className="min-w-0">
          <legend className={LABEL}>{t(page?.contactMethod)}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CONTACT_METHODS.map((method) => {
              const selected = values.contactMethod === method
              return (
                <label
                  key={method}
                  className={cn(
                    'flex cursor-pointer items-center justify-center border px-2 py-3 text-center text-sm leading-5 transition-colors',
                    CARD_FOCUS,
                    selected ? 'border-black bg-lotus-yellow font-semibold' : 'border-black/20 hover:border-black',
                  )}
                >
                  <input
                    type="radio"
                    name="contactMethod"
                    value={method}
                    checked={selected}
                    onChange={() => set('contactMethod', method)}
                    data-invalid={errors.contactMethod ? 'true' : 'false'}
                    aria-invalid={!!errors.contactMethod}
                    className="sr-only"
                  />
                  {t(methodLabel[method])}
                </label>
              )
            })}
          </div>
          <FieldError message={message(errors.contactMethod)} />
        </fieldset>

        <div>
          <Checkbox checked={values.consent} invalid={!!errors.consent} onChange={(checked) => set('consent', checked)}>
            {consentText}
          </Checkbox>
          <div className="ms-9">
            <FieldError message={message(errors.consent)} />
          </div>
        </div>

        {/* Honeypot: off-screen and skipped by keyboard and screen readers, so only bots fill it. */}
        <div aria-hidden="true" className="absolute -start-[10000px] top-0 h-px w-px overflow-hidden">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        {formError ? (
          <p role="alert" className="border border-[#d32f2f] bg-[#d32f2f]/5 p-4 text-sm leading-5">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-lotus-yellow py-5 text-sm font-semibold uppercase leading-5 tracking-[0.15em] text-black transition-colors hover:bg-[#e6c800] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? t(page?.submitting) : t(page?.submit)}
        </button>
      </div>
    </form>
  )
}
