import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/ApiService'

const getRoleName = (data) => {
  const rawRole = data?.rol || data?.role || data?.perfil || data?.rol_nombre || data?.role_name

  if (typeof rawRole === 'string') {
    return rawRole.toLowerCase()
  }

  if (rawRole?.nombre) {
    return rawRole.nombre.toLowerCase()
  }

  if (rawRole?.name) {
    return rawRole.name.toLowerCase()
  }

  if (data?.rol_id === 1 || data?.role_id === 1) {
    return 'operador'
  }

  if (data?.rol_id === 2 || data?.role_id === 2) {
    return 'admin'
  }

  return 'operador'
}

const readStoredUser = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user')) || null
    return storedUser ? normalizeUser(storedUser, storedUser.nombre || storedUser.username) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

const getTokenFromResponse = (data) => {
  return data?.access_token || data?.token || data?.accessToken || data?.jwt || null
}

const getUserFromResponse = (data) => {
  return data?.user || data?.usuario || data?.data?.user || data?.data?.usuario || null
}

const normalizeUser = (data, username) => {
  if (!data) return { username, nombre: username, rol: 'operador' }

  return {
    ...data,
    username: data.username || data.nombre || data.email || username,
    nombre: data.nombre || data.username || username,
    rol: getRoleName(data)
  }
}

const getErrorMessage = (error, fallback) => {
  return (
    error.response?.data?.msg ||
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  )
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(readStoredUser())

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => getRoleName(user.value))

  const login = async (nombre, password) => {
    try {
      const response = await apiClient.post('/auth/login', { nombre, password })

      const accessToken = getTokenFromResponse(response.data)
      if (!accessToken) {
        throw new Error('El backend no devolvio un token de acceso')
      }

      token.value = accessToken
      localStorage.setItem('token', accessToken)

      const tokenPayload = decodeJwtPayload(accessToken)
      let loggedUser = getUserFromResponse(response.data)

      if (!loggedUser) {
        try {
          const meResponse = await apiClient.get('/auth/me')
          loggedUser = meResponse.data
        } catch {
          loggedUser = tokenPayload
        }
      }

      user.value = normalizeUser({ ...tokenPayload, ...loggedUser }, nombre)
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (error) {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw new Error(getErrorMessage(error, 'Error en el login'))
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const register = async (nombre, email, password) => {
    try {
      await apiClient.post('/auth/register', { nombre, email, password })
      return true
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error en el registro'))
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    register
  }
})
