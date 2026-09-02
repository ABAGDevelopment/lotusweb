import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { LOCALES, useLocale } from '@/i18n/LocaleProvider'
import type { Link as CmsLinkData } from '@/sanity/types'

interface CmsLinkProps {
  link?: CmsLinkData | null
  className?: string
  children?: ReactNode
  /** Text used when the CMS link has no label yet. */
  fallbackLabel?: string
  /** Render nothing at all when the link has neither label nor children. */
  hideWhenEmpty?: boolean
}

function isInternalRoute(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

/** An editor may already have written the prefix; don't add a second one. */
function hasLocalePrefix(href: string) {
  return LOCALES.some((l) => href === `/${l}` || href.startsWith(`/${l}/`))
}

/**
 * One link component for every CTA in the site. Anchor links (`#range`),
 * absolute URLs and in-app routes are all editable from the Studio, so this
 * picks the right element for whatever the editor typed.
 */
export default function CmsLink({
  link,
  className,
  children,
  fallbackLabel = '',
  hideWhenEmpty = true,
}: CmsLinkProps) {
  const { t, localePath } = useLocale()
  const label = t(link?.label, fallbackLabel)
  const content = children ?? label
  const href = link?.href?.trim()

  if (hideWhenEmpty && !content && !children) return null

  if (!href) {
    return (
      <span className={className} role="link" aria-disabled="true">
        {content}
      </span>
    )
  }

  if (link?.external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  if (isInternalRoute(href)) {
    // Keep in-app links inside the current language: /test-drive becomes
    // /ar/test-drive when the visitor is reading Arabic.
    return (
      <RouterLink className={className} to={hasLocalePrefix(href) ? href : localePath(href)}>
        {content}
      </RouterLink>
    )
  }

  return (
    <a className={className} href={href}>
      {content}
    </a>
  )
}
