import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import errorIcon from '@/assets/test-drive/error.svg'

/**
 * Defined at module scope, NOT inside the form.
 *
 * A component declared inside another component's render body is a brand new
 * type on every render, so React unmounts and remounts it — which drops focus
 * after every keystroke. That was the original bug here; keep this out here.
 *
 * Figma "Book a test drive" field: grey caps label, white box, red border,
 * icon and message when invalid. `prefix` is the grey country-code box.
 */
const TextField = forwardRef<
  HTMLInputElement,
  {
    label: string
    value: string
    onChange?: (value: string) => void
    type?: string
    placeholder?: string
    prefix?: string
    disabled?: boolean
    error?: string
    autoComplete?: string
    className?: string
  }
>(({ label, value, onChange, type = 'text', placeholder, prefix, disabled, error, autoComplete, className }, ref) => (
  <label className={cn('flex flex-col gap-2', className)}>
    <span className="text-xs leading-4 tracking-[0.15em] uppercase text-[#5a5a5a]">{label}</span>
    {/* A number with its country code reads left to right in Arabic too. */}
    <span className="relative flex" dir={prefix ? 'ltr' : undefined}>
      {prefix ? (
        <span
          className="flex items-center border border-e-0 border-black/20 bg-[#f7f7f7] px-4 text-sm text-black"
        >
          {prefix}
        </span>
      ) : null}
      <input
        ref={ref}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        data-invalid={error ? 'true' : 'false'}
        aria-invalid={!!error}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'min-w-0 flex-1 border bg-white px-[17px] py-4 text-sm leading-5 text-black outline-none transition-colors placeholder:text-[#9ca3af]',
          'disabled:bg-[#f7f7f7] disabled:opacity-70',
          error ? 'border-[#d32f2f] pe-[41px]' : 'border-black/20 focus:border-black',
        )}
      />
      {error ? (
        <img
          src={errorIcon}
          alt=""
          width={14}
          height={14}
          className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2"
        />
      ) : null}
    </span>
    {error ? (
      <span role="alert" className="text-xs leading-4 text-[#d32f2f]">
        {error}
      </span>
    ) : null}
  </label>
))

TextField.displayName = 'TextField'
export default TextField
