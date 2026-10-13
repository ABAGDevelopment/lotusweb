import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { ShowroomSectionData } from '@/sanity/types'

/**
 * Figma "Section - FIND A LOTUS CENTRE". From 1024px the photo fills the
 * left two-thirds and the copy sits in a black panel (1440×600 at desktop);
 * below that the photo fills the section and the copy is centred over it.
 */
export default function DriverExperienceSection({
  data,
}: {
  data?: ShowroomSectionData | null
}) {
  const { t } = useLocale()
  if (!data) return null

  // Until editors set a button, it opens the showroom's directions.
  const showroom = data.showroom
  const cta =
    data.cta ??
    (showroom?.directionsHref
      ? { href: showroom.directionsHref, label: showroom.directionsLinkText, external: true }
      : null)

  return (
    <section
      id="showroom"
      aria-labelledby="showroom-title"
      className="relative flex h-[560px] flex-col justify-end overflow-hidden bg-black text-white lg:grid lg:h-auto lg:aspect-[1440/600] lg:grid-cols-3"
    >
      <div className="absolute inset-0 lg:relative lg:col-span-2">
        <SanityImage
          image={data.image}
          fallbackAlt={t(data.heading)}
          sizes="(min-width: 1024px) 67vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Darker than Figma's gradient, which assumes its night photo: the
            copy has to stay readable over any image editors choose. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black from-35% via-black/60 to-black/10 lg:hidden" />
      </div>

      <div className="relative px-5 pb-16 text-center md:px-8 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:pb-0 lg:text-start">
        {t(data.eyebrow) ? (
          <p className="mb-4 text-xs tracking-[0.3em] uppercase text-lotus-yellow">
            {t(data.eyebrow)}
          </p>
        ) : null}
        {/* Wide tracking goes through the variable .font-display pins with
            !important; Arabic must not be letter-spaced. */}
        <h2
          id="showroom-title"
          className="font-display text-xl leading-7 lg:text-3xl xl:text-4xl uppercase break-words mb-4 lg:mb-5 [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]"
        >
          {t(data.heading)}
        </h2>
        {t(data.description) ? (
          <p className="mx-auto max-w-[512px] whitespace-pre-line text-sm leading-5 lg:mx-0 lg:text-base lg:leading-6 font-light text-lotus-text-muted mb-7 lg:mb-8">
            {t(data.description)}
          </p>
        ) : null}
        <CmsLink
          link={cta}
          hideWhenEmpty
          className="btn-primary block py-4 text-center text-xs font-medium tracking-[0.15em] uppercase lg:inline-block lg:self-start lg:px-8"
        />
      </div>
    </section>
  )
}
