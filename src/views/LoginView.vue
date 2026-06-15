<template>
  <div class="login-container">
    <div class="login-form">
      <h1>Gestion de Stock</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="nombre">Usuario</label>
          <input
            id="nombre"
            v-model.trim="nombre"
            type="text"
            placeholder="admin"
            autocomplete="username"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Contrasena</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="admin123"
            autocomplete="current-password"
            required
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Iniciando...' : 'Iniciar sesion' }}
        </button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

const nombre = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    await authStore.login(nombre.value, password.value)
    router.push('/productos')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #eef2f7;
  padding: 1rem;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.5rem;
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

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4f7cff;
  box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.12);
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #2457d6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
}

button:hover:not(:disabled) {
  background: #1d46ad;
}

.error-message {
  color: #b71c1c;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ffebee;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
