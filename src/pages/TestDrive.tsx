import { useNavigate, useSearchParams } from 'react-router-dom'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import SanityImage from '@/components/common/SanityImage'
import PageSkeleton from '@/components/common/PageSkeleton'
import TestDriveForm from '@/components/testdrive/TestDriveForm'
import { useLocale } from '@/i18n/LocaleProvider'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import { TEST_DRIVE_QUERY } from '@/sanity/queries'
import type { TestDrivePage } from '@/sanity/types'

/**
 * Standalone page for direct links and SEO. The form itself is the same
 * component the modal renders — duplicating it here is how the page ended up
 * with an older, buggier copy.
 */
export default function TestDrive() {
  const { t, localePath } = useLocale()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data, loading } = useLiveQuery<TestDrivePage>(TEST_DRIVE_QUERY)

  if (loading && !data) return <PageSkeleton />

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <Navbar />
      <main className="pt-32 pb-24 px-5 md:px-8 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            {t(data?.eyebrow) ? (
              <span className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
                {t(data?.eyebrow)}
              </span>
            ) : null}
            <h1 className="font-display text-5xl lg:text-7xl font-bold uppercase tracking-tighter leading-none">
              {t(data?.heading)}
            </h1>
            <p className="text-lg text-lotus-text-muted leading-relaxed">{t(data?.intro)}</p>
            {data?.image ? (
              <SanityImage
                image={data.image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full aspect-[4/3] object-cover rounded-sm mt-8"
              />
            ) : null}
          </div>

          <div className="border-2 border-lotus-yellow rounded-sm p-6 lg:p-8">
            <TestDriveForm
              initialModel={params.get('model') ?? undefined}
              onSuccess={(name) =>
                navigate(localePath('/test-drive/thank-you'), {
                  replace: true,
                  state: { name },
                })
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
