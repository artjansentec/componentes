import { Box, Card, CardContent, Typography } from '@mui/material'
import {
  Inventory,
  CheckCircle,
  LocalShipping,
  HourglassEmpty,
  RotateLeft,
  Warning,
} from '@mui/icons-material'

type StatusCount = {
  total: number
  entregue: number
  em_transito: number
  pendente: number
  devolvido: number
  problema: number
}

interface StatusSummaryCardsProps {
  counts: StatusCount
}

export function StatusSummaryCards({ counts }: StatusSummaryCardsProps) {
  const cards = [
    {
      label: 'Total',
      count: counts.total,
      icon: <Inventory sx={{ fontSize: 20 }} />,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#2563eb33',
    },
    {
      label: 'Entregue',
      count: counts.entregue,
      icon: <CheckCircle sx={{ fontSize: 20 }} />,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      borderColor: '#16a34a33',
    },
    {
      label: 'Em Trânsito',
      count: counts.em_transito,
      icon: <LocalShipping sx={{ fontSize: 20 }} />,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#2563eb33',
    },
    {
      label: 'Pendente',
      count: counts.pendente,
      icon: <HourglassEmpty sx={{ fontSize: 20 }} />,
      color: '#ea580c',
      bgColor: '#fff7ed',
      borderColor: '#ea580c33',
    },
    {
      label: 'Devolvido',
      count: counts.devolvido,
      icon: <RotateLeft sx={{ fontSize: 20 }} />,
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#dc262633',
    },
    {
      label: 'Problema',
      count: counts.problema,
      icon: <Warning sx={{ fontSize: 20 }} />,
      color: '#ea580c',
      bgColor: '#fff7ed',
      borderColor: '#ea580c33',
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 1.5,
        mb: 3,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          sx={{
            borderRadius: 2,
            border: `1px solid ${card.borderColor}`,
            backgroundColor: card.bgColor,
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ color: card.color }}>{card.icon}</Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: card.color, fontSize: '0.875rem' }}
              >
                {card.label}
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: card.color, fontSize: '1.5rem' }}
            >
              {card.count}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
