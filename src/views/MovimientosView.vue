<template>
  <div class="view-container">
    <h2>Movimientos de Stock</h2>

    <div class="form-section">
      <h3>Registrar Movimiento</h3>
      <form @submit.prevent="handleRegistrarMovimiento" class="form">
        <div class="form-group">
          <label for="producto_id">Producto:</label>
          <select v-model.number="movForm.producto_id" id="producto_id" required>
            <option value="">Seleccionar...</option>
            <option v-for="prod in productosStore.productos" :key="prod.id" :value="prod.id">
              {{ prod.nombre }} (Stock: {{ prod.stock_actual }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="tipo">Tipo:</label>
          <select v-model="movForm.tipo" id="tipo" required>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div class="form-group">
          <label for="cantidad">Cantidad:</label>
          <input v-model.number="movForm.cantidad" id="cantidad" type="number" min="1" required />
        </div>
        <div class="form-group">
          <label for="motivo">Motivo:</label>
          <input v-model="movForm.motivo" id="motivo" type="text" />
        </div>
        <div v-if="stockWarning" class="warning">
          ⚠️ {{ stockWarning }}
        </div>
        <button type="submit" class="btn-success">Registrar Movimiento</button>
        <div v-if="movError" class="error">{{ movError }}</div>
        <div v-if="movSuccess" class="success">{{ movSuccess }}</div>
      </form>
    </div>

    <div class="movimientos-section">
      <h3>{{ authStore.userRole === 'admin' ? 'Todos los Movimientos' : 'Mis Movimientos' }}</h3>
      <button @click="fetchMovimientos" class="btn-refresh">Actualizar</button>

      <table class="table" v-if="!loading">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th v-if="authStore.userRole === 'admin'">Usuario</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mov in movimientos" :key="mov.id" :class="mov.tipo === 'salida' ? 'salida' : 'entrada'">
            <td>{{ formatDate(mov.created_at) }}</td>
            <td>{{ mov.producto?.nombre || '-' }}</td>
            <td>
              <span class="badge" :class="mov.tipo">{{ mov.tipo }}</span>
            </td>
            <td>{{ mov.cantidad }}</td>
            <td>{{ mov.motivo || '-' }}</td>
            <td v-if="authStore.userRole === 'admin'">{{ mov.usuario?.username || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="loading">Cargando...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useMovimientosStore } from '../stores/useMovimientosStore'
import { useProductosStore } from '../stores/useProductosStore'

const authStore = useAuthStore()
const movimientosStore = useMovimientosStore()
const productosStore = useProductosStore()

const loading = ref(false)
const movError = ref(null)
const movSuccess = ref(null)

const movForm = ref({
  producto_id: null,
  tipo: 'entrada',
  cantidad: 0,
  motivo: ''
})

const stockWarning = computed(() => {
  if (movForm.value.tipo === 'salida' && movForm.value.producto_id && movForm.value.cantidad) {
    const producto = productosStore.productos.find(p => p.id === movForm.value.producto_id)
    if (producto && movForm.value.cantidad > producto.stock_actual) {
      return `No hay suficiente stock. Stock actual: ${producto.stock_actual}`
    }
  }
  return null
})

const movimientos = computed(() => {
  return authStore.userRole === 'admin'
    ? movimientosStore.movimientos
    : movimientosStore.miMovimientos
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  try {
    loading.value = true
    await Promise.all([
      productosStore.fetchProductos(),
      fetchMovimientos()
    ])
  } catch (err) {
    movError.value = 'Error al cargar datos'
  } finally {
    loading.value = false
  }
}

const fetchMovimientos = async () => {
  try {
    if (authStore.userRole === 'admin') {
      await movimientosStore.fetchMovimientos()
    } else {
      await movimientosStore.fetchMisMovimientos()
    }
  } catch (err) {
    movError.value = 'Error al cargar movimientos'
  }
}

const handleRegistrarMovimiento = async () => {
  movError.value = null
  movSuccess.value = null

  // Validación de stock
  if (movForm.value.tipo === 'salida' && stockWarning.value) {
    movError.value = stockWarning.value
    return
  }

  try {
    const response = await movimientosStore.registrarMovimiento({
      producto_id: movForm.value.producto_id,
      tipo: movForm.value.tipo,
      cantidad: movForm.value.cantidad,
      motivo: movForm.value.motivo || null
    })

    // Actualizar stock en el store de productos
    const producto = productosStore.productos.find(p => p.id === movForm.value.producto_id)
    if (producto) {
      if (movForm.value.tipo === 'entrada') {
        producto.stock_actual += movForm.value.cantidad
      } else {
        producto.stock_actual -= movForm.value.cantidad
      }
    }

    movSuccess.value = 'Movimiento registrado exitosamente'
    movForm.value = { producto_id: null, tipo: 'entrada', cantidad: 0, motivo: '' }
    
    // Actualizar lista de movimientos
    await fetchMovimientos()
  } catch (err) {
    movError.value = err.message
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

h3 {
  color: #555;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.form-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group:nth-child(3) {
  grid-column: 1 / 3;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.warning {
  background: #fff3e0;
  color: #e65100;
  padding: 0.75rem;
  border-radius: 4px;
  grid-column: 1 / 3;
  border-left: 4px solid #ff9800;
}

.btn-success {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  grid-column: 1 / 3;
}

.btn-success:hover {
  background: #45a049;
}

.btn-refresh {
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.movimientos-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
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

tbody tr.entrada {
  border-left: 4px solid #4caf50;
}

tbody tr.salida {
  border-left: 4px solid #d32f2f;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.badge.entrada {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.salida {
  background: #ffebee;
  color: #c62828;
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

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>
