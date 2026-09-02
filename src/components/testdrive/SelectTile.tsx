import SanityImage from '@/components/common/SanityImage'
import { cn } from '@/lib/utils'
import type { Figure } from '@/sanity/types'

/** Picture-led option tile used for choosing a car or a showroom. */
export default function SelectTile({
  title,
  subtitle,
  image,
  selected,
  onSelect,
}: {
  title: string
  subtitle?: string
  image?: Figure | null
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group text-start border rounded-sm overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-lotus-yellow',
        selected
          ? 'border-lotus-yellow bg-lotus-yellow/5'
          : 'border-lotus-border hover:border-lotus-text-muted',
      )}
    >
      <div className="aspect-[16/10] bg-lotus-grey overflow-hidden relative">
        <SanityImage
          image={image}
          fallbackAlt={title}
          sizes="220px"
          width={600}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            selected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0',
          )}
        />
        {selected ? (
          <span
            aria-hidden="true"
            className="absolute top-2 end-2 w-6 h-6 rounded-full bg-lotus-yellow text-lotus-black text-xs font-bold flex items-center justify-center"
          >
            ✓
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <div
          className={cn(
            'text-sm font-bold uppercase tracking-wide',
            selected && 'text-lotus-yellow',
          )}
        >
          {title}
        </div>
        {subtitle ? (
          <div className="text-xs text-lotus-text-muted mt-1 line-clamp-2">{subtitle}</div>
        ) : null}
      </div>
    </button>
  )
}
