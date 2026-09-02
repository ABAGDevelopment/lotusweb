import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import CmsLink from '@/components/common/CmsLink'
import { cn } from '@/lib/utils'
import { ui } from '@/i18n/ui'
import { useLocale } from '@/i18n/LocaleProvider'
import type { StickyBarData } from '@/sanity/types'

export default function StickyActionBar({ data }: { data?: StickyBarData | null }) {
  const [visible, setVisible] = useState(false)
  const { locale } = useLocale()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!data || data.enabled === false) return null

  return (
    <div
      id="sticky-action-bar"
      className={cn(
        'fixed bottom-0 left-0 w-full z-[90] p-4 flex gap-3 bg-lotus-black/95 backdrop-blur-md border-t border-lotus-border transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {data.primaryCta ? (
        <CmsLink
          link={data.primaryCta}
          className="flex-1 btn-primary py-4 text-xs font-bold tracking-widest uppercase text-center"
        />
      ) : null}
      {data.secondaryCta ? (
        <CmsLink
          link={data.secondaryCta}
          className="flex-1 btn-outline py-4 text-xs font-bold tracking-widest uppercase bg-transparent text-center"
        />
      ) : null}
      {data.whatsappHref ? (
        <a
          href={data.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ui(locale, 'whatsapp')}
          className="w-14 h-14 flex items-center justify-center border border-lotus-border text-lotus-yellow text-xl rounded-sm shrink-0"
        >
          <FontAwesomeIcon icon={faWhatsapp} />
        </a>
      ) : null}
    </div>
  )
}
