import { useId, useState } from 'react'
import {
  Box,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

type TabPanelProps = {
  children: React.ReactNode
  value: number
  index: number
  labelledById: string
  panelId: string
}

function TabPanel({ children, value, index, labelledById, panelId }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={panelId} aria-labelledby={labelledById}>
      {value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null}
    </div>
  )
}

export type MuiTabsColumn<Row> = {
  header: React.ReactNode
  field?: keyof Row
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit'
  sx?: SxProps<Theme>
  headSx?: SxProps<Theme>
  width?: number | string
  render?: (row: Row, rowIndex: number) => React.ReactNode
}

export type MuiTabsAba<Row = unknown> = {
  key: string
  label: React.ReactNode
  ariaLabel?: string
  rows: Row[]
  columns: Array<MuiTabsColumn<Row>>
  rowKey?: (row: Row, rowIndex: number) => string
  tableAriaLabel?: string
}

export type MuiTabsListagensProps = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  abas: Array<MuiTabsAba<any>>
}

function getCellValue<Row extends Record<string, unknown>>(row: Row, field?: keyof Row) {
  if (!field) return ''
  const v = row[field]
  if (v == null) return ''
  return typeof v === 'string' || typeof v === 'number' ? v : String(v)
}

export default function MuiTabsListagens(props: MuiTabsListagensProps) {
  const uid = useId()
  const [tab, setTab] = useState(0)

  const { title = 'Listagens', subtitle, abas } = props

  const safeTab = Math.min(tab, Math.max(abas.length - 1, 0))

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.25, pb: 1.5, textAlign: 'left' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ px: 1.5 }}>
        <Tabs
          value={safeTab}
          onChange={(_, v: number) => setTab(v)}
          aria-label="Abas de listagens"
          sx={{
            px: 1,
            '& .MuiTabs-indicator': { height: 3, borderRadius: 999 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 650,
              minHeight: 44,
              borderRadius: 2,
              mx: 0.5,
            },
          }}
        >
          {abas.map((a, idx) => (
            <Tab
              key={a.key}
              id={`tab-${uid}-${a.key}`}
              aria-controls={`panel-${uid}-${a.key}`}
              label={a.label}
              aria-label={a.ariaLabel}
              value={idx}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ px: 2.5, pb: 2.5 }}>
        {abas.map((a, idx) => (
          <TabPanel
            key={a.key}
            value={safeTab}
            index={idx}
            labelledById={`tab-${uid}-${a.key}`}
            panelId={`panel-${uid}-${a.key}`}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Table size="small" aria-label={a.tableAriaLabel ?? 'Tabela'}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(2,6,23,0.04)' }}>
                    {a.columns.map((c, cidx) => (
                      <TableCell
                        key={`${a.key}-head-${cidx}`}
                        align={c.align}
                        sx={{ fontWeight: 700, ...(c.headSx as object) }}
                        style={c.width ? { width: c.width } : undefined}
                      >
                        {c.header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {a.rows.map((row, rowIndex) => {
                    const key = a.rowKey?.(row, rowIndex) ?? `${a.key}-${rowIndex}`
                    return (
                      <TableRow
                        key={key}
                        hover
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(2,6,23,0.02)' },
                        }}
                      >
                        {a.columns.map((c, cidx) => (
                          <TableCell
                            key={`${key}-cell-${cidx}`}
                            align={c.align}
                            sx={c.sx}
                            style={c.width ? { width: c.width } : undefined}
                          >
                            {c.render
                              ? c.render(row, rowIndex)
                              : getCellValue(row as Record<string, unknown>, c.field as keyof Record<string, unknown>)}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Paper>
          </TabPanel>
        ))}
      </Box>
    </Paper>
  )
}

