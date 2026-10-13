import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import SanityImage from '@/components/common/SanityImage'
import CmsLink from '@/components/common/CmsLink'
import { useLocale } from '@/i18n/LocaleProvider'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import { TEST_DRIVE_QUERY } from '@/sanity/queries'
import type { TestDrivePage } from '@/sanity/types'

export default function ThankYou() {
  const { t, localePath } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useLiveQuery<TestDrivePage>(TEST_DRIVE_QUERY)

  const name = (location.state as { name?: string } | null)?.name

  // Landing here directly (bookmark, refresh, shared link) means there was no
  // submission to thank anyone for. Send them to the form instead.
  useEffect(() => {
    if (!location.state) {
      navigate(localePath('/test-drive'), { replace: true })
    }
  }, [location.state, navigate, localePath])

  const thanks = data?.thankYou

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <Navbar />
      <main className="relative min-h-[70vh] flex items-center pt-32 pb-24 px-5 md:px-8 lg:px-20 overflow-hidden">
        {thanks?.image ? (
          <div className="absolute inset-0 z-0">
            <SanityImage
              image={thanks.image}
              sizes="100vw"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-lotus-black/70" />
          </div>
        ) : null}

        <div className="relative z-10 max-w-3xl space-y-8">
          {t(thanks?.eyebrow) ? (
            <span className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
              {t(thanks?.eyebrow)}
            </span>
          ) : null}
          <h1 className="font-display text-5xl lg:text-8xl font-bold uppercase tracking-tighter leading-none">
            {name ? `${t(thanks?.heading)} ${name}` : t(thanks?.heading)}
          </h1>
          <p className="text-lg text-lotus-text-muted leading-relaxed max-w-2xl">
            {t(thanks?.body)}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {thanks?.primaryCta ? (
              <CmsLink
                link={thanks.primaryCta}
                className="btn-primary px-10 py-4 text-sm font-bold tracking-widest uppercase"
              />
            ) : (
              <Link
                to={localePath('/')}
                className="btn-primary px-10 py-4 text-sm font-bold tracking-widest uppercase"
              >
                Home
              </Link>
            )}
            {thanks?.secondaryCta ? (
              <CmsLink
                link={thanks.secondaryCta}
                className="btn-outline px-10 py-4 text-sm font-bold tracking-widest uppercase"
              />
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
