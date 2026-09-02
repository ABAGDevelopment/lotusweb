import { Link, useLocation } from 'react-router-dom'
import { localeFromPath, ui } from '@/i18n/ui'

const NotFound = () => {
  const location = useLocation()
  const locale = localeFromPath(location.pathname)

  return (
    <div className="flex justify-center items-center min-h-screen bg-lotus-black text-lotus-text-off px-8">
      <div className="text-center space-y-6">
        <h1 className="font-display text-8xl font-bold tracking-tighter text-lotus-yellow">404</h1>
        <p className="text-xl text-lotus-text-muted">{ui(locale, 'notFoundTitle')}</p>
        <p className="text-xs tracking-widest uppercase text-lotus-text-faint font-mono">
          {location.pathname}
        </p>
        <div>
          <Link
            to="/"
            className="btn-primary inline-block px-10 py-4 text-sm font-bold tracking-widest uppercase"
          >
            {ui(locale, 'goHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
