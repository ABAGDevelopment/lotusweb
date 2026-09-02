import { forwardRef } from 'react'
import { buildSrcSet, imageSrc, lqip } from '@/sanity/image'
import { useLocale } from '@/i18n/LocaleProvider'
import type { Figure } from '@/sanity/types'
import { cn } from '@/lib/utils'

interface SanityImageProps {
  image?: Figure | null
  className?: string
  /** Rendered width hint for the browser's srcset selection. */
  sizes?: string
  /** Hero-style images should load eagerly; everything else lazily. */
  priority?: boolean
  /** Widest variant to request as the `src` fallback. */
  width?: number
  fallbackAlt?: string
}

/**
 * Renders a Sanity image with a responsive srcset and a low-quality blur
 * placeholder. When the document has no image yet, a neutral block keeps the
 * layout intact instead of collapsing.
 */
const SanityImage = forwardRef<HTMLImageElement, SanityImageProps>(
  ({ image, className, sizes = '100vw', priority = false, width = 1920, fallbackAlt = '' }, ref) => {
    const { t } = useLocale()

    if (!image?.asset?._id) {
      return <div className={cn('bg-lotus-grey', className)} aria-hidden="true" />
    }

    const placeholder = lqip(image)

    return (
      <img
        ref={ref}
        src={imageSrc(image, width)}
        srcSet={buildSrcSet(image)}
        sizes={sizes}
        alt={t(image.alt, fallbackAlt)}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={
          placeholder
            ? {
                backgroundImage: `url(${placeholder})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
    )
  },
)

SanityImage.displayName = 'SanityImage'

export default SanityImage
