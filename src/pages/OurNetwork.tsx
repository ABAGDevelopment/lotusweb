import type { ReactNode } from 'react'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import CmsLink from '@/components/common/CmsLink'
import PageSkeleton from '@/components/common/PageSkeleton'
import PageTitleBand from '@/components/common/PageTitleBand'
import SanityImage from '@/components/common/SanityImage'
import SiteHead from '@/components/common/SiteHead'
import { SECTION_X } from '@/components/testdrive/TestDriveForm'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { cn } from '@/lib/utils'
import { OUR_NETWORK_QUERY } from '@/sanity/queries'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import type { LocaleString, OurNetworkPageDoc, Showroom } from '@/sanity/types'

/** One labelled fact about a branch; skipped when the CMS has no label or value. */
function Detail({ label, children }: { label?: LocaleString | null; children: ReactNode }) {
  const { t } = useLocale()
  if (!t(label) || !children) return null
  return (
    <div>
      <dt className="text-xs uppercase leading-4 tracking-[0.15em] text-lotus-text-muted">{t(label)}</dt>
      <dd dir="auto" className="mt-3 whitespace-pre-line text-base font-light leading-6 text-white">
        {children}
      </dd>
    </div>
  )
}

const external = (href: string) => /^https?:/.test(href)

function Branch({ showroom: s }: { showroom: Showroom }) {
  const { t } = useLocale()
  const name = t(s.name)
  const contact = t(s.contactText)

  return (
    <li className="grid gap-8 border-t border-white/10 py-12 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-16">
      <div className="relative aspect-[4/3] overflow-hidden bg-lotus-grey">
        <SanityImage
          image={s.image}
          fallbackAlt={name}
          focalPoint
          sizes="(min-width: 1024px) 40vw, 100vw"
          width={1200}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-col">
        <h2 className="font-display break-words text-2xl uppercase leading-8 text-white lg:text-4xl lg:leading-[44px] [--lotus-display-tracking:0.14em] rtl:[--lotus-display-tracking:normal]">
          {name}
        </h2>
        {t(s.branchType) ? (
          <p className="mt-3 text-sm leading-5 text-lotus-yellow">{t(s.branchType)}</p>
        ) : null}

        <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          <Detail label={s.locationLabel}>{t(s.address)}</Detail>
          <Detail label={s.contactLabel}>
            {contact && s.contactHref ? (
              <CmsLink
                link={{ href: s.contactHref, external: external(s.contactHref) }}
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-lotus-yellow"
              >
                {contact}
              </CmsLink>
            ) : (
              contact
            )}
          </Detail>
          <Detail label={s.hoursLabel}>{t(s.hours)}</Detail>
          <Detail label={s.serviceHoursLabel}>{t(s.serviceHours)}</Detail>
        </dl>

        {s.directionsHref && t(s.directionsLinkText) ? (
          <CmsLink
            link={{ href: s.directionsHref, external: external(s.directionsHref) }}
            className="mt-10 inline-flex self-start bg-lotus-yellow px-6 py-3 text-xs font-semibold uppercase leading-4 tracking-[0.15em] text-black transition-colors hover:bg-[#e6c800] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lotus-yellow"
          >
            {t(s.directionsLinkText)}
          </CmsLink>
        ) : null}
      </div>
    </li>
  )
}

/**
 * /our-network: every Lotus branch in the UAE. Each branch is a Showroom
 * document; the heading and copy are the Our network page document.
 */
export default function OurNetwork() {
  const { t, locale } = useLocale()
  const { data, loading, error } = useLiveQuery<{
    page: OurNetworkPageDoc | null
    showrooms: Showroom[] | null
  }>(OUR_NETWORK_QUERY)

  if (loading && !data) return <PageSkeleton />

  const page = data?.page
  const showrooms = data?.showrooms ?? []
  const count = t(page?.countLabel).replace('{count}', String(showrooms.length))

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <SiteHead
        title={t(page?.seo?.title) || t(page?.heading)}
        description={t(page?.seo?.description) || t(page?.intro)}
        image={page?.seo?.ogImage ?? page?.image}
      />
      <Navbar />
      <main>
        <PageTitleBand heading={t(page?.heading)} intro={t(page?.intro)} image={page?.image}>
          {showrooms.length && count ? (
            <p className="mt-6 text-xs uppercase leading-4 tracking-[0.15em] text-lotus-text-muted">{count}</p>
          ) : null}
        </PageTitleBand>

        <section className={cn('bg-lotus-black py-14 lg:py-20', SECTION_X)}>
          {showrooms.length ? (
            <ul>
              {showrooms.map((s) => (
                <Branch key={s._id} showroom={s} />
              ))}
            </ul>
          ) : error && !data ? (
            <p role="alert" className="max-w-xl text-base font-light leading-6 text-[#9a9a9a]">
              {ui(locale, 'networkLoadFailed')}
            </p>
          ) : (
            <p className="max-w-xl whitespace-pre-line text-base font-light leading-6 text-[#9a9a9a]">
              {t(page?.emptyState)}
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
