import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import SanityImage from '@/components/common/SanityImage'
import PageSkeleton from '@/components/common/PageSkeleton'
import { useLocale } from '@/i18n/LocaleProvider'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import { TEST_DRIVE_QUERY, VEHICLE_LINKS_QUERY } from '@/sanity/queries'
import { submitEnquiry } from '@/lib/submitEnquiry'
import { cn } from '@/lib/utils'
import type { TestDrivePage, Vehicle } from '@/sanity/types'

type Fields = 'fullName' | 'email' | 'phone' | 'model' | 'preferredDate' | 'message'
type Values = Record<Fields, string>
type Errors = Partial<Record<Fields | 'consent' | 'form', string>>

const EMPTY: Values = {
  fullName: '',
  email: '',
  phone: '',
  model: '',
  preferredDate: '',
  message: '',
}

export default function TestDrive() {
  const { t, locale, localePath } = useLocale()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const { data, loading } = useLiveQuery<TestDrivePage>(TEST_DRIVE_QUERY)
  const { data: vehicles } = useLiveQuery<Vehicle[]>(VEHICLE_LINKS_QUERY)

  const [values, setValues] = useState<Values>(EMPTY)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)

  // Deep link from a vehicle page: /test-drive?model=emira
  useEffect(() => {
    const model = params.get('model')
    if (model) setValues((v) => (v.model ? v : { ...v, model }))
  }, [params])

  if (loading && !data) return <PageSkeleton />

  const L = data?.labels
  const req = t(L?.required, 'This field is required')

  const set = (field: Fields, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined, form: undefined }))
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!values.fullName.trim()) next.fullName = req
    if (!values.email.trim()) next.email = req
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = t(L?.invalidEmail, 'Enter a valid email address')
    }
    if (!values.phone.trim()) next.phone = req
    if (!values.model.trim()) next.model = req
    if (!consent) next.consent = req
    return next
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem rather than leaving the user hunting.
      const first = document.querySelector<HTMLElement>('[data-invalid="true"]')
      first?.focus()
      return
    }

    setSending(true)
    try {
      await submitEnquiry({ ...values, locale })
      navigate(localePath('/test-drive/thank-you'), {
        replace: true,
        state: { name: values.fullName },
      })
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : String(error),
      })
      setSending(false)
    }
  }

  const field = (
    name: Fields,
    type: 'text' | 'email' | 'tel' | 'date' = 'text',
    required = true,
  ) => (
    <label className="block space-y-2">
      <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
        {t(L?.[name])}
        {required ? <span className="text-lotus-yellow ms-1">*</span> : null}
      </span>
      <input
        type={type}
        value={values[name]}
        data-invalid={errors[name] ? 'true' : 'false'}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={(e) => set(name, e.target.value)}
        className={cn(
          'w-full bg-transparent border px-4 py-3 text-sm outline-none transition-colors',
          errors[name]
            ? 'border-red-500 focus:border-red-400'
            : 'border-lotus-border focus:border-lotus-yellow',
        )}
      />
      {errors[name] ? (
        <span id={`${name}-error`} role="alert" className="block text-xs text-red-400">
          {errors[name]}
        </span>
      ) : null}
    </label>
  )

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <Navigation />
      <main className="pt-32 pb-24 px-8 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            {t(data?.eyebrow) ? (
              <span className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
                {t(data?.eyebrow)}
              </span>
            ) : null}
            <h1 className="font-display text-5xl lg:text-7xl font-bold uppercase tracking-tighter leading-none">
              {t(data?.heading)}
            </h1>
            <p className="text-lg text-lotus-text-muted leading-relaxed">{t(data?.intro)}</p>
            {data?.image ? (
              <SanityImage
                image={data.image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full aspect-[4/3] object-cover rounded-sm mt-8"
              />
            ) : null}
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {field('fullName')}
            {field('email', 'email')}
            {field('phone', 'tel')}

            <label className="block space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
                {t(L?.model)}
                <span className="text-lotus-yellow ms-1">*</span>
              </span>
              <select
                value={values.model}
                data-invalid={errors.model ? 'true' : 'false'}
                aria-invalid={!!errors.model}
                onChange={(e) => set('model', e.target.value)}
                className={cn(
                  'w-full bg-lotus-black border px-4 py-3 text-sm outline-none transition-colors',
                  errors.model
                    ? 'border-red-500'
                    : 'border-lotus-border focus:border-lotus-yellow',
                )}
              >
                <option value="">{t(data?.modelPlaceholder, '—')}</option>
                {(vehicles ?? []).map((v) => (
                  <option key={v._id} value={v.slug ?? ''}>
                    {t(v.name)}
                  </option>
                ))}
              </select>
              {errors.model ? (
                <span role="alert" className="block text-xs text-red-400">
                  {errors.model}
                </span>
              ) : null}
            </label>

            {field('preferredDate', 'date', false)}

            <label className="block space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
                {t(L?.message)}
              </span>
              <textarea
                rows={4}
                value={values.message}
                onChange={(e) => set('message', e.target.value)}
                className="w-full bg-transparent border border-lotus-border focus:border-lotus-yellow px-4 py-3 text-sm outline-none transition-colors"
              />
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                data-invalid={errors.consent ? 'true' : 'false'}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  setErrors((x) => ({ ...x, consent: undefined }))
                }}
                className="mt-1 accent-lotus-yellow w-4 h-4"
              />
              <span className="text-sm text-lotus-text-muted leading-relaxed">
                {t(L?.consent)}
              </span>
            </label>
            {errors.consent ? (
              <span role="alert" className="block text-xs text-red-400 -mt-4">
                {errors.consent}
              </span>
            ) : null}

            {errors.form ? (
              <div
                role="alert"
                className="border border-red-500/60 bg-red-500/10 rounded-sm p-4 space-y-1"
              >
                <p className="text-sm font-bold">{t(L?.errorTitle, 'Something went wrong')}</p>
                <p className="text-sm text-lotus-text-muted">{t(L?.errorBody)}</p>
                <p className="text-xs text-lotus-text-faint font-mono break-words">
                  {errors.form}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? t(L?.submitting, 'Sending…') : t(L?.submit, 'Submit')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
