import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import CmsLink from '@/components/common/CmsLink'
import SanityImage from '@/components/common/SanityImage'
import FlipNumber from '@/components/Index/FlipNumber'
import { useLocale } from '@/i18n/LocaleProvider'
import { ui } from '@/i18n/ui'
import { cn } from '@/lib/utils'
import type {
  CtaButton,
  FeatureCarouselSection,
  FullWidthVideoSection,
  HeroMediaSection,
  ImageTextSection,
  IntroTextSection,
  ResponsiveMedia,
  SectionSpacing,
  StatsBlockSection,
  VehicleSection,
} from '@/sanity/types'

/**
 * Renders a vehicle's "Page sections" (lotuscars.com-style page builder).
 * Every block is optional-everything: a missing field renders nothing.
 */

const SECTION_X = 'px-5 md:px-8 lg:px-[88px]'
// Tracked display caps, as on lotuscars.com. Arabic script must not be
// letter-spaced: it breaks the joins between letters.
const DISPLAY =
  'font-display uppercase [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]'

/* Literal class maps so Tailwind sees every class it must generate. */
const PAD_TOP = {
  none: 'pt-0',
  tiny: 'pt-6 lg:pt-8',
  normal: 'pt-16 lg:pt-24',
  large: 'pt-20 lg:pt-32',
} as const
const PAD_BOTTOM = {
  none: 'pb-0',
  tiny: 'pb-6 lg:pb-8',
  normal: 'pb-16 lg:pb-24',
  large: 'pb-20 lg:pb-32',
} as const
const MOBILE_ASPECT: Record<string, string> = {
  '9/16': 'aspect-[9/16]',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '16/9': 'aspect-video',
}

const pad = (s?: SectionSpacing | null) =>
  cn(PAD_TOP[s?.top ?? 'normal'], PAD_BOTTOM[s?.bottom ?? 'normal'])

const onWhite = (theme?: string | null) => theme === 'white'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** One CTA. `hidden` is an editor switch, not a styling state. */
function Cta({ button, light }: { button?: CtaButton | null; light?: boolean }) {
  const { t, isRtl } = useLocale()
  if (!button || button.hidden || !t(button.label)) return null
  const style = button.style ?? 'primary'

  if (style === 'tertiary')
    return (
      <CmsLink
        link={button}
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
      >
        {t(button.label)}
        <span aria-hidden="true" className={cn('inline-block', isRtl && '-scale-x-100')}>
          {'→'}
        </span>
      </CmsLink>
    )

  return (
    <CmsLink
      link={button}
      className={cn(
        'inline-block px-8 py-4 text-center text-xs font-medium uppercase tracking-[0.15em] transition-colors',
        style === 'primary'
          ? 'btn-primary'
          : light
            ? 'border border-lotus-black text-lotus-black hover:bg-lotus-black hover:text-white'
            : 'border border-white text-white hover:border-lotus-yellow hover:text-lotus-yellow',
      )}
    />
  )
}

/** Desktop/mobile image plus the optional silent video loop on top. */
function Media({ media, priority }: { media?: ResponsiveMedia | null; priority?: boolean }) {
  const { t } = useLocale()
  if (!media) return null
  const img = 'absolute inset-0 h-full w-full object-cover'
  const hasMobile = !!media.mobileImage?.asset
  return (
    <>
      {media.image?.asset ? (
        <SanityImage
          image={media.image}
          priority={priority}
          sizes="100vw"
          fallbackAlt={t(media.image.alt)}
          className={cn(img, hasMobile && 'hidden md:block')}
        />
      ) : null}
      {hasMobile ? (
        <SanityImage image={media.mobileImage} priority={priority} sizes="100vw" className={cn(img, 'md:hidden')} />
      ) : null}
      {media.video ? (
        <video
          src={media.video}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className={cn(img, 'motion-reduce:hidden')}
        />
      ) : null}
    </>
  )
}

