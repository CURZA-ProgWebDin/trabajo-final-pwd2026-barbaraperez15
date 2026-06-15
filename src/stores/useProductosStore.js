import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/ApiService'
import { getApiErrorMessage } from '../services/getApiErrorMessage'

export const useProductosStore = defineStore('productos', () => {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProductos = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/productos/')
      productos.value = response.data
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al cargar productos')
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const getProducto = async (id) => {
    try {
      const response = await apiClient.get(`/productos/${id}`)
      return response.data
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Error al obtener el producto'))
    }
  }

  const createProducto = async (data) => {
    try {
      const response = await apiClient.post('/productos/', data)
      productos.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al crear el producto')
      throw new Error(error.value)
    }
  }

  const updateProducto = async (id, data) => {
    try {
      const response = await apiClient.put(`/productos/${id}`, data)
      const index = productos.value.findIndex(p => p.id === id)
      if (index !== -1) {
        productos.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al actualizar el producto')
      throw new Error(error.value)
    }
  }

  const deleteProducto = async (id) => {
    try {
      await apiClient.delete(`/productos/${id}`)
      productos.value = productos.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al eliminar el producto')
      throw new Error(error.value)
    }
  }

  const updateStock = (productoId, newStock) => {
    const producto = productos.value.find(p => p.id === productoId)
    if (producto) {
      producto.stock_actual = newStock
    }
  }

  return {
    productos,
    loading,
    error,
    fetchProductos,
    getProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    updateStock
  }
})
