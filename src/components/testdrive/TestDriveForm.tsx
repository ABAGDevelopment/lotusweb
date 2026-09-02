import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import {
  SHOWROOM_OPTIONS_QUERY,
  TEST_DRIVE_QUERY,
  VEHICLE_LINKS_QUERY,
} from '@/sanity/queries'
import { submitEnquiry } from '@/lib/submitEnquiry'
import { cn } from '@/lib/utils'
import TextField from './TextField'
import SelectTile from './SelectTile'
import type { Showroom, TestDrivePage, Vehicle } from '@/sanity/types'

type Field = 'fullName' | 'email' | 'phone' | 'model' | 'location' | 'preferredDate' | 'message'
type Values = Record<Field, string>
type Errors = Partial<Record<Field | 'consent' | 'form', string>>

const EMPTY: Values = {
  fullName: '', email: '', phone: '', model: '', location: '', preferredDate: '', message: '',
}

/** Which fields each step is responsible for, so validation stays per-step. */
const STEP_FIELDS: Field[][] = [['model'], ['location', 'preferredDate'], ['fullName', 'email', 'phone']]
const TOTAL_STEPS = 3

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Three-step enquiry form, shared by the modal and the /test-drive page.
 * Splitting it keeps the modal compact and lets each step carry its own
 * validation, so a mistake is reported next to the field that caused it.
 */
export default function TestDriveForm({
  initialModel,
  onSuccess,
}: {
  initialModel?: string
  onSuccess?: (name: string) => void
}) {
  const { t, locale } = useLocale()
  const { data } = useLiveQuery<TestDrivePage>(TEST_DRIVE_QUERY)
  const { data: vehicles } = useLiveQuery<Vehicle[]>(VEHICLE_LINKS_QUERY)
  const { data: showrooms } = useLiveQuery<Showroom[]>(SHOWROOM_OPTIONS_QUERY)

  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Values>(EMPTY)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)

  // Arriving from a car card or detail page: preselect and skip step 1.
  useEffect(() => {
    if (!initialModel) return
    setValues((v) => (v.model ? v : { ...v, model: initialModel }))
    setStep((s) => (s === 0 ? 1 : s))
  }, [initialModel])

  const L = data?.labels
  const req = t(L?.required, 'This field is required')

  const set = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined, form: undefined }))
  }

  const validateStep = (index: number): Errors => {
    const next: Errors = {}
    for (const field of STEP_FIELDS[index]) {
      if (!values[field].trim()) next[field] = req
    }
    if (index === 2) {
      if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        next.email = t(L?.invalidEmail, 'Enter a valid email address')
      }
      if (!consent) next.consent = req
    }
    return next
  }

  const goNext = () => {
    const found = validateStep(step)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (step < TOTAL_STEPS - 1) {
      goNext()
      return
    }
    const found = validateStep(2)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[data-invalid="true"]')?.focus()
      return
    }
    setSending(true)
    try {
      await submitEnquiry({ ...values, locale })
      onSuccess?.(values.fullName)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : String(error) })
      setSending(false)
    }
  }

  const stepTitles = useMemo(
    () => [t(L?.model, 'Model'), t(L?.location, 'Location'), ui(locale, 'yourDetails')],
    [L, t, locale],
  )

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {stepTitles.map((title, i) => (
          <div key={title} className="flex-1">
            <div
              className={cn(
                'h-0.5 rounded-full transition-colors',
                i <= step ? 'bg-lotus-yellow' : 'bg-lotus-border',
              )}
            />
            <span
              className={cn(
                'mt-2 block text-[10px] font-bold tracking-widest uppercase',
                i === step ? 'text-lotus-yellow' : 'text-lotus-text-faint',
              )}
            >
              {i + 1}. {title}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 — car */}
      {step === 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(vehicles ?? []).map((v) => (
              <SelectTile
                key={v._id}
                title={t(v.name)}
                image={v.image}
                selected={values.model === v.slug}
                onSelect={() => set('model', v.slug ?? '')}
              />
            ))}
          </div>
          {errors.model ? (
            <span role="alert" className="block text-xs text-red-400">
              {errors.model}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Step 2 — showroom and date */}
      {step === 1 ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
              {t(L?.location)}
              <span className="text-lotus-yellow ms-1">*</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(showrooms ?? []).map((s) => (
                <SelectTile
                  key={s._id}
                  title={t(s.name)}
                  subtitle={t(s.address)}
                  image={s.image}
                  selected={values.location === t(s.name)}
                  onSelect={() => set('location', t(s.name))}
                />
              ))}
            </div>
            {errors.location ? (
              <span role="alert" className="block text-xs text-red-400">
                {errors.location}
              </span>
            ) : null}
          </div>

          <TextField
            label={t(L?.preferredDate, 'Preferred date')}
            type="date"
            required
            min={today()}
            value={values.preferredDate}
            onChange={(v) => set('preferredDate', v)}
            error={errors.preferredDate}
          />
        </div>
      ) : null}

      {/* Step 3 — details */}
      {step === 2 ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label={t(L?.fullName, 'Full name')}
              required
              autoComplete="name"
              value={values.fullName}
              onChange={(v) => set('fullName', v)}
              error={errors.fullName}
            />
            <TextField
              label={t(L?.email, 'Email')}
              type="email"
              required
              autoComplete="email"
              value={values.email}
              onChange={(v) => set('email', v)}
              error={errors.email}
            />
          </div>
          <TextField
            label={t(L?.phone, 'Phone')}
            type="tel"
            required
            autoComplete="tel"
            value={values.phone}
            onChange={(v) => set('phone', v)}
            error={errors.phone}
          />

          <label className="block space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
              {t(L?.message)}
            </span>
            <textarea
              rows={3}
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
            <span className="text-sm text-lotus-text-muted leading-relaxed">{t(L?.consent)}</span>
          </label>
          {errors.consent ? (
            <span role="alert" className="block text-xs text-red-400 -mt-3">
              {errors.consent}
            </span>
          ) : null}
        </div>
      ) : null}

      {errors.form ? (
        <div role="alert" className="border border-red-500/60 bg-red-500/10 rounded-sm p-4 space-y-1">
          <p className="text-sm font-bold">{t(L?.errorTitle, 'Something went wrong')}</p>
          <p className="text-sm text-lotus-text-muted">{t(L?.errorBody)}</p>
          <p className="text-xs text-lotus-text-faint font-mono break-words">{errors.form}</p>
        </div>
      ) : null}

      <div className="flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="btn-outline px-6 py-3 text-xs font-bold tracking-widest uppercase"
          >
            {ui(locale, 'back')}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className="btn-primary flex-1 py-3 text-xs font-bold tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {step < TOTAL_STEPS - 1
            ? ui(locale, 'next')
            : sending
              ? t(L?.submitting, 'Sending…')
              : t(L?.submit, 'Submit')}
        </button>
      </div>
    </form>
  )
}
