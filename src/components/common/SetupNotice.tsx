import { dataset, projectId } from '@/sanity/client'

type Reason = 'unconfigured' | 'empty' | 'error'

const COPY: Record<Reason, { title: string; body: string }> = {
  unconfigured: {
    title: 'Sanity is not connected yet',
    body: 'Add SANITY_PROJECT_ID and SANITY_DATASET to apps/web/.env, then restart the dev server.',
  },
  empty: {
    title: 'No published content found',
    body: 'The project is connected but the home page document is missing. Run the seed script (npm run seed in apps/studio) or publish the Home Page document in the Studio.',
  },
  error: {
    title: 'Could not reach Sanity',
    body: 'Check the project ID, the dataset visibility, and that this origin is allowed under Sanity → API → CORS origins.',
  },
}

/**
 * A deliberate, readable failure state. Better than a blank page when the
 * project has not been provisioned yet.
 */
export default function SetupNotice({
  reason,
  detail,
}: {
  reason: Reason
  detail?: string
}) {
  const copy = COPY[reason]

  return (
    <div className="min-h-screen bg-lotus-black text-lotus-text-off flex items-center justify-center px-8">
      <div className="max-w-xl w-full space-y-6">
        <p className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
          Lotus UAE
        </p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
          {copy.title}
        </h1>
        <p className="text-lotus-text-muted leading-relaxed">{copy.body}</p>
        {detail ? (
          <pre className="text-xs text-lotus-text-faint bg-lotus-grey border border-lotus-border rounded-sm p-4 whitespace-pre-wrap">
            {detail}
          </pre>
        ) : null}
        <dl className="text-xs tracking-widest uppercase text-lotus-text-faint space-y-1">
          <div>
            <dt className="inline">Project ID: </dt>
            <dd className="inline text-lotus-text-off">{projectId || '(not set)'}</dd>
          </div>
          <div>
            <dt className="inline">Dataset: </dt>
            <dd className="inline text-lotus-text-off">{dataset || '(not set)'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
