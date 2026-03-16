import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Correios } from './pages/Correios'
import { ChatIA } from './pages/ChatIA'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/correios" element={<Correios />} />
        <Route path="/chatIA" element={<ChatIA />} />
      </Routes>
    </>
  )
}

export default App
