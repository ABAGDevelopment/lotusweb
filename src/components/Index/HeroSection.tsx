import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import type { HeroSectionData } from '@/sanity/types'

export default function HeroSection({ data }: { data?: HeroSectionData | null }) {
  const parallaxRef = useRef<HTMLImageElement>(null)
  const { t, isRtl } = useLocale()

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let frame = 0
    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  if (!data) return null

  return (
    <section
      className="relative h-[800px] w-full overflow-hidden flex items-center"
      id="hero"
    >
      <div className="absolute inset-0 z-0">
        <div
          className={
            isRtl
              ? 'absolute inset-0 bg-gradient-to-l from-lotus-black via-lotus-black/40 to-transparent z-10'
              : 'absolute inset-0 bg-gradient-to-r from-lotus-black via-lotus-black/40 to-transparent z-10'
          }
        />
        <SanityImage
          ref={parallaxRef}
          image={data.image}
          priority
          sizes="100vw"
          className="hero-parallax w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-8 lg:px-20 relative z-20 pt-20">
        <div className="max-w-2xl">
          {t(data.eyebrow) ? (
            <p className="text-lotus-yellow text-xs font-bold tracking-[0.3em] mb-6 uppercase">
              {t(data.eyebrow)}
            </p>
          ) : null}
          <h1 className="font-display text-7xl lg:text-[96px] font-bold uppercase leading-[0.85] tracking-tight mb-8">
            {t(data.headingTop)}
            <br />
            <span className="text-outline">{t(data.headingOutlined)}</span>
          </h1>
          <div className="flex flex-wrap gap-4">
            {data.primaryCta ? (
              <CmsLink
                link={data.primaryCta}
                className="btn-primary px-10 py-4 text-sm font-bold tracking-widest uppercase inline-flex items-center gap-3"
              >
                <span>{t(data.primaryCta.label)}</span>
                <FontAwesomeIcon icon={faArrowRight} className={isRtl ? 'rotate-180' : ''} />
              </CmsLink>
            ) : null}
            {data.secondaryCta ? (
              <CmsLink
                link={data.secondaryCta}
                className="btn-outline px-10 py-4 text-sm font-bold tracking-widest uppercase"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
