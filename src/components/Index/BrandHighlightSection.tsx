import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { BrandHighlightData } from '@/sanity/types'

export default function BrandHighlightSection({
  data,
}: {
  data?: BrandHighlightData | null
}) {
  const { t } = useLocale()
  if (!data) return null

  return (
    <section className="py-24 px-8 lg:px-20 border-t border-lotus-border" id="highlight">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-video lg:aspect-auto lg:h-[600px] overflow-hidden rounded-sm bg-lotus-grey">
          <SanityImage
            image={data.image}
            fallbackAlt={t(data.heading)}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-8">
          {t(data.eyebrow) ? (
            <span className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
              {t(data.eyebrow)}
            </span>
          ) : null}
          <h2 className="font-display text-6xl lg:text-8xl font-bold uppercase tracking-tighter leading-none">
            {t(data.heading)}
          </h2>
          <p className="text-lg text-lotus-text-muted leading-relaxed max-w-xl">
            {t(data.body)}
          </p>

          {(data.stats ?? []).length > 0 ? (
            <div className="grid grid-cols-2 gap-8">
              {(data.stats ?? []).map((stat) => (
                <div key={stat._key}>
                  <div className="font-display text-5xl font-bold tracking-tighter">
                    {stat.value}
                    {stat.unit ? (
                      <span className="text-lotus-yellow text-2xl">{stat.unit}</span>
                    ) : null}
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint mt-2">
                    {t(stat.label)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex gap-4 pt-4">
            {data.primaryCta ? (
              <CmsLink
                link={data.primaryCta}
                className="btn-primary px-10 py-4 text-sm font-bold tracking-widest uppercase"
              />
            ) : null}
            {data.secondaryCta ? (
              <CmsLink
                link={data.secondaryCta}
                className="btn-outline px-10 py-4 text-sm font-bold tracking-widest uppercase"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
