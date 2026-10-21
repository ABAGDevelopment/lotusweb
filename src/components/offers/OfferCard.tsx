import { Link } from 'react-router-dom'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatOfferDate } from '@/lib/offerEnquiry'
import type { LocaleString, OfferCardData } from '@/sanity/types'

/**
 * One offer on /offers. The button's link covers the whole card, so the card
 * is one click target with one accessible link.
 */
export default function OfferCard({
  offer,
  validUntil,
}: {
  offer: OfferCardData
  /** "Valid until {date}" from the Offers page document. */
  validUntil?: LocaleString | null
}) {
  const { t, locale, localePath } = useLocale()
  const title = t(offer.title)
  const until =
    offer.endDate && t(validUntil) ? t(validUntil).replace('{date}', formatOfferDate(offer.endDate, locale)) : ''

  return (
    <article className="group relative flex h-full flex-col border border-white/10 bg-lotus-grey has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-lotus-yellow">
      <div className="relative aspect-[3/2] overflow-hidden bg-black">
        <SanityImage
          image={offer.image}
          fallbackAlt={title}
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
          width={1200}
          focalPoint
          className="h-full w-full object-cover"
        />
        {t(offer.badge) ? (
          <p dir="auto" className="absolute start-4 top-4 bg-lotus-yellow px-3 py-1.5 text-[11px] font-semibold uppercase leading-4 tracking-[0.15em] text-black">
            {t(offer.badge)}
          </p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <h2 className="font-display break-words text-xl uppercase leading-7 text-white [--lotus-display-tracking:0.12em] rtl:[--lotus-display-tracking:normal]">
          {title}
        </h2>
        {t(offer.summary) ? (
          <p dir="auto" className="mt-3 text-sm font-light leading-6 text-[#9a9a9a]">{t(offer.summary)}</p>
        ) : null}
        {until ? <p className="mt-5 text-xs leading-4 text-lotus-text-muted">{until}</p> : null}
        <div className="mt-auto pt-8">
          <Link
            to={localePath(`/offers/${offer.slug}`)}
            className="inline-flex border border-lotus-yellow px-6 py-3 text-xs font-semibold uppercase leading-4 tracking-[0.15em] text-lotus-yellow transition-colors after:absolute after:inset-0 focus-visible:outline-none group-hover:bg-lotus-yellow group-hover:text-black"
          >
            {t(offer.ctaLabel)}
            <span className="sr-only"> {title}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
