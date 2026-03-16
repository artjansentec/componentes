import axios from 'axios'

// URL base da API:
// - Se existir VITE_API_URL no .env, usa `${VITE_API_URL}/api`
// - Caso contrário, usa um fallback local
const baseUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://localhost:7276/api'

export const api = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
})

// Exemplo de como adicionar automaticamente um token (quando você tiver autenticação):
//
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers = {
//       ...config.headers,
//       Authorization: `Bearer ${token}`,
//     }
//   }
//   return config
// })

