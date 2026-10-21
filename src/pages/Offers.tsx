import { useMemo } from 'react'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import CmsLink from '@/components/common/CmsLink'
import PageSkeleton from '@/components/common/PageSkeleton'
import PageTitleBand from '@/components/common/PageTitleBand'
import SiteHead from '@/components/common/SiteHead'
import OfferCard from '@/components/offers/OfferCard'
import { SECTION_X } from '@/components/testdrive/TestDriveForm'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { dubaiToday } from '@/lib/offerEnquiry'
import { cn } from '@/lib/utils'
import { OFFERS_QUERY } from '@/sanity/queries'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import type { OfferCardData, OffersPageDoc } from '@/sanity/types'

/**
 * /offers: every published offer that is live today in the UAE, in the
 * editors' sort order. Page copy is the Offers page document.
 */
export default function Offers() {
  const { t, locale } = useLocale()
  const today = useMemo(() => dubaiToday(), [])
  const { data, loading, error } = useLiveQuery<{
    page: OffersPageDoc | null
    offers: OfferCardData[] | null
  }>(OFFERS_QUERY, { today })

  if (loading && !data) return <PageSkeleton />

  const page = data?.page
  const offers = data?.offers ?? []

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <SiteHead
        title={t(page?.seo?.title) || t(page?.heading)}
        description={t(page?.seo?.description) || t(page?.intro)}
        image={page?.seo?.ogImage ?? page?.image}
      />
      <Navbar />
      <main>
        <PageTitleBand heading={t(page?.heading)} intro={t(page?.intro)} image={page?.image} />

        <section className={cn('bg-lotus-black py-14 lg:py-20', SECTION_X)}>
          {offers.length ? (
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer) => (
                <li key={offer._id}>
                  <OfferCard offer={offer} validUntil={page?.validUntil} />
                </li>
              ))}
            </ul>
          ) : error && !data ? (
            <p role="alert" className="max-w-xl text-base font-light leading-6 text-[#9a9a9a]">
              {ui(locale, 'offersLoadFailed')}
            </p>
          ) : (
            <div className="max-w-xl">
              <p className="whitespace-pre-line text-base font-light leading-6 text-[#9a9a9a]">
                {t(page?.emptyState)}
              </p>
              <CmsLink
                link={{ href: '/test-drive' }}
                className="mt-8 inline-flex border border-lotus-yellow px-6 py-3 text-xs font-semibold uppercase leading-4 tracking-[0.15em] text-lotus-yellow transition-colors hover:bg-lotus-yellow hover:text-black"
              >
                {ui(locale, 'bookTestDrive')}
              </CmsLink>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
