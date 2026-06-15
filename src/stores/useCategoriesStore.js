import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/ApiService'
import { getApiErrorMessage } from '../services/getApiErrorMessage'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/categorias/')
      categories.value = response.data
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al cargar categorias')
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const getCategory = async (id) => {
    try {
      const response = await apiClient.get(`/categorias/${id}`)
      return response.data
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Error al obtener la categoria'))
    }
  }

  const createCategory = async (data) => {
    try {
      const response = await apiClient.post('/categorias/', data)
      categories.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al crear la categoria')
      throw new Error(error.value)
    }
  }

  const updateCategory = async (id, data) => {
    try {
      const response = await apiClient.put(`/categorias/${id}`, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al actualizar la categoria')
      throw new Error(error.value)
    }
  }

  const deleteCategory = async (id) => {
    try {
      await apiClient.delete(`/categorias/${id}`)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = getApiErrorMessage(err, 'Error al eliminar la categoria')
      throw new Error(error.value)
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
