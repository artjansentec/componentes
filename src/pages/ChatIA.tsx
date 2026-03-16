import { useNavigate } from 'react-router-dom'

export function ChatIA() {
  const navigate = useNavigate()

  return (
    <main style={{ padding: 16 }}>
      <h1>ChatIA</h1>
      <p>Rota: <code>/chatIA</code></p>
      <button
        type="button"
        className="counter"
        onClick={() => navigate('/')}
        style={{ marginTop: 16, height: 44 }}
      >
        Voltar
      </button>
    </main>
  )
}

