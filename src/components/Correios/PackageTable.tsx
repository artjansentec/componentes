import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { LocationOn, AccessTime, Edit, Delete } from '@mui/icons-material'
import type { Pacote } from './RastreamentoCorreios'

interface PackageTableProps {
  packages: Pacote[]
  onEdit?: (pkg: Pacote) => void
  onDelete?: (codigo: string) => void
}

function getStatusConfig(status: Pacote['status']) {
  switch (status) {
    case 'Entregue':
      return { label: 'Entregue', color: '#16a34a', bgColor: '#f0fdf4' }
    case 'Em trânsito':
      return { label: 'Em Trânsito', color: '#2563eb', bgColor: '#eff6ff' }
    case 'Pendente':
      return { label: 'Pendente', color: '#ea580c', bgColor: '#fff7ed' }
    case 'Problema':
      return { label: 'Problema', color: '#ea580c', bgColor: '#fff7ed' }
    case 'Devolvido':
      return { label: 'Devolvido', color: '#dc2626', bgColor: '#fef2f2' }
    default:
      return { label: status, color: '#64748b', bgColor: '#f1f5f9' }
  }
}

export function PackageTable({ packages, onEdit, onDelete }: PackageTableProps) {
  if (packages.length === 0) {
    return (
      <Paper
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          p: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
          Nenhum pacote cadastrado ainda.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Clique em "Novo Pacote" para começar a rastrear.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        boxShadow: 1,
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                Código
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                Descrição
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                Local
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                Última Atualização
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary', width: 120 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((pkg) => {
              const statusConfig = getStatusConfig(pkg.status)
              return (
                <TableRow
                  key={pkg.codigo}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.875rem' }}>
                    {pkg.codigo}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{pkg.descricao}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig.label}
                      size="small"
                      sx={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                      {pkg.local || 'Aguardando postagem'}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                      {pkg.ultimaAtualizacao || '-'}
                    </Box>
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {onEdit && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEdit(pkg)}
                            sx={{ p: 0.5 }}
                            title="Editar pacote"
                          >
                            <Edit sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja remover o pacote ${pkg.codigo}?`)) {
                                onDelete(pkg.codigo)
                              }
                            }}
                            sx={{ p: 0.5 }}
                            title="Remover pacote"
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
