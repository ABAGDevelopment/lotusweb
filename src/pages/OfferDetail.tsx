import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import PageSkeleton from '@/components/common/PageSkeleton'
import PortableText from '@/components/common/PortableText'
import SanityImage from '@/components/common/SanityImage'
import SiteHead from '@/components/common/SiteHead'
import OfferEnquiryForm from '@/components/offers/OfferEnquiryForm'
import { SECTION_X } from '@/components/testdrive/TestDriveForm'
import NotFound from '@/pages/NotFound'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { dubaiToday, formatOfferDate } from '@/lib/offerEnquiry'
import { cn } from '@/lib/utils'
import { OFFER_QUERY } from '@/sanity/queries'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import type { OfferDetailData, OffersPageDoc } from '@/sanity/types'

const LABEL = 'text-xs uppercase leading-4 tracking-[0.15em] text-lotus-text-muted'

/**
 * /offers/:slug. An unknown, hidden, not-yet-started or ended offer is a 404:
 * the same rule the enquiry API applies, so a visible form can always send.
 */
export default function OfferDetail() {
  const { slug = '' } = useParams()
  const { t, locale, localePath } = useLocale()
  const today = useMemo(() => dubaiToday(), [])
  const { data, loading, error } = useLiveQuery<{
    page: OffersPageDoc | null
    offer: OfferDetailData | null
  }>(OFFER_QUERY, { slug, today })

  if (loading && !data) return <PageSkeleton />

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lotus-black px-8 text-center text-lotus-text-off">
        <p role="alert">{ui(locale, 'offersLoadFailed')}</p>
      </div>
    )
  }

  const offer = data?.offer
  if (!offer) return <NotFound />

  const page = data?.page
  const title = t(offer.title)
  const dates = [
    { label: page?.startsLabel, date: offer.startDate },
    { label: page?.endsLabel, date: offer.endDate },
  ].filter((d) => d.date && t(d.label))
  const terms = offer.terms?.[locale]?.length ? offer.terms[locale] : offer.terms?.en
  const body = offer.body?.[locale]?.length ? offer.body[locale] : offer.body?.en

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <SiteHead
        title={t(offer.seo?.title) || title}
        description={t(offer.seo?.description) || t(offer.summary)}
        image={offer.seo?.ogImage ?? offer.heroImage ?? offer.image}
      />
      <Navbar />
      <main>
        <section className="relative flex h-[68vh] max-h-[760px] min-h-[440px] flex-col justify-end overflow-hidden bg-black text-white">
          <SanityImage
            image={offer.heroImage?.asset ? offer.heroImage : offer.image}
            fallbackAlt={title}
            sizes="100vw"
            priority
            focalPoint
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className={cn('relative pb-10 lg:pb-16', SECTION_X)}>
            {t(offer.badge) ? (
              <p dir="auto" className="mb-5 inline-block bg-lotus-yellow px-3 py-1.5 text-[11px] font-semibold uppercase leading-4 tracking-[0.15em] text-black">
                {t(offer.badge)}
              </p>
            ) : null}
            <h1 className="font-display max-w-4xl break-words text-[34px] uppercase leading-[1.1] lg:text-[56px] [--lotus-display-tracking:0.14em] rtl:[--lotus-display-tracking:normal]">
              {title}
            </h1>
            {t(offer.summary) ? (
              <p dir="auto" className="mt-5 max-w-[560px] text-base font-light leading-6 text-white/85">{t(offer.summary)}</p>
            ) : null}
            {t(page?.formHeading) ? (
              <a
                href="#enquire"
                className="mt-8 inline-flex bg-lotus-yellow px-6 py-3 text-xs font-semibold uppercase leading-4 tracking-[0.15em] text-black lg:hidden"
              >
                {t(page?.formHeading)}
              </a>
            ) : null}
          </div>
        </section>

        <div
          className={cn(
            'grid gap-14 bg-lotus-black py-14 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-20 lg:py-20',
            SECTION_X,
          )}
        >
          <div className="min-w-0 max-w-[680px]">
            {t(page?.backToOffers) ? (
              <Link
                to={localePath('/offers')}
                className="inline-flex items-center gap-3 text-xs uppercase leading-4 tracking-[0.15em] text-lotus-text-muted transition-colors hover:text-white"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-2.5 rtl:-scale-x-100" />
                {t(page?.backToOffers)}
              </Link>
            ) : null}

            {dates.length ? (
              <dl className="mt-10 flex flex-wrap gap-x-16 gap-y-6 border-y border-white/10 py-6">
                {dates.map((d) => (
                  <div key={d.date}>
                    <dt className={LABEL}>{t(d.label)}</dt>
                    <dd className="mt-2 text-base text-white">{formatOfferDate(d.date!, locale)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <PortableText value={body} className="mt-10 text-base font-light leading-7 text-[#c8c8c8]" />

            {terms?.length ? (
              <section aria-labelledby="terms-heading" className="mt-14 border-t border-white/10 pt-10">
                <h2 id="terms-heading" className="text-sm font-semibold uppercase leading-5 tracking-[0.15em] text-white">
                  {t(page?.termsHeading)}
                </h2>
                <PortableText value={terms} className="mt-6 text-sm font-light leading-6 text-[#9a9a9a]" />
              </section>
            ) : null}
          </div>

          {/* Not sticky: the form is taller than a laptop screen, so its button would be out of reach. */}
          <aside id="enquire" className="scroll-mt-24 lg:self-start">
            <OfferEnquiryForm offer={offer} page={page} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
