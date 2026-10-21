import { useEffect } from 'react'
import { imageSrc } from '@/sanity/image'
import { useLocale } from '@/i18n/LocaleProvider'
import { useSite } from '@/sanity/ContentProvider'
import type { Figure } from '@/sanity/types'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Keeps <head> in sync with the CMS. Because content streams in live, the
 * title and social tags update with the rest of the page.
 *
 * With no props it describes the home page. Other pages pass their own title,
 * description and share image; the site title is appended to theirs.
 *
 * These tags are set in the browser. Google renders them; link-preview bots
 * (WhatsApp, LinkedIn, X) do not run JavaScript and see index.html's tags.
 */
export default function SiteHead({
  title: pageTitle,
  description: pageDescription,
  image,
}: {
  title?: string
  description?: string
  image?: Figure | null
} = {}) {
  const site = useSite()
  const { t, locale } = useLocale()

  const seo = pageTitle ? null : site?.home?.seo
  const settings = site?.settings
  const siteTitle = t(settings?.siteTitle) || 'Lotus'

  const title = pageTitle ? `${pageTitle} | ${siteTitle}` : t(seo?.title) || siteTitle
  const description = pageDescription || t(seo?.description) || t(settings?.siteDescription)
  const ogImage = imageSrc(image ?? seo?.ogImage ?? settings?.ogImage, 1200)
  const favicon = imageSrc(settings?.favicon, 64)
  const url = typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description })
      upsertMeta('meta[property="og:description"]', {
        property: 'og:description',
        content: description,
      })
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: locale === 'ar' ? 'ar_AE' : 'en_AE',
    })
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })
    }
    if (url) {
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
      upsertLink('canonical', url)
    }
    if (favicon) upsertLink('icon', favicon)
  }, [title, description, ogImage, favicon, locale, url])

  return null
}
