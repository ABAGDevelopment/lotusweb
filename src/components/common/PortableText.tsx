import type { ReactNode } from 'react'
import CmsLink from '@/components/common/CmsLink'
import { cn } from '@/lib/utils'
import type { PortableTextBlock, PortableTextSpan } from '@/sanity/types'

/** The Studio validates links too; this also guards content written through the API. */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/

function Span({ span, markDefs }: { span: PortableTextSpan; markDefs: PortableTextBlock['markDefs'] }) {
  let node: ReactNode = span.text
  for (const mark of span.marks ?? []) {
    if (mark === 'strong') node = <strong className="font-semibold">{node}</strong>
    else if (mark === 'em') node = <em>{node}</em>
    else {
      const href = markDefs?.find((d) => d._key === mark)?.href
      if (href && SAFE_HREF.test(href)) {
        node = (
          <CmsLink link={{ href, external: /^https?:/.test(href) }} className="underline underline-offset-2">
            {node}
          </CmsLink>
        )
      }
    }
  }
  return <>{node}</>
}

function Inline({ block }: { block: PortableTextBlock }) {
  return (
    <>
      {(block.children ?? []).map((span) => (
        <Span key={span._key} span={span} markDefs={block.markDefs} />
      ))}
    </>
  )
}

/**
 * dir="auto" on each block: an Arabic page falling back to English copy would
 * otherwise lay the English out right to left and move its punctuation.
 *
 * Renders the Studio's localeRichText: paragraphs, h3, bullet and numbered
 * lists, bold, italic and links. Anything else is skipped.
 */
export default function PortableText({
  value,
  className,
}: {
  value?: PortableTextBlock[] | null
  className?: string
}) {
  const blocks = (value ?? []).filter((b) => b._type === 'block')
  if (!blocks.length) return null

  // Consecutive list items of one kind form one list.
  // ponytail: indented (nested) items render at one level; nest by `level` if editors need it.
  const groups: PortableTextBlock[][] = []
  for (const block of blocks) {
    const last = groups[groups.length - 1]
    if (block.listItem && last?.[0].listItem === block.listItem) last.push(block)
    else groups.push([block])
  }

  return (
    <div className={cn('space-y-4', className)}>
      {groups.map((group) => {
        const [first] = group
        if (first.listItem) {
          const List = first.listItem === 'number' ? 'ol' : 'ul'
          return (
            <List
              key={first._key}
              dir="auto"
              className={cn('space-y-2 ps-5', List === 'ol' ? 'list-decimal' : 'list-disc')}
            >
              {group.map((item) => (
                <li key={item._key} className="ps-1">
                  <Inline block={item} />
                </li>
              ))}
            </List>
          )
        }
        if (first.style === 'h3') {
          return (
            <h3 key={first._key} dir="auto" className="pt-4 text-sm font-semibold uppercase leading-5 tracking-[0.15em] text-white">
              <Inline block={first} />
            </h3>
          )
        }
        return (
          <p key={first._key} dir="auto">
            <Inline block={first} />
          </p>
        )
      })}
    </div>
  )
}
