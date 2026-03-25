// Componente reutilizável de rastreamento de pacotes dos Correios
// UI feita com MUI + Bootstrap (CSS) e lógica desacoplada para futuro backend.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Search, Inventory } from '@mui/icons-material'
import axios from 'axios'
import { StatusSummaryCards } from './StatusSummaryCards'
import { PackageTable } from './PackageTable'
import { NewPackageDialog, NewPackageButton } from './NewPackageDialog'
import '../../App.css'

// import axios from 'axios' // <- descomentar quando tiver backend
// const API_BASE_URL = 'http://localhost:3000' // ajustar para a URL real do backend

type StatusPacote =
  | 'Pendente'
  | 'Em trânsito'
  | 'Saiu para entrega'
  | 'Entregue'
  | 'Problema'
  | 'Devolvido'

type EventoRastreio = {
  dataHora: string
  descricao: string
  local: string
}

export type Pacote = {
  codigo: string
  descricao: string
  status: StatusPacote
  local: string
  ultimaAtualizacao: string
  eventos: EventoRastreio[]
}

const STORAGE_KEY = 'correios_pacotes'

function carregarPacotesLocal(): Pacote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Pacote[]
  } catch {
    return []
  }
}

function salvarPacotesLocal(pacotes: Pacote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pacotes))
}

