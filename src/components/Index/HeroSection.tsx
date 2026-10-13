import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { cn } from '@/lib/utils'
import type { HeroSectionData, HeroSlideData } from '@/sanity/types'

const SLIDE_MS = 6000

export default function HeroSection({ data }: { data?: HeroSectionData | null }) {
  const sectionRef = useRef<HTMLElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  // Set while the mouse button is down on the slider.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const { t, locale, isRtl } = useLocale()
  const count = data?.slides?.length ?? 0

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let frame = 0
    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        // One variable on the section moves every slide's image.
        sectionRef.current?.style.setProperty('--hero-parallax', `${window.scrollY * 0.3}px`)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  // scrollLeft runs negative in RTL.
  const goTo = useCallback(
    (index: number) => {
      const el = sliderRef.current
      el?.scrollTo({ left: index * el.clientWidth * (isRtl ? -1 : 1) })
    },
    [isRtl],
  )

  // Auto-play, off for reduced motion. Any slide change restarts the count.
  // The pointer over the hero, keyboard focus inside it, or a background tab
  // holds it.
  useEffect(() => {
    if (count < 2 || hovered || focused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      if (!document.hidden) goTo((active + 1) % count)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [active, count, hovered, focused, goTo])

  if (!data) return null

  // Until editors add slides, the single hero is the only slide. Its eyebrow
  // has been shown as the sub-line since the Figma redesign.
  const slides: HeroSlideData[] = data.slides?.length
    ? data.slides
    : [{ ...data, subheading: data.eyebrow }]

  // A mouse can't scroll the slider natively, so a drag scrolls it by hand with
  // snapping off. Snapping comes back once it rests exactly on a slide, so it
  // can't jump.
  const resnap = (el: HTMLDivElement) => {
    const pos = Math.abs(el.scrollLeft) / el.clientWidth
    if (!drag.current && Math.abs(pos - Math.round(pos)) * el.clientWidth < 1) el.style.scrollSnapType = ''
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    const el = e.currentTarget
    const pos = Math.abs(el.scrollLeft) / el.clientWidth
    // Pixels moved towards the next slide, in either reading direction.
    // Past 50px counts as a swipe to the neighbouring slide.
    const forward = Math.abs(el.scrollLeft) - Math.abs(d.left)
    const to = Math.abs(forward) < 50 ? Math.round(pos) : forward > 0 ? Math.ceil(pos) : Math.floor(pos)
    el.style.scrollBehavior = ''
    goTo(to)
    resnap(el)
  }

  return (
    <section
      ref={sectionRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // Mouse clicks focus buttons too; only keyboard focus holds auto-play.
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      // Figma's 900px, or the window height when the window is shorter.
      className="relative h-[min(780px,100svh)] min-h-[560px] md:h-[720px] md:min-h-0 lg:h-[min(900px,100svh)] lg:min-h-[640px] w-full overflow-hidden"
      id="hero"
    >
      {/* Native scroll-snap: swipe, trackpad and keyboard focus all move it. */}
      <div
        ref={sliderRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth))
          resnap(el)
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button === 0 && slides.length > 1)
            drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          // Button released outside the window before the drag began.
          if (!(e.buttons & 1)) return endDrag(e)
          const el = e.currentTarget
          const dx = e.clientX - d.x
          if (!d.moved) {
            if (Math.abs(dx) < 5) return // still a click
            d.moved = true
            el.setPointerCapture(e.pointerId)
            el.style.scrollSnapType = 'none'
            el.style.scrollBehavior = 'auto'
          }
          el.scrollLeft = d.left - dx
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Stops the browser dragging out the image or link instead.
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          'flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain motion-safe:scroll-smooth [scrollbar-width:none]',
          slides.length > 1 && 'cursor-grab select-none active:cursor-grabbing',
        )}
      >
        {slides.map((slide, i) => {
          const Heading = i === 0 ? 'h1' : 'h2'
          return (
            <div
              key={slide._key ?? i}
              className="relative flex h-full w-full shrink-0 snap-start items-end overflow-hidden"
            >
              <SanityImage
                image={slide.image}
                priority={i === 0}
                sizes="100vw"
                className="hero-parallax absolute inset-0 w-full h-full object-cover translate-y-[var(--hero-parallax,0px)]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-lotus-black via-lotus-black/30 to-lotus-black/10" />

              <div className="relative w-full px-5 md:px-8 lg:px-[88px] pb-28 md:pb-20 lg:pb-32">
                {/* .font-display pins letter-spacing with !important, so the wide
                    tracking goes through its variable. Arabic script must not be
                    letter-spaced: it breaks the joins between letters. */}
                <Heading className="font-display text-[30px] leading-[1.25] md:text-5xl md:leading-none lg:text-[60px] uppercase text-lotus-yellow mb-4 md:mb-5 [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]">
                  {t(slide.headingTop)}
                  <br />
                  {t(slide.headingOutlined)}
                </Heading>
                {t(slide.subheading) ? (
                  <p className="max-w-xs md:max-w-xl text-sm leading-5 md:text-lg md:leading-7 font-light text-white mb-6 md:mb-8">
                    {t(slide.subheading)}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
                  <CmsLink
                    link={slide.primaryCta}
                    className="btn-primary px-8 py-4 text-center text-xs font-medium tracking-[0.15em] uppercase"
                  />
                  <CmsLink
                    link={slide.secondaryCta}
                    className="border border-white px-8 py-4 text-center text-xs font-medium tracking-[0.15em] uppercase text-white transition-colors hover:border-lotus-yellow hover:text-lotus-yellow"
                  />
                  <CmsLink
                    link={slide.textLink}
                    className="pt-1 text-center md:pt-0 md:ps-2 text-xs tracking-[0.15em] uppercase text-white transition-colors hover:text-lotus-yellow"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((slide, i) => (
            <button
              key={slide._key ?? i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${ui(locale, 'slide')} ${i + 1}`}
              aria-current={i === active}
              className="py-3"
            >
              <span
                className={cn(
                  'block h-[3px] w-7 md:w-8 transition-colors',
                  i === active ? 'bg-lotus-yellow' : 'bg-lotus-text-faint',
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
