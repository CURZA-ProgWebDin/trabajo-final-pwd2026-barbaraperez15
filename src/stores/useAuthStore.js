import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import apiClient from '../services/ApiService'
import { getApiErrorMessage } from '../services/getApiErrorMessage'

const getRoleName = (user) => {
  if (typeof user?.rol === 'string') return user.rol.toLowerCase()
  if (user?.rol?.nombre) return user.rol.nombre.toLowerCase()
  if (user?.rol_id === 2) return 'admin'
  if (user?.rol_id === 1) return 'operador'
  return 'operador'
}

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(readStoredUser())

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => getRoleName(user.value))

  const login = async (nombre, password) => {
    try {
      const loginResponse = await apiClient.post('/auth/login', { nombre, password })
      const accessToken = loginResponse.data.access_token

      if (!accessToken) {
        throw new Error('El backend no devolvio un token')
      }

      token.value = accessToken
      localStorage.setItem('token', accessToken)

      const meResponse = await apiClient.get('/auth/me')
      user.value = meResponse.data
      localStorage.setItem('user', JSON.stringify(meResponse.data))

      return true
    } catch (error) {
      logout()
      throw new Error(getApiErrorMessage(error, 'Error en el login'))
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    logout
  }
})
