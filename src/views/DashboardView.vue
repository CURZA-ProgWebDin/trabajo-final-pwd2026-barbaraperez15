<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">Gestion de Stock</h1>
        <ul class="nav-links">
          <li v-if="authStore.userRole === 'admin'">
            <router-link to="/categorias">Categorias</router-link>
          </li>
          <li v-if="authStore.userRole === 'admin'">
            <router-link to="/proveedores">Proveedores</router-link>
          </li>
          <li><router-link to="/productos">Productos</router-link></li>
          <li><router-link to="/movimientos">Movimientos</router-link></li>
          <li class="user-chip">{{ authStore.user?.nombre || authStore.user?.username }} | {{ authStore.userRole }}</li>
          <li><button @click="handleLogout" class="logout-btn">Salir</button></li>
        </ul>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.logo {
  margin: 0;
  font-size: 1.35rem;
  color: #2457d6;
  white-space: nowrap;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.nav-links a.router-link-active,
.nav-links a:hover {
  color: #2457d6;
}

.user-chip {
  color: #555;
  font-size: 0.9rem;
}

.logout-btn {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover {
  background: #b71c1c;
}

@media (max-width: 760px) {
  .nav-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .nav-links {
    justify-content: flex-start;
    gap: 0.85rem;
  }
}
</style>
