import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource,
} from '@sanity/image-url'
import { dataset, isSanityConfigured, projectId } from './client'
import type { Figure } from './types'

const builder = isSanityConfigured ? createImageUrlBuilder({ projectId, dataset }) : null

/** Returns null when the image (or the project) is not set up yet. */
export function urlFor(source: Figure | null | undefined): ImageUrlBuilder | null {
  if (!builder || !source?.asset?._id) return null
  // `Figure` carries asset/hotspot/crop, which is exactly what the builder
  // needs to honour the editor's chosen focal point.
  return builder.image(source as unknown as SanityImageSource).auto('format').fit('crop')
}

export const DEFAULT_WIDTHS = [480, 768, 1024, 1440, 1920, 2560]

export function buildSrcSet(
  source: Figure | null | undefined,
  widths: number[] = DEFAULT_WIDTHS,
): string | undefined {
  const base = urlFor(source)
  if (!base) return undefined
  return widths.map((w) => `${base.width(w).url()} ${w}w`).join(', ')
}

export function imageSrc(
  source: Figure | null | undefined,
  width = 1600,
): string | undefined {
  return urlFor(source)?.width(width).url()
}

export function aspectRatio(source: Figure | null | undefined): number | undefined {
  return source?.asset?.metadata?.dimensions?.aspectRatio
}

export function lqip(source: Figure | null | undefined): string | undefined {
  return source?.asset?.metadata?.lqip ?? undefined
}