function Hero({ s }: { s: HeroMediaSection }) {
  const { t, isRtl } = useLocale()
  const Heading = s.isPageH1 ? 'h1' : 'h2'
  const center = s.align === 'center'
  const valign = s.valign ?? 'bottom'
  const gradient = s.gradient ?? 'none'
  const hasText = !!(t(s.title) || t(s.body) || s.buttons?.length)

  return (
    <section
      className={cn(
        'relative flex w-full overflow-hidden bg-black',
        MOBILE_ASPECT[s.mobileAspect ?? '3/4'] ?? 'aspect-[3/4]',
        'md:aspect-video',
        // The page-opening hero fills tall screens rather than letterboxing.
        s.isPageH1 && 'md:max-h-[min(900px,100svh)] md:min-h-[560px]',
        valign === 'top' ? 'items-start' : valign === 'middle' ? 'items-center' : 'items-end',
      )}
    >
      <div className="absolute inset-0">
        <Media media={s.media} priority={!!s.isPageH1} />
        {gradient === 'bottom' ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        ) : null}
        {gradient === 'start' ? (
          <div
            className={cn(
              'absolute inset-0 to-transparent',
              isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r',
              'from-black/75 via-black/30',
            )}
          />
        ) : null}
      </div>
      {hasText ? (
        <div
          className={cn(
            'relative w-full py-12 md:py-16',
            SECTION_X,
            center && 'flex flex-col items-center text-center',
          )}
        >
          {t(s.title) ? (
            <Heading
              className={cn(
                DISPLAY,
                'whitespace-pre-line',
                s.isPageH1
                  ? 'text-[32px] leading-[1.2] lg:text-[44px] lg:leading-[1.15]'
                  : 'text-2xl leading-[1.25] lg:text-[28px] lg:leading-9',
                s.titleAccent ? 'text-lotus-yellow' : 'text-white',
              )}
            >
              {t(s.title)}
            </Heading>
          ) : null}
          {t(s.body) ? (
            <p className="mt-4 max-w-md whitespace-pre-line text-sm font-light leading-6 text-white/90">
              {t(s.body)}
            </p>
          ) : null}
          {s.buttons?.length ? (
            <div className={cn('mt-8 flex flex-wrap gap-4', center && 'justify-center')}>
              {s.buttons.map((b) => (
                <Cta key={b._key} button={b} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function Intro({ s }: { s: IntroTextSection }) {
  const { t } = useLocale()
  const light = onWhite(s.theme)
  const center = (s.align ?? 'center') === 'center'
  return (
    <section
      className={cn(light ? 'bg-white text-lotus-black' : 'bg-black text-white', pad(s.spacing), SECTION_X)}
    >
      <div className={cn('mx-auto max-w-2xl', center && 'flex flex-col items-center text-center')}>
        {s.overline?.asset ? (
          <SanityImage image={s.overline} sizes="200px" className="mb-8 h-12 w-auto object-contain" />
        ) : null}
        {t(s.title) ? (
          <h2 className={cn(DISPLAY, 'text-2xl leading-[1.3] lg:text-[30px] lg:leading-[1.35]')}>
            {t(s.title)}
          </h2>
        ) : null}
        {t(s.body) ? (
          <p
            className={cn(
              'mt-6 whitespace-pre-line text-sm font-light leading-6 lg:text-[15px] lg:leading-7',
              light ? 'text-lotus-black/80' : 'text-white/90',
            )}
          >
            {t(s.body)}
          </p>
        ) : null}
        {s.buttons?.length ? (
          <div className={cn('mt-8 flex flex-wrap gap-4', center && 'justify-center')}>
            {s.buttons.map((b) => (
              <Cta key={b._key} button={b} light={light} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function FullVideo({ s }: { s: FullWidthVideoSection }) {
  if (!s.video) return null
  return (
    <section className={cn('bg-black', pad(s.spacing))}>
      {/* The brand film: silent loop; controls let the visitor take over. */}
      <video
        src={s.video}
        autoPlay
        muted
        loop
        playsInline
        controls={s.controls ?? false}
        className="aspect-video w-full object-cover"
      />
    </section>
  )
}

function Stats({ s }: { s: StatsBlockSection }) {
  const { t, isRtl } = useLocale()
  const ref = useRef<HTMLDivElement>(null)
  // Reduced motion starts on the final values, so there is nothing to roll.
  const [rolled, setRolled] = useState(prefersReducedMotion)
  const stats = (s.stats ?? []).filter((x) => x.value)

  useEffect(() => {
    const el = ref.current
    if (rolled || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.4) {
          setRolled(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rolled])

  return (
    <section className="relative flex min-h-[560px] flex-col justify-between overflow-hidden bg-black lg:min-h-[640px]">
      <div className="absolute inset-0">
        <Media media={s.background} />
        {(s.gradient ?? 'start') !== 'none' ? (
          <div
            className={cn(
              'absolute inset-0 to-transparent',
              s.gradient === 'bottom'
                ? 'bg-gradient-to-t from-black/80 via-black/25'
                : cn(isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r', 'from-black/80 via-black/30'),
            )}
          />
        ) : null}
      </div>
      <div className={cn('relative pt-14 lg:pt-20', SECTION_X)}>
        {t(s.title) ? (
          <h2 className={cn(DISPLAY, 'max-w-md text-2xl leading-[1.25] text-white lg:text-[28px] lg:leading-9')}>
            {t(s.title)}
          </h2>
        ) : null}
        {t(s.body) ? (
          <p className="mt-5 max-w-md whitespace-pre-line text-sm font-light leading-6 text-white/85">
            {t(s.body)}
          </p>
        ) : null}
      </div>
      {stats.length ? (
        <div
          ref={ref}
          className={cn('relative flex flex-wrap gap-x-14 gap-y-8 pb-14 pt-12 lg:gap-x-20 lg:pb-20', SECTION_X)}
        >
          {stats.map((x) => (
            <div key={x._key} className="flex items-start gap-3">
              <div className="font-display text-4xl font-light leading-none text-white lg:text-[44px]">
                <FlipNumber value={x.value ?? ''} rolled={rolled} />
              </div>
              {t(x.label) || x.hasDisclaimer ? (
                <div className="whitespace-pre-line pt-0.5 text-[10px] uppercase leading-[1.6] tracking-[0.12em] text-white/70 lg:text-[11px]">
                  <bdi>{t(x.label)}</bdi>
                  {x.hasDisclaimer ? '*' : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function Carousel({ s }: { s: FeatureCarouselSection }) {
  const { t, locale, isRtl } = useLocale()
  const ref = useRef<HTMLDivElement>(null)
  const light = onWhite(s.theme)
  const perView = s.itemsPerView === 3 ? 3 : 2
  const items = (s.items ?? []).filter((x) => x.image?.asset || x.video || t(x.title))
  if (!items.length) return null

  // One card plus the gap. scrollLeft runs negative in RTL.
  const step = (dir: -1 | 1) => {
    const el = ref.current
    const card = el?.firstElementChild as HTMLElement | null
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 24) * (isRtl ? -1 : 1) })
  }

  const arrows = s.showArrows !== false && items.length > perView

  return (
    <section className={cn(light ? 'bg-white text-lotus-black' : 'bg-black text-white', pad(s.spacing))}>
      {t(s.heading) || arrows ? (
        <div className={cn('mb-8 flex items-end justify-between gap-6 lg:mb-10', SECTION_X)}>
          <h2 className={cn(DISPLAY, 'text-xl leading-7 lg:text-[22px]', !t(s.heading) && 'sr-only')}>
            {t(s.heading) || t(items[0]?.title)}
          </h2>
          {arrows ? (
            <div className="flex shrink-0 gap-3">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => step(dir)}
                  aria-label={ui(locale, dir < 0 ? 'previous' : 'next')}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center border transition-colors',
                    light
                      ? 'border-lotus-black/25 hover:border-lotus-black'
                      : 'border-white/25 hover:border-lotus-yellow hover:text-lotus-yellow',
                  )}
                >
                  <FontAwesomeIcon icon={dir < 0 !== isRtl ? faChevronLeft : faChevronRight} className="h-3" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={ref}
        className={cn(
          'flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain motion-safe:scroll-smooth [scrollbar-width:none]',
          'scroll-px-5 md:scroll-px-8 lg:scroll-px-[88px]',
          SECTION_X,
        )}
      >
        {items.map((item) => (
          <article
            key={item._key}
            className={cn('w-[80vw] shrink-0 snap-start', perView === 3 ? 'md:w-[27vw]' : 'md:w-[40vw]')}
          >
            <div className={cn('relative overflow-hidden', perView === 3 ? 'aspect-[4/3]' : 'aspect-[3/2]')}>
              {item.video ? (
                <video
                  src={item.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                />
              ) : null}
              {item.image?.asset ? (
                <SanityImage
                  image={item.image}
                  sizes="(min-width: 768px) 40vw, 80vw"
                  fallbackAlt={t(item.title)}
                  className={cn('absolute inset-0 h-full w-full object-cover', item.video && 'motion-safe:hidden')}
                />
              ) : null}
            </div>
            {t(item.title) ? <h3 className="mt-4 text-sm font-semibold leading-5">{t(item.title)}</h3> : null}
            {t(item.body) ? (
              <p
                className={cn(
                  'mt-2 whitespace-pre-line text-xs font-light leading-5',
                  light ? 'text-lotus-black/70' : 'text-white/70',
                )}
              >
                {t(item.body)}
              </p>
            ) : null}
            {item.button ? (
              <div className="mt-4">
                <Cta button={item.button} light={light} />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {s.button && !s.button.hidden && t(s.button.label) ? (
        <div className="mt-10 text-center">
          <Cta button={s.button} light={light} />
        </div>
      ) : null}
    </section>
  )
}

function ImageText({ s }: { s: ImageTextSection }) {
  const { t } = useLocale()
  const light = onWhite(s.theme)
  return (
    <section
      className={cn(
        light ? 'bg-white text-lotus-black' : 'bg-black text-white',
        pad(s.spacing),
        SECTION_X,
        'grid items-center gap-8 lg:grid-cols-12 lg:gap-12',
      )}
    >
      <div className={cn('lg:col-span-4', s.reverse ? 'lg:order-2 lg:col-start-9' : 'lg:col-start-1')}>
        {t(s.title) ? (
          <h2 className={cn(DISPLAY, 'text-2xl leading-[1.25] lg:text-[28px] lg:leading-9')}>{t(s.title)}</h2>
        ) : null}
        {t(s.body) ? (
          <p
            className={cn(
              'mt-5 whitespace-pre-line text-sm font-light leading-6',
              light ? 'text-lotus-black/75' : 'text-white/80',
            )}
          >
            {t(s.body)}
          </p>
        ) : null}
      </div>
      {s.image?.asset ? (
        <div className={cn('lg:col-span-7', s.reverse ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-6')}>
          <SanityImage
            image={s.image}
            sizes="(min-width: 1024px) 55vw, 100vw"
            fallbackAlt={t(s.title)}
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
      ) : null}
    </section>
  )
}

export default function VehicleSections({ sections }: { sections: VehicleSection[] }) {
  return (
    <>
      {sections.map((s) => {
        switch (s._type) {
          case 'heroMedia':
            return <Hero key={s._key} s={s} />
          case 'introText':
            return <Intro key={s._key} s={s} />
          case 'fullWidthVideo':
            return <FullVideo key={s._key} s={s} />
          case 'statsBlock':
            return <Stats key={s._key} s={s} />
          case 'featureCarousel':
            return <Carousel key={s._key} s={s} />
          case 'imageText':
            return <ImageText key={s._key} s={s} />
          default:
            return null
        }
      })}
    </>
  )
}
