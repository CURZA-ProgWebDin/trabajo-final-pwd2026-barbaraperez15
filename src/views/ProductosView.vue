<template>
  <div class="view-container">
    <h2>Productos</h2>
    <button
      v-if="authStore.userRole === 'admin'"
      @click="showForm = !showForm"
      class="btn-primary"
    >
      {{ showForm ? 'Cancelar' : 'Nuevo Producto' }}
    </button>

    <div v-if="error" class="error feedback-message">{{ error }}</div>
    <div v-if="success" class="success feedback-message">{{ success }}</div>

    <form v-if="showForm" @submit.prevent="handleSave" class="form">
      <div class="form-group">
        <label for="nombre">Nombre:</label>
        <input v-model="formData.nombre" id="nombre" required />
      </div>
      <div class="form-group">
        <label for="descripcion">Descripción:</label>
        <textarea v-model="formData.descripcion" id="descripcion"></textarea>
      </div>
      <div class="form-group">
        <label for="precio_costo">Precio Costo:</label>
        <input v-model.number="formData.precio_costo" id="precio_costo" type="number" step="0.01" required />
      </div>
      <div class="form-group">
        <label for="precio_venta">Precio Venta:</label>
        <input v-model.number="formData.precio_venta" id="precio_venta" type="number" step="0.01" required />
      </div>
      <div class="form-group">
        <label for="stock_actual">Stock Actual:</label>
        <input v-model.number="formData.stock_actual" id="stock_actual" type="number" required />
      </div>
      <div class="form-group">
        <label for="stock_minimo">Stock Mínimo:</label>
        <input v-model.number="formData.stock_minimo" id="stock_minimo" type="number" required />
      </div>
      <div class="form-group">
        <label for="categoria_id">Categoría:</label>
        <select v-model.number="formData.categoria_id" id="categoria_id" required>
          <option value="">Seleccionar...</option>
          <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.nombre }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="proveedor_id">Proveedor:</label>
        <select v-model.number="formData.proveedor_id" id="proveedor_id">
          <option value="">Seleccionar...</option>
          <option v-for="prov in proveedoresStore.proveedores" :key="prov.id" :value="prov.id">
            {{ prov.nombre }}
          </option>
        </select>
      </div>
      <button type="submit" class="btn-success">Guardar</button>
    </form>

    <table class="table" v-if="!loading">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Proveedor</th>
          <th>Stock</th>
          <th>Precio Venta</th>
          <th v-if="authStore.userRole === 'admin'">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="prod in productosStore.productos"
          :key="prod.id"
          :class="{ 'stock-low': prod.stock_actual <= prod.stock_minimo }"
        >
          <td>{{ prod.nombre }}</td>
          <td>{{ prod.categoria?.nombre || '-' }}</td>
          <td>{{ prod.proveedor?.nombre || '-' }}</td>
          <td>
            {{ prod.stock_actual }}
            <span v-if="prod.stock_actual <= prod.stock_minimo" class="badge-warning">Stock bajo</span>
          </td>
          <td>${{ prod.precio_venta }}</td>
          <td v-if="authStore.userRole === 'admin'">
            <button @click="editProducto(prod)" class="btn-edit">Editar</button>
            <button @click="deleteProducto(prod.id)" class="btn-delete">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="loading">Cargando...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useProductosStore } from '../stores/useProductosStore'
import { useCategoriesStore } from '../stores/useCategoriesStore'
import { useProveedoresStore } from '../stores/useProveedoresStore'

const authStore = useAuthStore()
const productosStore = useProductosStore()
const categoriesStore = useCategoriesStore()
const proveedoresStore = useProveedoresStore()

const showForm = ref(false)
const loading = ref(false)
const error = ref(null)
const success = ref(null)
const formData = ref({
  nombre: '',
  descripcion: '',
  precio_costo: 0,
  precio_venta: 0,
  stock_actual: 0,
  stock_minimo: 0,
  categoria_id: null,
  proveedor_id: null,
  id: null
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  try {
    loading.value = true
    if (authStore.userRole === 'admin') {
      await Promise.all([
        productosStore.fetchProductos(),
        categoriesStore.fetchCategories(),
        proveedoresStore.fetchProveedores()
      ])
    } else {
      await productosStore.fetchProductos()
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar datos'
  } finally {
    loading.value = false
  }
}

const getProductPayload = () => ({
  nombre: formData.value.nombre,
  descripcion: formData.value.descripcion,
  precio_costo: formData.value.precio_costo,
  precio_venta: formData.value.precio_venta,
  stock_actual: formData.value.stock_actual,
  stock_minimo: formData.value.stock_minimo,
  categoria_id: formData.value.categoria_id,
  proveedor_id: formData.value.proveedor_id || null
})

const handleSave = async () => {
  error.value = null
  success.value = null
  try {
    if (formData.value.id) {
      await productosStore.updateProducto(formData.value.id, getProductPayload())
      success.value = 'Producto actualizado'
    } else {
      await productosStore.createProducto(getProductPayload())
      success.value = 'Producto creado'
    }
    resetForm()
  } catch (err) {
    error.value = err.message
  }
}

const editProducto = (prod) => {
  error.value = null
  success.value = null
  formData.value = {
    nombre: prod.nombre,
    descripcion: prod.descripcion || '',
    precio_costo: prod.precio_costo,
    precio_venta: prod.precio_venta,
    stock_actual: prod.stock_actual,
    stock_minimo: prod.stock_minimo,
    categoria_id: prod.categoria_id || prod.categoria?.id || null,
    proveedor_id: prod.proveedor_id || prod.proveedor?.id || null,
    id: prod.id
  }
  showForm.value = true
}

const deleteProducto = async (id) => {
  if (!confirm('¿Estás seguro?')) return
  error.value = null
  success.value = null
  try {
    await productosStore.deleteProducto(id)
    success.value = 'Producto eliminado'
  } catch (err) {
    error.value = err.message
  }
}

const resetForm = () => {
  formData.value = {
    nombre: '',
    descripcion: '',
    precio_costo: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
    categoria_id: null,
    proveedor_id: null,
    id: null
  }
  showForm.value = false
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  margin-bottom: 0;
}

.form-group:nth-child(3) {
  grid-column: 1 / 3;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input, textarea, select {
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
  grid-column: 1 / 3;
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

tbody tr.stock-low {
  background: #fff3e0;
}

.badge-warning {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
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
  grid-column: 1 / 3;
}

.success {
  color: #2e7d32;
  background: #e8f5e9;
  padding: 0.75rem;
  border-radius: 4px;
  grid-column: 1 / 3;
}

.feedback-message {
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>
