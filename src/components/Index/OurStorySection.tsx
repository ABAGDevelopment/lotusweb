import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { StorySectionData } from '@/sanity/types'

export default function OurStorySection({ data }: { data?: StorySectionData | null }) {
  const { t } = useLocale()
  if (!data) return null

  const hasQuote =
    t(data.quoteBefore) || t(data.quoteHighlight) || t(data.quoteAfter)

  return (
    <section className="py-20 md:py-24 px-5 md:px-8 lg:px-20 bg-lotus-grey" id="story">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          {t(data.eyebrow) ? (
            <span className="block text-center md:inline text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
              {t(data.eyebrow)}
            </span>
          ) : null}
          <h2 className="font-display heading-display lg:text-5xl xl:text-7xl font-bold uppercase tracking-tighter leading-none">
            {t(data.heading)}
          </h2>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] overflow-hidden rounded-sm group relative">
            <SanityImage
              image={data.image}
              fallbackAlt={t(data.heading)}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-lotus-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <p className="text-sm md:text-xl font-light leading-relaxed">{t(data.leadParagraph)}</p>
            <p className="text-sm md:text-base text-lotus-text-muted leading-relaxed">{t(data.body)}</p>
            {data.link ? (
              <CmsLink
                link={data.link}
                className="text-lotus-yellow text-xs font-bold tracking-widest uppercase border-b border-lotus-yellow pb-1 w-fit hover:opacity-80 transition-opacity"
              />
            ) : null}
          </div>
        </div>
      </div>

      {hasQuote ? (
        <div className="mt-24 border-t border-lotus-border pt-12">
          <blockquote className="font-display text-3xl lg:text-5xl font-bold uppercase tracking-tight leading-tight">
            {'\u201C'}
            {t(data.quoteBefore)}
            <span className="text-lotus-yellow">{t(data.quoteHighlight)}</span>
            {t(data.quoteAfter)}
            {'\u201D'}
          </blockquote>
        </div>
      ) : null}
    </section>
  )
}
