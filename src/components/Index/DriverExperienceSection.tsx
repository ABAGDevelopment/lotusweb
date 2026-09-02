import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'
import type { ShowroomSectionData } from '@/sanity/types'
import MissingContent from '@/components/common/MissingContent'

export default function DriverExperienceSection({
  data,
}: {
  data?: ShowroomSectionData | null
}) {
  const { t } = useLocale()
  if (!data) return null

  const showroom = data.showroom

  if (!showroom) {
    return <MissingContent section={t(data.heading) || 'Showroom'} documentType="showroom" />
  }
  const isOpen = showroom?.isOpen !== false

  return (
    <section className="py-24 px-8 lg:px-20" id="showroom">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-video overflow-hidden rounded-sm bg-lotus-grey">
          <SanityImage
            image={data.image}
            fallbackAlt={t(data.heading)}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
          />
        </div>

        <div className="space-y-8">
          {t(data.eyebrow) ? (
            <span className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
              {t(data.eyebrow)}
            </span>
          ) : null}
          <h2 className="font-display text-6xl lg:text-7xl font-bold uppercase tracking-tighter leading-none">
            {t(data.heading)}
          </h2>
          <p className="text-lg text-lotus-text-muted leading-relaxed max-w-xl">
            {t(data.description)}
          </p>

          {showroom ? (
            <>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint mb-2">
                    {t(showroom.locationLabel)}
                  </div>
                  <p className="text-sm">{t(showroom.address)}</p>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint mb-2">
                    {t(showroom.hoursLabel)}
                  </div>
                  <p className="text-sm whitespace-pre-line">{t(showroom.hours)}</p>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint mb-2">
                    {t(showroom.contactLabel)}
                  </div>
                  <a
                    className="text-sm hover:text-lotus-yellow transition-colors"
                    href={showroom.contactHref || '#'}
                  >
                    {t(showroom.contactText)}
                  </a>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint mb-2">
                    {t(showroom.directionsLabel)}
                  </div>
                  <a
                    className="text-sm hover:text-lotus-yellow transition-colors"
                    href={showroom.directionsHref || '#'}
                    target={showroom.directionsHref ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    {t(showroom.directionsLinkText)}
                  </a>
                </div>
              </div>

              {t(showroom.liveStatusLabel) ? (
                <div className="pt-4">
                  <div className="inline-block px-6 py-3 border border-lotus-border rounded-sm">
                    <span className="text-xs font-bold tracking-widest uppercase text-lotus-text-faint">
                      {t(showroom.liveStatusLabel)}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold tracking-widest uppercase ms-2',
                        isOpen ? 'text-lotus-yellow' : 'text-lotus-text-muted',
                      )}
                    >
                      {'\u25CF'} {isOpen ? t(showroom.openLabel) : t(showroom.closedLabel)}
                    </span>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
