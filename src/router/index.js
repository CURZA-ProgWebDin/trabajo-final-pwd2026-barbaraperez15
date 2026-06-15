import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CategoriasView from '../views/CategoriasView.vue'
import ProveedoresView from '../views/ProveedoresView.vue'
import ProductosView from '../views/ProductosView.vue'
import MovimientosView from '../views/MovimientosView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/productos'
      },
      {
        path: 'categorias',
        name: 'Categorias',
        component: CategoriasView,
        meta: { roles: ['admin'] }
      },
      {
        path: 'proveedores',
        name: 'Proveedores',
        component: ProveedoresView,
        meta: { roles: ['admin'] }
      },
      {
        path: 'productos',
        name: 'Productos',
        component: ProductosView
      },
      {
        path: 'movimientos',
        name: 'Movimientos',
        component: MovimientosView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRoles = to.matched.flatMap(record => record.meta.roles || [])

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresAuth && requiredRoles.length && !requiredRoles.includes(authStore.userRole)) {
    alert('Acceso denegado: no tienes permisos para esta seccion')
    next('/')
  } else if (!requiresAuth && authStore.isAuthenticated && to.path === '/login') {
    next('/')
  } else {
    next()
  }
})

export default router
