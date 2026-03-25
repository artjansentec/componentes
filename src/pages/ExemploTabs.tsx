import { Box, Chip, Container, Typography } from '@mui/material'
import MuiTabsListagens from '@/components/Tabs/MuiTabsListagens'

type TrackerStatus = 'Entregue' | 'Em Trânsito' | 'Problema' | 'Pendentes'

function trackerChipColor(status: TrackerStatus) {
  switch (status) {
    case 'Entregue':
      return 'success'
    case 'Em Trânsito':
      return 'warning'
    case 'Problema':
      return 'error'
    case 'Pendentes':
      return 'info'
    default:
      return 'default'
  }
}

export function ExemploTabs() {
  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 2.5, textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.6 }}>
            Exemplo de Tabs (MUI)
          </Typography>
        </Box>

        <MuiTabsListagens
          abas={[
            {
              key: 'materias',
              label: 'Matérias',
              tableAriaLabel: 'Tabela de matérias',
              rowKey: (r) => (r as { codigo: string }).codigo,
              columns: [
                {
                  header: 'Código',
                  field: 'codigo',
                  sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
                },
                { header: 'Matéria', field: 'materia' },
                { header: 'Professor(a)', field: 'professor' },
                { header: 'Carga', field: 'carga' },
                {
                  header: 'Situação',
                  render: (r) => {
                    const situacao = (r as { situacao: 'Ativa' | 'Pendente' }).situacao
                    return (
                      <Chip
                        size="small"
                        label={situacao}
                        color={situacao === 'Ativa' ? 'success' : 'warning'}
                        sx={{ fontWeight: 700 }}
                      />
                    )
                  },
                },
              ],
              rows: [
                { codigo: 'MAT-101', materia: 'Matemática I', professor: 'Prof. Ana', carga: '60h', situacao: 'Ativa' as const },
                { codigo: 'FIS-201', materia: 'Física II', professor: 'Prof. Bruno', carga: '80h', situacao: 'Ativa' as const },
                { codigo: 'HIS-110', materia: 'História Geral', professor: 'Profa. Carla', carga: '40h', situacao: 'Pendente' as const },
                { codigo: 'QUI-150', materia: 'Química Básica', professor: 'Prof. Diego', carga: '60h', situacao: 'Ativa' as const },
                { codigo: 'POR-120', materia: 'Português', professor: 'Profa. Elisa', carga: '40h', situacao: 'Pendente' as const },
              ],
            },
            {
              key: 'rastreadores',
              label: 'Rastreadores',
              tableAriaLabel: 'Tabela de rastreadores',
              rowKey: (r, idx) => `${(r as { codigo: string }).codigo}-${idx}`,
              columns: [
                {
                  header: 'Código',
                  field: 'codigo',
                  sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
                },
                { header: 'Descrição', field: 'descricao', sx: { color: 'text.secondary' } },
                {
                  header: 'Status',
                  render: (r) => {
                    const status = (r as { status: TrackerStatus }).status
                    return (
                      <Chip
                        size="small"
                        label={status}
                        color={trackerChipColor(status)}
                        sx={{ fontWeight: 800, minWidth: 110 }}
                      />
                    )
                  },
                },
                { header: 'Local', field: 'local' },
                { header: 'Última Atualização', field: 'atualizadoEm', sx: { color: 'text.secondary' } },
              ],
              rows: [
                {
                  codigo: 'IB457APD0',
                  descricao: 'encomenda de rastreador X',
                  status: 'Entregue' as const,
                  local: 'Belo Horizonte',
                  atualizadoEm: '20/03, 21:45',
                },
                {
                  codigo: 'IB457APD0',
                  descricao: 'encomenda de rastreador X',
                  status: 'Em Trânsito' as const,
                  local: 'Belo Horizonte',
                  atualizadoEm: '20/03, 21:45',
                },
                {
                  codigo: 'IB457APD0',
                  descricao: 'encomenda de rastreador X',
                  status: 'Problema' as const,
                  local: 'Belo Horizonte',
                  atualizadoEm: '20/03, 21:45',
                },
                {
                  codigo: 'IB457APD0',
                  descricao: 'encomenda de rastreador X',
                  status: 'Pendentes' as const,
                  local: 'Belo Horizonte',
                  atualizadoEm: '20/03, 21:45',
                },
              ],
            },
            {
              key: 'chips',
              label: 'Chips',
              tableAriaLabel: 'Tabela de chips',
              rowKey: (r) => (r as { id: string }).id,
              columns: [
                {
                  header: 'Tipo',
                  field: 'tipo',
                  sx: { fontWeight: 700 },
                  width: 160,
                },
                {
                  header: 'Exemplo',
                  render: (r) => {
                    const { label, color, variant } = r as {
                      label: string
                      color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
                      variant?: 'filled' | 'outlined'
                    }
                    return (
                      <Chip
                        size="small"
                        label={label}
                        color={color}
                        variant={variant ?? 'filled'}
                        sx={{ fontWeight: 800, px: 0.25 }}
                      />
                    )
                  },
                },
                { header: 'Observação', field: 'obs', sx: { color: 'text.secondary' } },
              ],
              rows: [
                { id: 'c1', tipo: 'Sucesso', label: 'Entregue', color: 'success', obs: 'Use para status positivo' },
                { id: 'c2', tipo: 'Atenção', label: 'Em Trânsito', color: 'warning', obs: 'Use para andamento' },
                { id: 'c3', tipo: 'Erro', label: 'Problema', color: 'error', obs: 'Use para falhas' },
                { id: 'c4', tipo: 'Info', label: 'Pendentes', color: 'info', obs: 'Use para pendências' },
                { id: 'c5', tipo: 'Outline', label: 'Rótulo', color: 'primary', variant: 'outlined', obs: 'Variante outlined' },
              ],
            },
          ]}
        />
      </Container>
    </Box>
  )
}

