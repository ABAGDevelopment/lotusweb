import { useEffect, useRef, useState } from 'react'
import CmsLink from '@/components/common/CmsLink'
import MissingContent from '@/components/common/MissingContent'
import SanityImage from '@/components/common/SanityImage'
import { useTestDrive } from '@/components/testdrive/TestDriveProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import type { Figure, RangeSectionData } from '@/sanity/types'
import FlipNumber from './FlipNumber'
import '@/styles/model-showcase.css'

export interface ModelCardData {
  id: string
  name: string
  logo?: string
  image?: Figure | null
  href: string
  specs: { value: string; label: string }[]
  /** Preselects the model in the test-drive form. */
  slug?: string
  discoverLabel: string
  testDriveLabel: string
}

/**
 * An anchor-only href ('#range') is legacy seed data, not a deliberate
 * override — treat only a path or absolute URL as one.
 */
function isRealOverride(href?: string | null): boolean {
  if (!href) return false
  return !href.startsWith('#')
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ModelCard({ card }: { card: ModelCardData }) {
  const testDrive = useTestDrive()
  const ref = useRef<HTMLElement>(null)
  // Reduced motion starts on the final values, so there is nothing to roll.
  const [rolled, setRolled] = useState(prefersReducedMotion)

  useEffect(() => {
    const el = ref.current
    if (rolled || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        // The first callback fires on observe with any overlap, so check the
        // ratio rather than isIntersecting.
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
    <article ref={ref} className="model-card">
      <SanityImage
        image={card.image}
        fallbackAlt={card.name}
        sizes="(min-width: 992px) 45vw, 100vw"
        className="model-card__img"
      />
      <div className="model-card__content">
        <h3 className="model-card__name font-display uppercase">
          {card.logo ? <img src={card.logo} alt={card.name} loading="lazy" /> : card.name}
        </h3>
        <div>
          {card.specs.length > 0 ? (
            <div className="model-card__specs">
              {card.specs.map((spec, i) => (
                <div key={i} className="min-w-0 flex-1">
                  <div className="model-card__value">
                    <FlipNumber value={spec.value} rolled={rolled} />
                  </div>
                  <div className="model-card__label">{spec.label}</div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="model-card__actions">
            <CmsLink
              link={{ href: card.href }}
              className="btn-primary px-6 py-3 text-center text-xs font-bold tracking-widest uppercase"
            >
              {card.discoverLabel}
            </CmsLink>
            <button
              type="button"
              onClick={() => testDrive.open(card.slug)}
              className="btn-outline px-6 py-3 text-xs font-bold tracking-widest uppercase"
            >
              {card.testDriveLabel}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ModelShowcase({ data }: { data?: RangeSectionData | null }) {
  const { t } = useLocale()
  if (!data) return null

  const vehicles = (data.vehicles ?? []).filter(Boolean)

  // A heading with no cards under it reads as a broken page. Say why instead.
  if (vehicles.length === 0) {
    return <MissingContent section={t(data.heading) || 'Our Models'} documentType="vehicle" />
  }

  const cards: ModelCardData[] = vehicles.map((v) => ({
    id: v._id,
    name: t(v.name),
    logo: v.logo ?? undefined,
    image: v.image,
    // Discover goes to the detail page unless the editor set a real path or URL.
    href:
      v.slug && !isRealOverride(v.discoverLink?.href)
        ? `/vehicles/${v.slug}`
        : (v.discoverLink?.href ?? ''),
    specs: (v.specs ?? [])
      .map((s) => ({ value: t(s.value), label: t(s.label) }))
      .filter((s) => s.value)
      .slice(0, 3),
    slug: v.slug ?? undefined,
    discoverLabel: t(v.discoverLink?.label, 'Discover'),
    testDriveLabel: t(v.testDriveLink?.label, 'Test Drive'),
  }))

  const rows: ModelCardData[][] = []
  for (let i = 0; i < cards.length; i += 2) rows.push(cards.slice(i, i + 2))

  return (
    <section id="range" className="model-showcase bg-black text-white">
      <div className="model-showcase__inner">
        <header className="model-showcase__header">
          <h2 className="model-showcase__title font-display uppercase">{t(data.heading)}</h2>
          {t(data.subheading) ? (
            <p className="model-showcase__subtitle">{t(data.subheading)}</p>
          ) : null}
        </header>
        <div className="model-grid">
          {rows.map((row) => (
            <div key={row[0].id} className="model-row">
              {row.map((card) => (
                <ModelCard key={card.id} card={card} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
