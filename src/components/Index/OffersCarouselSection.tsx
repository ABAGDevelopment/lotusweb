import { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'
import type { OffersSectionData } from '@/sanity/types'
import { ui } from '@/i18n/ui'
import MissingContent from '@/components/common/MissingContent'

export default function OffersCarouselSection({
  data,
}: {
  data?: OffersSectionData | null
}) {
  const { t, isRtl, locale } = useLocale()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateBounds = useCallback(() => {
    const el = sliderRef.current
    if (!el) return
    // scrollLeft is negative in RTL on standards-compliant browsers.
    const progress = Math.abs(el.scrollLeft)
    const max = el.scrollWidth - el.clientWidth
    setAtStart(progress <= 4)
    setAtEnd(progress >= max - 4)
  }, [])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    updateBounds()
    el.addEventListener('scroll', updateBounds, { passive: true })
    window.addEventListener('resize', updateBounds)
    return () => {
      el.removeEventListener('scroll', updateBounds)
      window.removeEventListener('resize', updateBounds)
    }
  }, [updateBounds, data])

  const scrollBy = (direction: -1 | 1) => {
    const el = sliderRef.current
    if (!el) return
    const step = Math.min(el.clientWidth * 0.8, 640)
    el.scrollBy({ left: direction * step * (isRtl ? -1 : 1), behavior: 'smooth' })
  }

  if (!data) return null
  const offers = (data.offers ?? []).filter(Boolean)

  if (offers.length === 0) {
    return <MissingContent section={t(data.heading) || 'Exclusives'} documentType="offer" />
  }

  return (
    <section className="py-20 md:py-24 px-5 md:px-8 lg:px-20" id="offers">
      <div className="flex flex-wrap justify-center md:justify-between items-end gap-6 mb-8 md:mb-12">
        <h2 className="font-display heading-display md:text-5xl font-bold uppercase tracking-tighter">
          {t(data.heading)}
        </h2>
        <div className="hidden md:flex gap-4">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label={ui(locale, 'previousOffers')}
            className={cn(
              'w-12 h-12 border border-lotus-border flex items-center justify-center transition-colors',
              atStart
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:border-lotus-yellow hover:text-lotus-yellow',
            )}
          >
            <FontAwesomeIcon icon={isRtl ? faChevronRight : faChevronLeft} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label={ui(locale, 'nextOffers')}
            className={cn(
              'w-12 h-12 border border-lotus-border flex items-center justify-center transition-colors',
              atEnd
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:border-lotus-yellow hover:text-lotus-yellow',
            )}
          >
            <FontAwesomeIcon icon={isRtl ? faChevronLeft : faChevronRight} />
          </button>
        </div>
      </div>

      <div ref={sliderRef} className="offers-slider flex gap-6 overflow-x-auto pb-12 snap-x -mx-5 px-5 scroll-px-5 md:mx-0 md:px-0 md:scroll-px-0">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="min-w-[320px] md:min-w-[400px] snap-start relative group overflow-hidden rounded-sm"
          >
            <SanityImage
              image={offer.image}
              fallbackAlt={t(offer.title)}
              sizes="400px"
              width={900}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-lotus-black/90 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-2xl font-bold uppercase">{t(offer.title)}</h3>
              <p className="text-lotus-text-muted">{t(offer.subtitle)}</p>
              {offer.link?.href ? (
                <CmsLink
                  link={offer.link}
                  className="mt-4 w-fit text-xs font-bold tracking-widest uppercase text-lotus-yellow border-b border-lotus-yellow pb-1"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
