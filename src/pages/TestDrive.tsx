import { useNavigate, useSearchParams } from 'react-router-dom'
import '@/styles/lotus-uae-for-the-drivers.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import SanityImage from '@/components/common/SanityImage'
import PageSkeleton from '@/components/common/PageSkeleton'
import TestDriveForm, {
  SECTION_HEADING,
  SECTION_X,
  StepNumber,
} from '@/components/testdrive/TestDriveForm'
import { useLocale } from '@/i18n/LocaleProvider'
import { useLiveQuery } from '@/sanity/useLiveQuery'
import { TEST_DRIVE_QUERY } from '@/sanity/queries'
import { cn } from '@/lib/utils'
import type { TestDrivePage } from '@/sanity/types'

/**
 * Figma "Book a test drive" (454:2082). Every "Book a Test Drive" link comes
 * here; ?model=<slug> preselects the car. All copy is the Test drive page
 * document in Studio.
 */
export default function TestDrive() {
  const { t, localePath } = useLocale()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data, loading } = useLiveQuery<TestDrivePage>(TEST_DRIVE_QUERY)

  if (loading && !data) return <PageSkeleton />

  const next = data?.nextSteps
  const disclaimers = (data?.disclaimers ?? []).map((d) => t(d)).filter(Boolean)

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <Navbar />
      <main>
        {/* Title band: the photo at 40% under a gradient, copy at the bottom. */}
        <section className="relative flex h-[340px] flex-col justify-end overflow-hidden bg-black text-white lg:h-[420px]">
          {data?.image ? (
            <SanityImage
              image={data.image}
              sizes="100vw"
              priority
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          <div className={cn('relative pb-10 lg:pb-16', SECTION_X)}>
            {t(data?.eyebrow) ? (
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-lotus-yellow">{t(data?.eyebrow)}</p>
            ) : null}
            <h1 className="font-display mb-5 break-words text-[30px] uppercase leading-[1.1] text-lotus-yellow lg:text-[48px] lg:leading-[48px] [--lotus-display-tracking:0.18em] rtl:[--lotus-display-tracking:normal]">
              {t(data?.heading)}
            </h1>
            {t(data?.intro) ? (
              <p className="max-w-[512px] text-base font-light leading-6">{t(data?.intro)}</p>
            ) : null}
          </div>
        </section>

        <TestDriveForm
          data={data}
          initialModel={params.get('model') ?? undefined}
          onSuccess={(name) =>
            navigate(localePath('/test-drive/thank-you'), { replace: true, state: { name } })
          }
        />

        {next?.items?.length ? (
          <section
            className={cn(
              'flex flex-col items-center gap-10 bg-[#f7f7f7] py-14 text-black lg:gap-14 lg:py-20',
              SECTION_X,
            )}
          >
            {t(next.heading) ? <h2 className={cn(SECTION_HEADING, 'text-center')}>{t(next.heading)}</h2> : null}
            <ol className="grid w-full max-w-[896px] gap-10 md:grid-cols-2 md:gap-12">
              {next.items.map((item, i) => (
                <li key={item._key} className="flex items-start gap-5">
                  <StepNumber n={i + 1} />
                  <div>
                    <h3 className="text-sm font-semibold uppercase leading-5 tracking-[0.15em]">{t(item.title)}</h3>
                    <p className="mt-[11px] whitespace-pre-line text-sm leading-[22.75px] text-[#5a5a5a]">
                      {t(item.body)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </main>
      <Footer />
      {disclaimers.length ? (
        <div className={cn('border-t border-white/5 bg-black pb-10 pt-[41px]', SECTION_X)}>
          <ol className="max-w-[896px] space-y-3 text-[11px] font-light leading-[17.88px] text-[#6b6b6b]">
            {disclaimers.map((text, i) => (
              <li key={i}>
                <sup className="text-[8.3px]">{i + 1}</sup> {text}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  )
}
