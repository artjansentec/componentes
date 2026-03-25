import '../App.css'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const navigate = useNavigate()

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: 'min(720px, 100%)', textAlign: 'center' }}>
        <p style={{ marginTop: 10, opacity: 0.85 }}>
          Escolha para onde você quer ir:
        </p>

        <div
          style={{
            marginTop: 22,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/chatIA')}
            className="counter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'min(360px, 100%)',
              height: 52,
              fontWeight: 700,
            }}
          >
            ChatIA
          </button>

          <button
            type="button"
            onClick={() => navigate('/correios')}
            className="counter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'min(360px, 100%)',
              height: 52,
              fontWeight: 700,
            }}
          >
            Correios
          </button>

          <button
            type="button"
            onClick={() => navigate('/tabs')}
            className="counter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'min(360px, 100%)',
              height: 52,
              fontWeight: 700,
            }}
          >
            Tabs (MUI)
          </button>

          <button
            type="button"
            onClick={() => navigate('/mapa')}
            className="counter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'min(360px, 100%)',
              height: 52,
              fontWeight: 700,
            }}
          >
            Mapa interativo (SVG)
          </button>
        </div>
      </div>
    </section>
  )
}

