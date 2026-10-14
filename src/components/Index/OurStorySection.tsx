import { useEffect, useRef } from 'react'
import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import { imageSrc } from '@/sanity/image'
import { cn } from '@/lib/utils'
import type { StorySectionData } from '@/sanity/types'

/** Figma's outlined button, same as the hero and model highlight. */
const OUTLINE_CTA =
  'border border-white px-8 py-4 text-center text-xs font-medium tracking-[0.15em] uppercase text-white transition-colors hover:border-lotus-yellow hover:text-lotus-yellow'

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } }

/** Visitors who asked for less motion or less data get the poster only. */
function posterOnly(): boolean {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    Boolean((navigator as NavigatorWithConnection).connection?.saveData)
  )
}

/**
 * Figma "Section - HERITAGE" (1440×650). A looping video (or the archive
 * image when there is none) fills the section. From 1024px the copy is
 * vertically centred on the start side; below that it sits at the bottom over
 * a portrait crop, as lotuscars.com does on phones (744px tall at 390 wide).
 */
export default function OurStorySection({ data }: { data?: StorySectionData | null }) {
  const { t } = useLocale()
  const videoRef = useRef<HTMLVideoElement>(null)

  const video = data?.backgroundVideo?.asset
  const mobileVideo = data?.backgroundVideoMobile?.asset

  // preload="none" plus sources held in data-src: nothing downloads until the
  // section is on screen, and it pauses again when it leaves.
  useEffect(() => {
    const el = videoRef.current
    if (!el || posterOnly()) return
    let attached = false
    const sources = () => [...el.querySelectorAll('source')]
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        el.pause()
        return
      }
      if (!attached) {
        sources().forEach((s) => (s.src = s.dataset.src ?? ''))
        el.load()
        attached = true
      }
      el.play().catch(() => {
        // Blocked autoplay or a broken file: drop the sources so the poster stays.
        io.disconnect()
        sources().forEach((s) => s.removeAttribute('src'))
        el.load()
      })
    })
    io.observe(el)
    return () => io.disconnect()
  }, [video?.url, mobileVideo?.url])

  if (!data) return null

  const paragraphs = [t(data.leadParagraph), t(data.body)].filter(Boolean)
  const hotspot = data.videoPoster?.hotspot

  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="relative flex items-end min-h-[min(744px,100svh)] bg-black text-white lg:items-center lg:min-h-0 lg:aspect-[1440/650]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {video ? (
          <video
            key={`${video.url}|${mobileVideo?.url ?? ''}`}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            // The poster's hotspot (set in Studio) keeps the subject in frame
            // when phones crop the landscape video to a portrait box.
            style={
              hotspot ? { objectPosition: `${hotspot.x * 100}% ${hotspot.y * 100}%` } : undefined
            }
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={imageSrc(data.videoPoster ?? data.image, 1920)}
            aria-hidden="true"
          >
            {mobileVideo ? (
              <source
                data-src={mobileVideo.url}
                type={mobileVideo.mimeType ?? undefined}
                media="(max-width: 767px)"
              />
            ) : null}
            <source data-src={video.url} type={video.mimeType ?? undefined} />
          </video>
        ) : (
          <SanityImage
            image={data.image}
            fallbackAlt={t(data.heading)}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Phones: dark from the bottom under the copy. Desktop: dark from the start side. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent lg:bg-gradient-to-r lg:rtl:bg-gradient-to-l lg:via-black/50 lg:to-black/10" />
      </div>

      {/* Figma's column is 576px; 640 keeps its line breaks in the site's
          headline face, which runs wider than Figma's Archivo. */}
      <div className="relative w-full px-5 md:px-8 pt-12 pb-8 lg:max-w-[640px] lg:px-[88px] lg:py-0">
        {t(data.eyebrow) ? (
          <p className="mb-4 text-xs tracking-[0.3em] uppercase text-lotus-yellow">
            {t(data.eyebrow)}
          </p>
        ) : null}
        {/* Wide tracking goes through the variable .font-display pins with
            !important; Arabic must not be letter-spaced. */}
        <h2
          id="story-title"
          className="font-display text-[28px] leading-[1.25] lg:text-[36px] lg:leading-10 uppercase break-words mb-6 [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]"
        >
          {t(data.heading)}
        </h2>
        {paragraphs.length > 0 ? (
          <div className="max-w-[448px] space-y-4 mb-9 text-sm leading-6 lg:text-base font-light text-lotus-text-muted">
            {paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        ) : null}

        <div className="flex">
          <CmsLink link={data.link} className={cn(OUTLINE_CTA, 'flex-1 lg:flex-none')} />
        </div>
      </div>
    </section>
  )
}
