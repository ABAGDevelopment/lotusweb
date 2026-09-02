import { useEffect } from 'react'
import { imageSrc } from '@/sanity/image'
import { useLocale } from '@/i18n/LocaleProvider'
import { useSite } from '@/sanity/ContentProvider'

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
 */
export default function SiteHead() {
  const site = useSite()
  const { t, locale } = useLocale()

  const seo = site?.home?.seo
  const settings = site?.settings

  const title = t(seo?.title) || t(settings?.siteTitle) || 'Lotus'
  const description = t(seo?.description) || t(settings?.siteDescription)
  const ogImage = imageSrc(seo?.ogImage ?? settings?.ogImage, 1200)
  const favicon = imageSrc(settings?.favicon, 64)

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
    if (favicon) upsertLink('icon', favicon)
  }, [title, description, ogImage, favicon, locale])

  return null
}
