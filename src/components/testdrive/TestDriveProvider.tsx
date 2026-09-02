import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import TestDriveForm from './TestDriveForm'
import { useLocale } from '@/i18n/LocaleProvider'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import { TEST_DRIVE_QUERY } from '@/sanity/queries'
import type { TestDrivePage } from '@/sanity/types'

interface TestDriveContextValue {
  /** Open the enquiry modal, optionally preselecting a model slug. */
  open: (modelSlug?: string) => void
}

const TestDriveContext = createContext<TestDriveContextValue | null>(null)

/**
 * One modal, mounted once, reachable from every "Book a Test Drive" CTA on the
 * site. Keeping it here rather than per-section means there is a single form
 * instance and a single source of truth for its open state.
 */
export function TestDriveProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState<string | undefined>()
  const [submittedName, setSubmittedName] = useState<string | null>(null)
  const { t, localePath } = useLocale()
  const navigate = useNavigate()
  const { data } = useLiveQuery<TestDrivePage>(TEST_DRIVE_QUERY)

  const open = useCallback((modelSlug?: string) => {
    setModel(modelSlug)
    setSubmittedName(null)
    setIsOpen(true)
  }, [])

  const onOpenChange = (next: boolean) => {
    setIsOpen(next)
    // Reset only after the close animation, so the form doesn't visibly
    // flip back from the success state on the way out.
    if (!next) window.setTimeout(() => setSubmittedName(null), 200)
  }

  /**
   * Close the modal, then follow the CTA. Without the navigation the button
   * reads "Back to Home" and only dismisses the dialog, which looks broken
   * from anywhere that isn't already the home page.
   */
  const goTo = (href?: string | null) => {
    onOpenChange(false)
    if (!href) return
    const [path, hash] = href.split('#')
    const pathname = localePath(path || '/')
    navigate(hash ? { pathname, hash: `#${hash}` } : { pathname })
  }

  const value = useMemo(() => ({ open }), [open])
  const thanks = data?.thankYou

  return (
    <TestDriveContext.Provider value={value}>
      {children}

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-lotus-black border-2 border-lotus-yellow text-lotus-text-off">
          {submittedName ? (
            <div className="space-y-6 py-6">
              <DialogHeader>
                {t(thanks?.eyebrow) ? (
                  <p className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
                    {t(thanks?.eyebrow)}
                  </p>
                ) : null}
                <DialogTitle className="font-display text-4xl font-bold uppercase tracking-tight">
                  {t(thanks?.heading)} {submittedName}
                </DialogTitle>
                <DialogDescription className="text-lotus-text-muted leading-relaxed pt-2">
                  {t(thanks?.body)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goTo(thanks?.primaryCta?.href)}
                  className="btn-primary px-8 py-3 text-sm font-bold tracking-widest uppercase"
                >
                  {t(thanks?.primaryCta?.label, 'Close')}
                </button>
                {thanks?.secondaryCta?.href ? (
                  <button
                    type="button"
                    onClick={() => goTo(thanks?.secondaryCta?.href)}
                    className="btn-outline px-8 py-3 text-sm font-bold tracking-widest uppercase"
                  >
                    {t(thanks?.secondaryCta?.label)}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                {t(data?.eyebrow) ? (
                  <p className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
                    {t(data?.eyebrow)}
                  </p>
                ) : null}
                <DialogTitle className="font-display text-3xl font-bold uppercase tracking-tight">
                  {t(data?.heading)}
                </DialogTitle>
                <DialogDescription className="text-lotus-text-muted leading-relaxed">
                  {t(data?.intro)}
                </DialogDescription>
              </DialogHeader>
              <TestDriveForm initialModel={model} onSuccess={setSubmittedName} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </TestDriveContext.Provider>
  )
}

export function useTestDrive(): TestDriveContextValue {
  const ctx = useContext(TestDriveContext)
  // Never throw here: a CTA that cannot find the provider should stay inert
  // rather than take the whole page down.
  return ctx ?? { open: () => undefined }
}

/** True when a CMS href points at the test-drive route in any language. */
export function isTestDriveHref(href?: string | null): boolean {
  if (!href) return false
  const path = href.split('?')[0].replace(/\/$/, '')
  return /^(\/[a-z]{2})?\/test-drive$/.test(path)
}

/** Pulls ?model=slug out of a CMS href so the modal can preselect it. */
export function modelFromHref(href?: string | null): string | undefined {
  if (!href) return undefined
  const q = href.split('?')[1]
  if (!q) return undefined
  return new URLSearchParams(q).get('model') ?? undefined
}
