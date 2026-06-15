import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/ApiService'
import { getApiErrorMessage } from '../services/getApiErrorMessage'

export const useProveedoresStore = defineStore('proveedores', () => {
  const proveedores = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProveedores = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/proveedores/')
      proveedores.value = response.data
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al cargar proveedores')
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const getProveedor = async (id) => {
    try {
      const response = await apiClient.get(`/proveedores/${id}`)
      return response.data
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Error al obtener el proveedor'))
    }
  }

  const createProveedor = async (data) => {
    try {
      const response = await apiClient.post('/proveedores/', data)
      proveedores.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al crear el proveedor')
      throw new Error(error.value)
    }
  }

  const updateProveedor = async (id, data) => {
    try {
      const response = await apiClient.put(`/proveedores/${id}`, data)
      const index = proveedores.value.findIndex(p => p.id === id)
      if (index !== -1) {
        proveedores.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al actualizar el proveedor')
      throw new Error(error.value)
    }
  }

  const deleteProveedor = async (id) => {
    try {
      await apiClient.delete(`/proveedores/${id}`)
      proveedores.value = proveedores.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al eliminar el proveedor')
      throw new Error(error.value)
    }
  }

  return {
    proveedores,
    loading,
    error,
    fetchProveedores,
    getProveedor,
    createProveedor,
    updateProveedor,
    deleteProveedor
  }
})
