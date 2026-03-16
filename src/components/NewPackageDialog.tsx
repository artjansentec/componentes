import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import type { Pacote } from './RastreamentoCorreios'

interface NewPackageDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (pkg: Pacote) => void
  pacoteEditando?: Pacote | null
  onEdit?: (pkg: Pacote) => void
}

export function NewPackageDialog({
  open,
  onClose,
  onAdd,
  pacoteEditando,
  onEdit,
}: NewPackageDialogProps) {
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')

  // Preenche os campos quando estiver editando
  useEffect(() => {
    if (pacoteEditando) {
      setCodigo(pacoteEditando.codigo)
      setDescricao(pacoteEditando.descricao)
    } else {
      setCodigo('')
      setDescricao('')
    }
  }, [pacoteEditando, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim() || !descricao.trim()) return

    if (pacoteEditando && onEdit) {
      // Modo edição
      const atualizado: Pacote = {
        ...pacoteEditando,
        codigo: codigo.trim().toUpperCase(),
        descricao: descricao.trim(),
      }
      onEdit(atualizado)
    } else {
      // Modo criação
      const agora = new Date()
      const novo: Pacote = {
        codigo: codigo.trim().toUpperCase(),
        descricao: descricao.trim(),
        status: 'Pendente',
        local: 'Aguardando postagem',
        ultimaAtualizacao: new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(agora),
        eventos: [],
      }
      onAdd(novo)
    }

    setCodigo('')
    setDescricao('')
    onClose()
  }

  const handleClose = () => {
    setCodigo('')
    setDescricao('')
    onClose()
  }

  const isEditando = !!pacoteEditando

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditando ? 'Editar Pacote' : 'Cadastrar Novo Pacote'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isEditando
              ? 'Edite o código de rastreio e a descrição do pacote.'
              : 'Insira o código de rastreio e uma descrição para acompanhar seu pacote.'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Código de Rastreio"
              placeholder="Ex: BR123456789BR"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              fullWidth
              required
              disabled={isEditando}
              helperText={isEditando ? 'O código de rastreio não pode ser alterado' : ''}
            />
            <TextField
              label="Descrição"
              placeholder="Ex: Celular Samsung Galaxy"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!codigo.trim() || !descricao.trim()}>
            {isEditando ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export function NewPackageButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Add />}
      onClick={onClick}
      sx={{ borderRadius: 2 }}
    >
      Novo Pacote
    </Button>
  )
}
