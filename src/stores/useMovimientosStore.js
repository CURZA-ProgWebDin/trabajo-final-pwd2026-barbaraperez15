import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/ApiService'
import { getApiErrorMessage } from '../services/getApiErrorMessage'

export const useMovimientosStore = defineStore('movimientos', () => {
  const movimientos = ref([])
  const miMovimientos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchMovimientos = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/movimientos/')
      movimientos.value = response.data
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al cargar movimientos')
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const fetchMisMovimientos = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/movimientos/mis/')
      miMovimientos.value = response.data
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al cargar mis movimientos')
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const registrarMovimiento = async (data) => {
    try {
      const response = await apiClient.post('/movimientos/', data)
      movimientos.value.push(response.data)
      miMovimientos.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al registrar el movimiento')
      throw new Error(error.value)
    }
  }

  return {
    movimientos,
    miMovimientos,
    loading,
    error,
    fetchMovimientos,
    fetchMisMovimientos,
    registrarMovimiento
  }
})
