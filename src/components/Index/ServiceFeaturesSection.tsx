import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocale } from '@/i18n/LocaleProvider'
import { serviceIcon } from '@/lib/icons'
import type { ServiceSectionData } from '@/sanity/types'
import MissingContent from '@/components/common/MissingContent'

export default function ServiceFeaturesSection({
  data,
}: {
  data?: ServiceSectionData | null
}) {
  const { t } = useLocale()
  if (!data) return null

  // Belt and braces: the query filters unresolved references, but a null
  // here would crash the map below, so drop them again.
  const features = (data.features ?? []).filter(Boolean)

  if (features.length === 0) {
    return <MissingContent section={t(data.heading) || 'Service'} documentType="serviceFeature" />
  }

  return (
    <section
      className="py-24 px-8 lg:px-20 bg-lotus-grey border-y border-lotus-border"
      id="service"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          {t(data.eyebrow) ? (
            <span className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
              {t(data.eyebrow)}
            </span>
          ) : null}
          <h2 className="font-display text-6xl font-bold uppercase tracking-tighter mt-4">
            {t(data.heading)}
          </h2>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature._id}
              className="space-y-4 p-6 border border-lotus-border rounded-sm hover:border-lotus-yellow transition-colors"
            >
              <FontAwesomeIcon
                icon={serviceIcon(feature.icon)}
                className="text-3xl text-lotus-yellow"
              />
              <h3 className="text-xl font-bold uppercase tracking-wide">
                {t(feature.title)}
              </h3>
              <p className="text-sm text-lotus-text-muted leading-relaxed">
                {t(feature.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
