/** Shown on first paint, before the first Sanity response arrives. */
export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-lotus-black px-5 md:px-8 lg:px-20 py-24 animate-pulse">
      <div className="h-6 w-32 bg-lotus-grey rounded-sm mb-16" />
      <div className="h-[520px] w-full bg-lotus-grey rounded-sm mb-16" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] bg-lotus-grey rounded-sm" />
            <div className="h-5 w-2/3 bg-lotus-grey rounded-sm" />
            <div className="h-4 w-1/2 bg-lotus-grey rounded-sm" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading content…</span>
    </div>
  )
}
