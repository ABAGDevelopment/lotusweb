import { useRef, useState } from 'react'
import { imageSrc, lqip } from '@/sanity/image'
import { useLocale } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'
import type { Figure } from '@/sanity/types'

/**
 * Magnifier lens. On pointer devices, hovering shows a circular window onto a
 * much larger render of the same Sanity asset. On touch devices there is no
 * hover, so tapping toggles a zoomed pan instead — the lens would otherwise be
 * unreachable on mobile.
 */
export default function ZoomImage({
  image,
  className,
  zoom = 2.6,
  lensSize = 220,
  alt,
}: {
  image?: Figure | null
  className?: string
  zoom?: number
  lensSize?: number
  alt?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [touchZoomed, setTouchZoomed] = useState(false)
  const { t } = useLocale()

  if (!image?.asset?._id) {
    return <div className={cn('bg-lotus-grey', className)} aria-hidden="true" />
  }

  const base = imageSrc(image, 1400)
  // The magnified layer is rendered at zoom× the display size.
  const magnified = imageSrc(image, 3200)
  const label = alt ?? t(image.alt, '')

  const onMove = (clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * 100
    const y = ((clientY - r.top) / r.height) * 100
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-lotus-grey group', className)}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onMouseLeave={() => setPos(null)}
      onTouchStart={() => setTouchZoomed((v) => !v)}
      onTouchMove={(e) => {
        if (!touchZoomed) return
        const touch = e.touches[0]
        if (touch) onMove(touch.clientX, touch.clientY)
      }}
    >
      <img
        src={base}
        alt={label}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        style={
          lqip(image)
            ? { backgroundImage: `url(${lqip(image)})`, backgroundSize: 'cover' }
            : undefined
        }
      />

      {/* Desktop lens */}
      {pos && !touchZoomed ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute hidden md:block rounded-full border-2 border-lotus-yellow shadow-2xl"
          style={{
            width: lensSize,
            height: lensSize,
            left: `calc(${pos.x}% - ${lensSize / 2}px)`,
            top: `calc(${pos.y}% - ${lensSize / 2}px)`,
            backgroundImage: `url(${magnified})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
          }}
        />
      ) : null}

      {/* Touch: pan a zoomed copy instead of a lens */}
      {touchZoomed ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `url(${magnified})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
            backgroundPosition: `${pos?.x ?? 50}% ${pos?.y ?? 50}%`,
          }}
        />
      ) : null}

      <span className="absolute bottom-3 end-3 text-[10px] font-bold tracking-widest uppercase bg-lotus-black/70 text-lotus-text-off px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
        Zoom
      </span>
    </div>
  )
}
