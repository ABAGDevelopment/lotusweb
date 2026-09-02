import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { RangeSectionData } from '@/sanity/types'
import MissingContent from '@/components/common/MissingContent'

export default function VehicleRangeGrid({ data }: { data?: RangeSectionData | null }) {
  const { t, isRtl, localePath } = useLocale()
  if (!data) return null

  const vehicles = (data.vehicles ?? []).filter(Boolean)

  // A heading with no cards under it reads as a broken page. Say why instead.
  if (vehicles.length === 0) {
    return <MissingContent section={t(data.heading) || 'The Range'} documentType="vehicle" />
  }

  return (
    <section className="py-24 px-8 lg:px-20" id="range">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="font-display text-5xl lg:text-7xl font-bold uppercase tracking-tighter">
            {t(data.heading)}
          </h2>
          {t(data.subheading) ? (
            <p className="text-lotus-text-muted mt-4 max-w-md tracking-wide">
              {t(data.subheading)}
            </p>
          ) : null}
        </div>
        {data.viewAll ? (
          <CmsLink
            link={data.viewAll}
            className="hidden md:flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:text-lotus-yellow transition-colors"
          >
            <span>{t(data.viewAll.label)}</span>
            <FontAwesomeIcon icon={faArrowRightLong} className={isRtl ? 'rotate-180' : ''} />
          </CmsLink>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <article key={vehicle._id} className="vehicle-card group cursor-pointer">
            <div className="aspect-[4/5] overflow-hidden bg-lotus-grey rounded-sm mb-6 relative">
              <SanityImage
                image={vehicle.image}
                fallbackAlt={t(vehicle.name)}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="card-hover-img w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold uppercase tracking-wide">{t(vehicle.name)}</h3>
              <p className="text-lotus-text-muted text-sm">{t(vehicle.tagline)}</p>
              {(vehicle.specs ?? []).length > 0 ? (
                <div className="flex gap-4 pt-2 text-xs font-bold tracking-widest text-lotus-text-faint">
                  {(vehicle.specs ?? []).map((spec) => (
                    <span key={spec._key} title={t(spec.label)}>
                      {t(spec.value)}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="pt-4 flex gap-4 text-xs font-bold tracking-widest uppercase">
                {/* The destination is derived from the slug so a new vehicle
                    works without anyone editing a URL. The CMS href still wins
                    if an editor sets one explicitly. */}
                {vehicle.slug && !vehicle.discoverLink?.href ? (
                  <Link
                    to={localePath(`/vehicles/${vehicle.slug}`)}
                    className="hover:text-lotus-yellow underline decoration-lotus-yellow underline-offset-4"
                  >
                    {t(vehicle.discoverLink?.label)}
                  </Link>
                ) : (
                  <CmsLink
                    link={vehicle.discoverLink}
                    className="hover:text-lotus-yellow underline decoration-lotus-yellow underline-offset-4"
                  />
                )}
                {vehicle.slug && !vehicle.testDriveLink?.href ? (
                  <Link
                    to={localePath(`/test-drive?model=${vehicle.slug}`)}
                    className="hover:text-lotus-yellow underline decoration-lotus-yellow underline-offset-4"
                  >
                    {t(vehicle.testDriveLink?.label)}
                  </Link>
                ) : (
                  <CmsLink
                    link={vehicle.testDriveLink}
                    className="hover:text-lotus-yellow underline decoration-lotus-yellow underline-offset-4"
                  />
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
