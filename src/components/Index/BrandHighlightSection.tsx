import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { BrandHighlightData } from '@/sanity/types'

/** Figma's outlined "Explore" button, same as the hero's secondary CTA. */
const OUTLINE_CTA =
  'border border-white px-8 py-4 text-center text-xs font-medium tracking-[0.15em] uppercase text-white transition-colors hover:border-lotus-yellow hover:text-lotus-yellow'

/**
 * Full-bleed model highlight (Figma "Section - EVIJA", 1440×700). From 1024px
 * the photo fills the section at Figma's proportions and the copy sits
 * bottom-start over a gradient; below that the photo stacks above the copy.
 */
export default function BrandHighlightSection({
  data,
}: {
  data?: BrandHighlightData | null
}) {
  const { t } = useLocale()
  if (!data) return null

  return (
    <section
      id="highlight"
      aria-labelledby="highlight-title"
      className="relative bg-black text-white lg:flex lg:items-end lg:aspect-[1440/700]"
    >
      <div className="relative aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
        <SanityImage
          image={data.image}
          fallbackAlt={t(data.heading)}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-r rtl:bg-gradient-to-l from-black via-black/40 to-transparent" />
      </div>

      {/* Figma's column is 576px; 640 keeps "LOTUS EVIJA" on one line in the
          site's headline face, which runs wider than Figma's Archivo. */}
      <div className="relative px-5 md:px-8 py-12 lg:w-full lg:max-w-[640px] lg:px-[88px] lg:pt-0 lg:pb-20">
        {t(data.eyebrow) ? (
          <p className="mb-4 text-xs tracking-[0.3em] uppercase text-lotus-yellow">
            {t(data.eyebrow)}
          </p>
        ) : null}
        {/* Wide tracking goes through the variable .font-display pins with
            !important; Arabic must not be letter-spaced. */}
        <h2
          id="highlight-title"
          className="font-display text-[30px] leading-[1.25] lg:text-[48px] lg:leading-[48px] uppercase break-words text-lotus-yellow mb-5 [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]"
        >
          {t(data.heading)}
        </h2>
        {t(data.body) ? (
          <p className="max-w-[400px] whitespace-pre-line text-sm leading-6 lg:text-base font-light mb-8">
            {t(data.body)}
          </p>
        ) : null}

        {(data.stats ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
            {(data.stats ?? []).map((stat) => (
              <div key={stat._key} className="min-w-0">
                <div className="text-2xl font-light">
                  {stat.value}
                  {stat.unit ? <span className="text-lotus-yellow text-base">{stat.unit}</span> : null}
                </div>
                <div className="mt-1 text-xs uppercase text-white/70">{t(stat.label)}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          <CmsLink link={data.primaryCta} className={OUTLINE_CTA} />
          <CmsLink link={data.secondaryCta} className={OUTLINE_CTA} />
        </div>
      </div>
    </section>
  )
}
