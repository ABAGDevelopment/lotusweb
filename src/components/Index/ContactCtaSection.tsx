import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { ContactCtaData } from '@/sanity/types'

export default function ContactCtaSection({ data }: { data?: ContactCtaData | null }) {
  const { t } = useLocale()
  if (!data) return null

  return (
    <section
      className="py-20 md:py-32 px-5 md:px-8 lg:px-20 relative overflow-hidden group cursor-pointer"
      id="contact"
    >
      <div className="absolute inset-0 z-0">
        <SanityImage
          image={data.backgroundImage}
          sizes="100vw"
          className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-lotus-black/80 group-hover:bg-lotus-yellow/20 transition-colors duration-700" />
      </div>

      <div className="relative z-10 text-center space-y-8">
        <h2 className="font-display heading-display lg:text-9xl font-bold uppercase tracking-tighter transition-colors duration-700">
          {t(data.heading)}
        </h2>
        <p className="text-sm md:text-xl text-lotus-text-muted max-w-2xl mx-auto group-hover:text-lotus-black transition-colors duration-700">
          {t(data.subheading)}
        </p>
        {data.cta ? (
          <CmsLink
            link={data.cta}
            className="btn-outline block w-full px-6 py-4 text-xs md:inline-block md:w-auto md:px-16 md:py-6 md:text-lg font-bold tracking-widest uppercase bg-transparent group-hover:bg-lotus-black group-hover:text-lotus-yellow group-hover:border-lotus-black transition-all duration-700"
          />
        ) : null}

        {data.backgroundWord ? (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-10 pointer-events-none select-none">
            <span className="font-display text-[20vw] font-bold uppercase tracking-tighter text-outline group-hover:text-lotus-yellow transition-all duration-1000">
              {data.backgroundWord}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
