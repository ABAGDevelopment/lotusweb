import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CmsLink from '@/components/common/CmsLink'
import LotusLogo from '@/components/common/LotusLogo'
import { useLocale } from '@/i18n/LocaleProvider'
import { useSite } from '@/sanity/ContentProvider'
import { cn } from '@/lib/utils'
import { ui } from '@/i18n/ui'

export default function Navigation() {
  const site = useSite()
  const nav = site?.navigation
  const { t, locale, pathFor } = useLocale()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page behind the mobile drawer while it is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const links = (nav?.links ?? []).filter(Boolean)
  const toggleTarget = locale === 'ar' ? 'en' : 'ar'
  const toggleLabel = `${nav?.languageToggle?.enLabel ?? 'EN'} / ${
    nav?.languageToggle?.arLabel ?? 'عربي'
  }`

  const switchLanguage = () => {
    setMenuOpen(false)
    navigate(pathFor(toggleTarget))
  }

  return (
    <>
      <header
        id="header"
        className={cn(
          'fixed top-0 z-[100] w-full px-5 py-5 grid grid-cols-[1fr_auto_1fr] items-center md:flex md:justify-between md:px-8 md:py-6 transition-colors duration-500',
          scrolled
            ? 'bg-lotus-black/90 backdrop-blur-md border-b border-lotus-border'
            : 'bg-transparent',
        )}
      >
        <div className="col-start-2 row-start-1 flex items-center gap-12">
          <Link
            to={pathFor(locale)}
            aria-label={nav?.logoText || 'Lotus'}
            className="block text-lotus-text-off hover:text-lotus-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-lotus-yellow"
          >
            {/* currentColor comes from the classes above, so the mark is
                off-white in the header and yellow on hover. */}
            <LotusLogo title={nav?.logoText || 'Lotus'} className="h-6 w-auto" />
          </Link>
          {nav?.statusBadge?.enabled !== false && t(nav?.statusBadge?.label) ? (
            <div className="hidden lg:flex items-center gap-1 text-xs font-medium tracking-widest text-lotus-text-muted">
              <span className="w-2 h-2 rounded-full bg-lotus-yellow animate-pulse me-2" />
              {t(nav?.statusBadge?.label)}
            </div>
          ) : null}
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <CmsLink
              key={link._key}
              link={link}
              className="nav-link relative text-sm font-medium tracking-widest uppercase"
            />
          ))}
        </nav>

        <div className="contents md:flex md:items-center md:gap-6">
          <button
            type="button"
            onClick={switchLanguage}
            className="col-start-1 row-start-1 justify-self-start text-lotus-yellow md:text-current text-xs font-bold tracking-widest hover:text-lotus-yellow transition-colors"
            aria-label={ui(locale, toggleTarget === 'ar' ? 'switchToArabic' : 'switchToEnglish')}
          >
            {toggleLabel}
          </button>
          {nav?.cta ? (
            <CmsLink
              link={nav.cta}
              className="btn-primary hidden md:inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase"
            />
          ) : null}
          <button
            type="button"
            className="col-start-3 row-start-1 justify-self-end md:hidden text-2xl"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={ui(locale, 'toggleMenu')}
          >
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[99] bg-lotus-black/95 backdrop-blur-lg md:hidden transition-opacity duration-300',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <nav className="flex h-full flex-col items-start justify-center gap-8 px-5">
          {links.map((link) => (
            <CmsLink
              key={link._key}
              link={link}
              className="font-display text-4xl font-bold uppercase tracking-tight hover:text-lotus-yellow transition-colors"
            />
          ))}
          {nav?.cta ? (
            <CmsLink
              link={nav.cta}
              className="btn-primary mt-6 px-8 py-4 text-sm font-bold tracking-widest uppercase"
            />
          ) : null}
        </nav>
      </div>
    </>
  )
}
