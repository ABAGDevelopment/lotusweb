import type { CSSProperties } from 'react'

const DIGITS = [...'0123456789']

/**
 * A spec value whose digits roll up from 0 like an odometer. Anything that
 * isn't a digit ("s", " HP", ".") renders as plain text.
 *
 * Each run of digits ("2.95", "0-100") is its own LTR isolate. The digit
 * windows are inline-blocks, which the bidi algorithm treats as neutral, so
 * on the Arabic page they would otherwise lay out right-to-left: 905 → 509.
 *
 * dir="auto" takes the direction from the first letter: "918 حصان" stays
 * right-to-left, while an untranslated unit ("15 min") reads left-to-right.
 */
export default function FlipNumber({ value, rolled }: { value: string; rolled: boolean }) {
  let digit = 0

  return (
    <span className="flip-number" dir="auto" aria-label={value}>
      {/* aria-label on a plain span is ignored by most screen readers. */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {value.split(/(\d[\d.,\-–]*)/).map((part, i) =>
          i % 2 === 0 ? (
            part
          ) : (
            <span key={i} dir="ltr" className="flip-run">
              {[...part].map((ch, j) => {
                if (!/\d/.test(ch)) return ch
                const style = {
                  '--d': rolled ? Number(ch) : 0,
                  transitionDelay: `${digit++ * 80}ms`,
                } as CSSProperties
                return (
                  <span key={j} className="flip-digit">
                    <span className="flip-strip" style={style}>
                      {DIGITS.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </span>
                  </span>
                )
              })}
            </span>
          ),
        )}
      </span>
    </span>
  )
}
