/**
 * Rendered when a reference-backed section resolves to nothing.
 *
 * A section whose items all fail to resolve used to render as a bare heading
 * with empty space under it — the content looked "missing" with no clue why.
 * Now: in development you get a loud, specific diagnostic; in production the
 * section is omitted entirely rather than leaving a headless title.
 */
export default function MissingContent({
  section,
  documentType,
}: {
  section: string
  documentType: string
}) {
  if (!import.meta.env.DEV) return null

  return (
    <section className="px-5 md:px-8 lg:px-20 py-12">
      <div className="border border-dashed border-lotus-yellow/60 bg-lotus-yellow/5 rounded-sm p-6 space-y-3">
        <p className="text-lotus-yellow text-xs font-bold tracking-[0.3em] uppercase">
          Content missing — dev only
        </p>
        <h3 className="font-display text-2xl font-bold uppercase tracking-tight">
          “{section}” has no items to show
        </h3>
        <p className="text-sm text-lotus-text-muted leading-relaxed">
          Its references did not resolve. The linked{' '}
          <code className="text-lotus-text-off">{documentType}</code> documents are
          either unpublished (they exist only as drafts) or were deleted. The site
          reads published content only, so a draft-only document resolves to
          nothing.
        </p>
        <p className="text-sm text-lotus-text-muted leading-relaxed">
          Run <code className="text-lotus-text-off">npm run doctor</code> in
          <code className="text-lotus-text-off"> apps/studio</code> to see exactly
          which ones, or open them in the Studio and hit Publish.
        </p>
      </div>
    </section>
  )
}
