import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import SanityImage from '@/components/common/SanityImage'
import ZoomImage from '@/components/common/ZoomImage'
import Spin360 from '@/components/common/Spin360'
import PageSkeleton from '@/components/common/PageSkeleton'
import NotFound from '@/pages/NotFound'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import { VEHICLE_QUERY } from '@/sanity/queries'
import { cn } from '@/lib/utils'
import type { GalleryCategory, VehicleDetail as VehicleDoc } from '@/sanity/types'

const CATEGORY_LABEL: Record<GalleryCategory, { en: string; ar: string }> = {
  exterior: { en: 'Exterior', ar: 'الخارج' },
  interior: { en: 'Interior', ar: 'الداخل' },
  detail: { en: 'Detail', ar: 'التفاصيل' },
}

export default function VehicleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { t, locale, localePath, isRtl } = useLocale()
  const { data, loading } = useLiveQuery<VehicleDoc>(VEHICLE_QUERY, { slug: slug ?? '' })
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')

  const gallery = useMemo(() => {
    const all = (data?.gallery ?? []).filter(Boolean)
    return filter === 'all' ? all : all.filter((g) => g.category === filter)
  }, [data, filter])

  const categories = useMemo(() => {
    const present = new Set((data?.gallery ?? []).map((g) => g.category).filter(Boolean))
    return Array.from(present) as GalleryCategory[]
  }, [data])

  if (loading && !data) return <PageSkeleton />
  if (!data) return <NotFound />

  const frames = (data.spin360?.frames ?? []).filter(Boolean)
  const showSpin = data.spin360?.enabled !== false && frames.length > 0

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden flex items-end">
          <div className="absolute inset-0 z-0">
            <div
              className={cn(
                'absolute inset-0 z-10',
                isRtl
                  ? 'bg-gradient-to-l from-lotus-black via-lotus-black/50 to-transparent'
                  : 'bg-gradient-to-r from-lotus-black via-lotus-black/50 to-transparent',
              )}
            />
            <SanityImage
              image={data.heroImage ?? data.image}
              priority
              sizes="100vw"
              fallbackAlt={t(data.name)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container mx-auto px-5 md:px-8 lg:px-20 relative z-20 pb-16">
            <Link
              to={localePath('/#range')}
              className="text-xs font-bold tracking-widest uppercase text-lotus-text-muted hover:text-lotus-yellow transition-colors"
            >
              {isRtl ? '\u2192' : '\u2190'} {ui(locale, 'backToRange')}
            </Link>
            <h1 className="font-display text-6xl lg:text-8xl font-bold uppercase tracking-tight mt-4">
              {t(data.name)}
            </h1>
            <p className="text-lg text-lotus-text-muted mt-3 max-w-xl">{t(data.tagline)}</p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to={localePath(`/test-drive${data.slug ? `?model=${data.slug}` : ''}`)}
                className="btn-primary px-10 py-4 text-sm font-bold tracking-widest uppercase"
              >
                {ui(locale, 'bookTestDrive')}
              </Link>
            </div>
          </div>
        </section>

        {/* Overview + headline specs */}
        <section className="px-5 md:px-8 lg:px-20 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-lotus-border">
          <div className="lg:col-span-7">
            <p className="text-xl font-light leading-relaxed">{t(data.overview)}</p>
          </div>
          {(data.specs ?? []).length > 0 ? (
            <div className="lg:col-span-5 grid grid-cols-2 gap-8 self-start">
              {(data.specs ?? []).map((s) => (
                <div key={s._key}>
                  <div className="font-display text-4xl font-bold tracking-tighter">
                    {t(s.value)}
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint mt-2">
                    {t(s.label)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* 360 */}
        {showSpin ? (
          <section className="px-5 md:px-8 lg:px-20 py-20 border-b border-lotus-border">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold uppercase tracking-tighter mb-10">
              {ui(locale, 'view360')}
            </h2>
            <Spin360 frames={frames} label={`${t(data.name)} ${ui(locale, 'view360')}`} />
          </section>
        ) : null}

        {/* Gallery with zoom */}
        {(data.gallery ?? []).length > 0 ? (
          <section className="px-5 md:px-8 lg:px-20 py-20 border-b border-lotus-border">
            <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold uppercase tracking-tighter">
                {ui(locale, 'gallery')}
              </h2>
              {categories.length > 1 ? (
                <div className="flex flex-wrap gap-3">
                  {(['all', ...categories] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilter(c as GalleryCategory | 'all')}
                      className={cn(
                        'px-5 py-2 text-xs font-bold tracking-widest uppercase border transition-colors',
                        filter === c
                          ? 'border-lotus-yellow text-lotus-yellow'
                          : 'border-lotus-border text-lotus-text-muted hover:border-lotus-text-muted',
                      )}
                    >
                      {c === 'all'
                        ? ui(locale, 'all')
                        : CATEGORY_LABEL[c as GalleryCategory][locale]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gallery.map((img, i) => (
                <ZoomImage
                  key={img._key}
                  image={img}
                  alt={t(img.alt, t(data.name))}
                  className={cn(
                    'rounded-sm',
                    // First image spans both columns for a stronger opening.
                    i === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-[4/3]',
                  )}
                />
              ))}
            </div>
            <p className="text-xs tracking-widest uppercase text-lotus-text-faint mt-6">
              {ui(locale, 'zoomHint')}
            </p>
          </section>
        ) : null}

        {/* Full specifications */}
        {(data.specGroups ?? []).length > 0 ? (
          <section className="px-5 md:px-8 lg:px-20 py-20">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold uppercase tracking-tighter mb-10">
              {ui(locale, 'specifications')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(data.specGroups ?? []).map((group) => (
                <div key={group._key}>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-lotus-yellow mb-4">
                    {t(group.title)}
                  </h3>
                  <dl className="space-y-3">
                    {(group.rows ?? []).map((row) => (
                      <div
                        key={row._key}
                        className="flex justify-between gap-4 border-b border-lotus-border pb-2"
                      >
                        <dt className="text-sm text-lotus-text-muted">{t(row.label)}</dt>
                        <dd className="text-sm font-medium text-end">{t(row.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
