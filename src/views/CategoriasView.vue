<template>
  <div class="view-container">
    <h2>Categorías</h2>
    <button @click="showForm = !showForm" class="btn-primary">
      {{ showForm ? 'Cancelar' : 'Nueva Categoría' }}
    </button>

    <form v-if="showForm" @submit.prevent="handleSave" class="form">
      <div class="form-group">
        <label for="nombre">Nombre:</label>
        <input v-model="formData.nombre" id="nombre" required />
      </div>
      <div class="form-group">
        <label for="descripcion">Descripción:</label>
        <textarea v-model="formData.descripcion" id="descripcion"></textarea>
      </div>
      <button type="submit" class="btn-success">Guardar</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </form>

    <table class="table" v-if="!loading">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categoriesStore.categories" :key="cat.id">
          <td>{{ cat.nombre }}</td>
          <td>{{ cat.descripcion || '-' }}</td>
          <td>
            <button @click="editCategory(cat)" class="btn-edit">Editar</button>
            <button @click="deleteCategory(cat.id)" class="btn-delete">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="loading">Cargando...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '../stores/useCategoriesStore'

const categoriesStore = useCategoriesStore()
const showForm = ref(false)
const loading = ref(false)
const error = ref(null)
const success = ref(null)
const formData = ref({ nombre: '', descripcion: '', id: null })

onMounted(() => {
  fetchCategories()
})

const fetchCategories = async () => {
  try {
    loading.value = true
    await categoriesStore.fetchCategories()
  } catch (err) {
    error.value = 'Error al cargar categorías'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  error.value = null
  success.value = null
  try {
    if (formData.value.id) {
      await categoriesStore.updateCategory(formData.value.id, {
        nombre: formData.value.nombre,
        descripcion: formData.value.descripcion
      })
      success.value = 'Categoría actualizada'
    } else {
      await categoriesStore.createCategory({
        nombre: formData.value.nombre,
        descripcion: formData.value.descripcion
      })
      success.value = 'Categoría creada'
    }
    formData.value = { nombre: '', descripcion: '', id: null }
    showForm.value = false
  } catch (err) {
    error.value = err.message
  }
}

const editCategory = (cat) => {
  formData.value = { ...cat }
  showForm.value = true
}

const deleteCategory = async (id) => {
  if (!confirm('¿Estás seguro?')) return
  try {
    await categoriesStore.deleteCategory(id)
    success.value = 'Categoría eliminada'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.btn-primary:hover {
  background: #5568d3;
}

.form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.btn-success {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-success:hover {
  background: #45a049;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

thead {
  background: #667eea;
  color: white;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tbody tr:hover {
  background: #f9f9f9;
}

.btn-edit, .btn-delete {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-delete {
  background: #d32f2f;
  color: white;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.success {
  color: #2e7d32;
  background: #e8f5e9;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>
