import { useLocale } from '@/i18n/LocaleProvider'
import type { MarqueeSectionData } from '@/sanity/types'

export default function MarqueeSection({ data }: { data?: MarqueeSectionData | null }) {
  const { t } = useLocale()

  if (!data || data.enabled === false) return null

  const items = (data.items ?? []).map((item) => t(item)).filter(Boolean)
  if (items.length === 0) return null

  // The strip is duplicated so the -50% keyframe loops seamlessly.
  const line = `${items.join(' • ')} • `

  return (
    <section className="py-12 border-y border-lotus-border overflow-hidden">
      <div className="marquee-container">
        <div
          className="marquee-content font-display text-4xl lg:text-6xl font-bold uppercase tracking-widest-plus text-outline"
          style={{ animationDuration: `${data.speedSeconds ?? 20}s` }}
        >
          <span>{line}</span>
          <span aria-hidden="true">{line}</span>
        </div>
      </div>
    </section>
  )
}
