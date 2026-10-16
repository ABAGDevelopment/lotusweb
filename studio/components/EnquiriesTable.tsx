import {Box, Button, Card, Flex, Spinner, Stack, Text, TextInput} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'

interface Enquiry {
  _id: string
  fullName?: string
  email?: string
  phone?: string
  model?: string
  location?: string
  preferredDate?: string
  message?: string
  locale?: string
  submittedAt?: string
}

const QUERY = `*[_type == "testDriveEnquiry"] | order(submittedAt desc){
  _id, fullName, email, phone, model, location, preferredDate, message, locale, submittedAt
}`

const COLUMNS: {key: keyof Enquiry; label: string; width: string}[] = [
  {key: 'submittedAt', label: 'Received', width: '150px'},
  {key: 'fullName', label: 'Name', width: '160px'},
  {key: 'email', label: 'Email', width: '210px'},
  {key: 'phone', label: 'Phone', width: '140px'},
  {key: 'model', label: 'Model', width: '150px'},
  {key: 'location', label: 'Location', width: '150px'},
  {key: 'preferredDate', label: 'Preferred date', width: '130px'},
]

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function toCsv(rows: Enquiry[]) {
  const header = [...COLUMNS.map((c) => c.label), 'Message', 'Language']
  const cell = (v: unknown) => `"${(v == null ? '' : String(v)).replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [...COLUMNS.map((c) => r[c.key]), r.message, r.locale].map(cell).join(','),
  )
  return [header.map(cell).join(','), ...lines].join('\n')
}

/** Live table of test-drive enquiries with a text filter and CSV export. */
export function EnquiriesTable() {
  const client = useClient({apiVersion: '2024-10-01'})
  const [rows, setRows] = useState<Enquiry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const load = useCallback(async () => {
    try {
      setRows(await client.fetch<Enquiry[]>(QUERY))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [client])

  useEffect(() => {
    void load()
    const sub = client
      .listen(QUERY, {}, {visibility: 'query', events: ['mutation']})
      .subscribe({next: () => void load(), error: () => undefined})
    return () => sub.unsubscribe()
  }, [client, load])

  const visible = useMemo(() => {
    if (!rows) return []
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.fullName, r.email, r.phone, r.model, r.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [rows, filter])

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(visible)], {type: 'text/csv;charset=utf-8;'}))
    const a = document.createElement('a')
    a.href = url
    a.download = `test-drive-enquiries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <Card padding={4} tone="critical">
        <Text size={1}>Could not load enquiries: {error}</Text>
      </Card>
    )
  }

  if (!rows) {
    return (
      <Flex align="center" justify="center" padding={5}>
        <Spinner muted />
      </Flex>
    )
  }

  const cellStyle = {padding: '10px 12px', borderBottom: '1px solid var(--card-border-color)'}

  return (
    <Stack gap={4} padding={4}>
      <Flex align="center" gap={3} wrap="wrap">
        <Box flex={1} style={{minWidth: 220}}>
          <TextInput
            placeholder="Filter by name, email, phone, model or location"
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
          />
        </Box>
        <Text size={1} muted>
          {visible.length} of {rows.length}
        </Text>
        <Button
          text="Export CSV"
          tone="primary"
          mode="ghost"
          disabled={visible.length === 0}
          onClick={exportCsv}
        />
      </Flex>

      {visible.length === 0 ? (
        <Card padding={4} radius={2} tone="transparent" border>
          <Text size={1} muted>
            {rows.length === 0
              ? 'No enquiries yet. Submissions from the website appear here automatically.'
              : 'No enquiries match that filter.'}
          </Text>
        </Card>
      ) : (
        <Card radius={2} border overflow="auto">
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 13}}>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      ...cellStyle,
                      textAlign: 'left',
                      minWidth: c.width,
                      position: 'sticky',
                      top: 0,
                      background: 'var(--card-bg-color)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Text size={1} weight="semibold" muted>
                      {c.label}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r._id}>
                  {COLUMNS.map((c) => (
                    <td key={c.key} style={{...cellStyle, verticalAlign: 'top'}}>
                      <Text size={1}>
                        {c.key === 'submittedAt' ? formatDate(r.submittedAt) : r[c.key] || '—'}
                      </Text>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Stack>
  )
}
