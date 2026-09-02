import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Defined at module scope, NOT inside the form.
 *
 * A component declared inside another component's render body is a brand new
 * type on every render, so React unmounts and remounts it — which drops focus
 * after every keystroke and closes the native date picker. That was the
 * original bug here; keep this out here.
 */
const TextField = forwardRef<HTMLInputElement, {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  error?: string
  min?: string
  autoComplete?: string
}>(({ label, value, onChange, type = 'text', required, error, min, autoComplete }, ref) => (
  <label className="block space-y-2">
    <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
      {label}
      {required ? <span className="text-lotus-yellow ms-1">*</span> : null}
    </span>
    <input
      ref={ref}
      type={type}
      value={value}
      min={min}
      autoComplete={autoComplete}
      data-invalid={error ? 'true' : 'false'}
      aria-invalid={!!error}
      onChange={(e) => onChange(e.target.value)}
      // color-scheme makes the native date picker legible on a dark field;
      // without it the calendar icon renders black on black.
      className={cn(
        'w-full bg-transparent border px-4 py-3 text-sm outline-none transition-colors [color-scheme:dark]',
        error
          ? 'border-red-500 focus:border-red-400'
          : 'border-lotus-border focus:border-lotus-yellow',
      )}
    />
    {error ? (
      <span role="alert" className="block text-xs text-red-400">
        {error}
      </span>
    ) : null}
  </label>
))

TextField.displayName = 'TextField'
export default TextField
