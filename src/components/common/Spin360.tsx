import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { imageSrc } from '@/sanity/image'
import { cn } from '@/lib/utils'
import type { Figure } from '@/sanity/types'

/**
 * Drag-to-rotate turntable viewer.
 *
 * Frames are preloaded before the viewer becomes interactive, otherwise the
 * first spin stutters while each frame is fetched. Keyboard arrows work too,
 * so the control is not mouse-only.
 */
export default function Spin360({
  frames,
  className,
  label = '360° view',
}: {
  frames: (Figure & { _key: string })[]
  className?: string
  label?: string
}) {
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(0)
  const dragging = useRef(false)
  const lastX = useRef(0)

  const urls = useMemo(
    () => frames.map((f) => imageSrc(f, 1400)).filter((u): u is string => !!u),
    [frames],
  )

  useEffect(() => {
    if (urls.length === 0) return
    let cancelled = false
    let done = 0
    setReady(false)
    setLoaded(0)
    urls.forEach((url) => {
      const img = new Image()
      const tick = () => {
        if (cancelled) return
        done += 1
        setLoaded(done)
        if (done === urls.length) setReady(true)
      }
      img.onload = tick
      // A missing frame shouldn't block the viewer forever.
      img.onerror = tick
      img.src = url
    })
    return () => {
      cancelled = true
    }
  }, [urls])

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + urls.length) % urls.length)
    },
    [urls.length],
  )

  const onPointerDown = (clientX: number) => {
    dragging.current = true
    lastX.current = clientX
  }

  const onPointerMove = (clientX: number, width: number) => {
    if (!dragging.current || urls.length === 0) return
    const dx = clientX - lastX.current
    // One full drag across the element ≈ one full rotation.
    const perFrame = width / urls.length
    if (Math.abs(dx) < perFrame) return
    step(dx > 0 ? 1 : -1)
    lastX.current = clientX
  }

  if (urls.length === 0) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={urls.length}
        aria-valuenow={index + 1}
        className="relative aspect-video bg-lotus-grey rounded-sm overflow-hidden cursor-ew-resize select-none touch-pan-y"
        onMouseDown={(e) => onPointerDown(e.clientX)}
        onMouseMove={(e) => onPointerMove(e.clientX, e.currentTarget.clientWidth)}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => onPointerMove(e.touches[0].clientX, e.currentTarget.clientWidth)}
        onTouchEnd={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
        }}
      >
        {/* Every frame stays mounted; only opacity changes, so switching
            frames never triggers a network request or a flash. */}
        {urls.map((url, i) => (
          <img
            key={frames[i]?._key ?? i}
            src={url}
            alt=""
            aria-hidden={i !== index}
            draggable={false}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-75',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}

        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center bg-lotus-black/70">
            <div className="text-center space-y-2">
              <p className="text-xs font-bold tracking-widest uppercase text-lotus-text-muted">
                {Math.round((loaded / urls.length) * 100)}%
              </p>
              <div className="w-40 h-px bg-lotus-border">
                <div
                  className="h-px bg-lotus-yellow transition-all"
                  style={{ width: `${(loaded / urls.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-xs tracking-widest uppercase text-lotus-text-faint text-center">
        {'\u2190'} Drag to rotate {'\u2192'}
      </p>
    </div>
  )
}
