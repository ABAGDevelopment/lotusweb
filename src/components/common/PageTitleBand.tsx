import type { ReactNode } from 'react'
import SanityImage from '@/components/common/SanityImage'
import { SECTION_X } from '@/components/testdrive/TestDriveForm'
import { cn } from '@/lib/utils'
import type { Figure } from '@/sanity/types'

/** The black band at the top of a list page: optional dimmed photo, yellow heading, intro. */
export default function PageTitleBand({
  heading,
  intro,
  image,
  children,
}: {
  heading: string
  intro?: string
  image?: Figure | null
  /** Extra lines under the intro. */
  children?: ReactNode
}) {
  return (
    <section className="relative flex h-[300px] flex-col justify-end overflow-hidden bg-black text-white lg:h-[380px]">
      {image ? (
        <SanityImage
          image={image}
          sizes="100vw"
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
      <div className={cn('relative pb-10 lg:pb-14', SECTION_X)}>
        <h1 className="font-display break-words text-[30px] uppercase leading-[1.1] text-lotus-yellow lg:text-[48px] lg:leading-[48px] [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]">
          {heading}
        </h1>
        {intro ? <p className="mt-5 max-w-[560px] text-base font-light leading-6">{intro}</p> : null}
        {children}
      </div>
    </section>
  )
}