function formatarDataHora(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function rastrearPacoteBackend(codigo: string): Promise<Partial<Pacote>> {
  try {
    const response = await axios.get('https://api.linketrack.com/track/json', {
      params: { codigo },
    })

    const data = response.data as any

    // Pega o último evento (o mais recente) se existir
    const ultimoEvento = Array.isArray(data.eventos) && data.eventos.length
      ? data.eventos[0]
      : null

    // Mapeia o status da API para o StatusPacote interno
    const statusTexto: string = (data.status || ultimoEvento?.status || '').toLowerCase()
    debugger;
    let status: StatusPacote = 'Pendente'
    if (statusTexto.includes('entregue')) status = 'Entregue'
    else if (statusTexto.includes('trânsito') || statusTexto.includes('transito')) status = 'Em trânsito'
    else if (statusTexto.includes('saiu para entrega')) status = 'Saiu para entrega'
    else if (statusTexto.includes('devolvido')) status = 'Devolvido'
    else if (statusTexto.includes('erro') || statusTexto.includes('falha') || statusTexto.includes('problema')) {
      status = 'Problema'
    }

    const eventos: EventoRastreio[] = Array.isArray(data.eventos)
      ? data.eventos.map((e: any) => ({
          dataHora: `${e.data ?? ''} ${e.hora ?? ''}`.trim(),
          descricao: e.status ?? '',
          local: e.local ?? '',
        }))
      : []

    return {
      status,
      local: ultimoEvento?.local || data.local || '',
      eventos,
    }
  } catch (error) {
    console.error('Erro ao consultar API Linketrack para código:', codigo, error)
    return {}
  }
}

export function RastreamentoCorreios() {
  const [pacotes, setPacotes] = useState<Pacote[]>(() => carregarPacotesLocal())
  const [buscaCodigo, setBuscaCodigo] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [pacoteEditando, setPacoteEditando] = useState<Pacote | null>(null)

  // Salvar no localStorage sempre que a lista mudar
  useEffect(() => {
    salvarPacotesLocal(pacotes)
  }, [pacotes])

  // Função de atualização usando useCallback para manter referência estável
  const atualizarTodosPacotes = useCallback(async () => {
    // Obtém os pacotes atuais através do setState com função
    setPacotes((pacotesAtuais) => {
      if (!pacotesAtuais.length) return pacotesAtuais

      // Inicia a atualização assíncrona
      Promise.all(
        pacotesAtuais.map(async (p) => {
          // Futuramente, aqui chamaremos o backend que já terá consultado a API dos Correios:
          const dadosBackend = await rastrearPacoteBackend(p.codigo)

          // Mescla dos dados atuais com os vindos do backend
          const agora = new Date()
          return {
            ...p,
            ...dadosBackend,
            ultimaAtualizacao: formatarDataHora(agora),
          }
        }),
      )
        .then((atualizados) => {
          // Atualiza o estado com os dados atualizados
          setPacotes(atualizados)
        })
        .catch((error) => {
          console.error('Erro ao atualizar pacotes:', error)
        })

      // Retorna o estado atual enquanto a atualização está em andamento
      return pacotesAtuais
    })
  }, [])

  // Atualização automática a cada 5 minutos enquanto a tela estiver aberta
  useEffect(() => {
    if (!pacotes.length) return

    // Atualiza imediatamente ao montar o componente (se houver pacotes)
    atualizarTodosPacotes()

    // Configura o intervalo para atualizar a cada 5 minutos (300000 ms)
    const intervalo = setInterval(() => {
      atualizarTodosPacotes()
    }, 5 * 60 * 1000)

    // Limpa o intervalo quando o componente desmontar ou quando pacotes.length mudar
    return () => clearInterval(intervalo)
  }, [pacotes.length, atualizarTodosPacotes])

  const listaFiltrada = useMemo(() => {
    return pacotes.filter((p) => {
      const buscaOk =
        !buscaCodigo ||
        p.codigo.toLowerCase().includes(buscaCodigo.toLowerCase()) ||
        p.descricao.toLowerCase().includes(buscaCodigo.toLowerCase()) ||
        p.local.toLowerCase().includes(buscaCodigo.toLowerCase())
      return buscaOk
    })
  }, [pacotes, buscaCodigo])

  const counts = useMemo(() => {
    return {
      total: pacotes.length,
      entregue: pacotes.filter((p) => p.status === 'Entregue').length,
      em_transito: pacotes.filter((p) => p.status === 'Em trânsito').length,
      pendente: pacotes.filter((p) => p.status === 'Pendente').length,
      devolvido: pacotes.filter((p) => p.status === 'Devolvido').length,
      problema: pacotes.filter((p) => p.status === 'Problema').length,
    }
  }, [pacotes])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 2.5,
            }}
          >
            <Box
              sx={{
                height: 40,
                width: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory sx={{ color: 'primary.contrastText', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                Rastreio de Pacotes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Acompanhe suas entregas em tempo real
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 3 }}>
        {/* Summary cards */}
        <StatusSummaryCards counts={counts} />

        {/* Search + Add button */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <TextField
            placeholder="Buscar por código, descrição ou local..."
            value={buscaCodigo}
            onChange={(e) => setBuscaCodigo(e.target.value)}
            sx={{ flex: 1, maxWidth: { sm: 400 } }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <NewPackageButton onClick={() => setModalAberto(true)} />
        </Box>

        {/* Table */}
        <PackageTable
          packages={listaFiltrada}
          onEdit={(pkg) => {
            setPacoteEditando(pkg)
            setModalAberto(true)
          }}
          onDelete={(codigo) => {
            setPacotes((prev) => prev.filter((p) => p.codigo !== codigo))
          }}
        />
      </Container>

      {/* Dialog */}
      <NewPackageDialog
        open={modalAberto}
        onClose={() => {
          setModalAberto(false)
          setPacoteEditando(null)
        }}
        pacoteEditando={pacoteEditando}
        onAdd={(pkg) => {
          setPacotes((prev) => {
            if (prev.some((p) => p.codigo === pkg.codigo)) {
              alert('Este código já está cadastrado.')
              return prev
            }
            return [pkg, ...prev]
          })
        }}
        onEdit={(pkgAtualizado) => {
          setPacotes((prev) =>
            prev.map((p) => (p.codigo === pkgAtualizado.codigo ? pkgAtualizado : p))
          )
          setPacoteEditando(null)
        }}
      />
    </Box>
  )
}

