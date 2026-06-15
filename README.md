# Trabajo Práctico FINAL — Frontend de Gestión de Stock con Vue.js

**Materia:** Programación Web Dinámica
**Modalidad:** Individual
**Entorno:** Vue 3 (Composition API) + Vite + Pinia + Vue Router + Axios
**Modalidad de entrega:** GitHub Classroom — aceptar la tarea desde el link provisto y hacer push a la rama `main` del repositorio generado
**Carácter:** Práctico, sin puntaje. El objetivo es ejercitar la integración frontend-backend.
**Pre-requisito:** Backend del TP N°1 funcionando (`docker-compose up --build`)

## Contexto

Este TP es la continuación directa del sistema de gestión de stock del TP N°1. Van a construir el frontend que consume esa API, respetando el mismo dominio (Categorías, Proveedores, Productos, Movimientos de Stock) y el mismo esquema de roles (`admin` / `operador`).

## Primeros pasos / Configuración inicial

1. Aceptar la tarea de GitHub Classroom desde el link compartido en el aula virtual. Esto va a generar un repositorio individual a partir de la plantilla.
2. Clonar el repositorio generado.
3. Verificar que el backend del TP N°1 esté levantado (`docker-compose up --build`) y accesible (por defecto en `http://localhost:5000` o el puerto configurado).
4. Instalar dependencias del frontend:
   ```bash
   npm install
   ```
5. Crear el archivo `.env` en base a `.env.example`, con la URL del backend:
   ```
   VITE_API_URL=http://localhost:5000
   ```
6. Verificar que ya estén instaladas y configuradas las dependencias base: `pinia`, `vue-router`, `axios`.
7. Levantar el proyecto:
   ```bash
   npm run dev
   ```
8. Confirmar que pueden hacer login contra el backend con los usuarios de prueba del seed (`admin` / `admin123`).

## Punto de partida

Ya cuentan con:
- `ApiService`: instancia de Axios configurada con interceptores.
- Estructura base del proyecto Vue con Pinia y Vue Router instalados.

## Consigna

### Parte 1 — Organización de servicios

Decidan y justifiquen en la entrega escrita:
- **Opción A:** usar el `ApiService` genérico directamente desde los stores.
- **Opción B:** crear un service por dominio (`categoriasService.js`, `proveedoresService.js`, `productosService.js`, `movimientosService.js`) que encapsule el `ApiService`.

No hay opción "correcta": se evalúa la coherencia y la justificación.

### Parte 2 — Autenticación y store de sesión

- Vista de **Login** que consuma `POST /auth/login`.
- `useAuthStore` (Pinia, Composition API) que guarde:
  - `token`
  - datos del usuario (`GET /auth/me`)
  - `rol` (extraído del claim del JWT o de `/auth/me`)
- Interceptor de Axios que agregue el header `Authorization: Bearer <token>` en cada request.
- Persistencia del token (ej. `localStorage`) para mantener la sesión al recargar.
- Logout que limpie el store y redirija al login.

### Parte 3 — Vue Router con guards por rol

- Rutas protegidas: solo accesibles si hay token válido (`beforeEach`).
- Rutas exclusivas de **admin**: gestión de Categorías, Proveedores y alta/edición/baja de Productos.
- Rutas accesibles para **operador**: listado de Productos, Mis Movimientos, registrar Movimiento.
- Si un `operador` intenta acceder a una ruta de `admin` (por URL directa), redirigir con mensaje de "acceso denegado".

### Parte 4 — Categorías y Proveedores (solo admin)

- CRUD completo (listar, crear, editar, eliminar) para ambas entidades, vía store de Pinia.
- Al eliminar una categoría o proveedor con productos asociados, mostrar el mensaje de error que devuelve el backend (`409 Conflict`).

### Parte 5 — Productos

- Listado visible para **ambos roles**, mostrando categoría y proveedor (datos expandidos del `to_dict()`).
- **Alerta visual** (ej. fila resaltada o badge) cuando `stock_actual <= stock_minimo`.
- Alta/edición/baja **solo para admin**, con `<select>` de Categorías y Proveedores cargados desde sus stores.
- Operador solo visualiza, sin botones de edición/eliminación (ocultos, no solo deshabilitados).

### Parte 6 — Movimientos de Stock

- Formulario de registro de movimiento (`tipo`: entrada/salida, `cantidad`, `motivo`, `producto_id`), accesible para ambos roles.
- **Validación en frontend**: si `tipo === 'salida'` y `cantidad > stock_actual` del producto seleccionado, mostrar advertencia antes de enviar (la validación final la hace el backend, pero la UI debe anticiparla).
- Vista "Mis Movimientos" (`GET /movimientos/mis/`) para cualquier usuario autenticado.
- Vista "Todos los Movimientos" (`GET /movimientos/`) solo para admin.
- Tras registrar un movimiento exitoso, reflejar el `stock_actual` actualizado en el store de Productos sin recargar la página.

### Parte 7 — Manejo de errores y feedback

- Mensajes de error legibles para: credenciales inválidas, token vencido (401 → redirigir a login), acceso denegado (403), conflictos (409) y errores de stock insuficiente.
- Mensajes de éxito tras operaciones de alta/edición/baja/movimiento.

## Cómo se evalúa

No hay nota numérica — este TP es una ejercitación. Se va a revisar que 👍
- El login funciona y el `rol` se refleja correctamente en la UI
- Los guards de Vue Router restringen rutas según rol
- Las vistas de Categorías, Proveedores, Productos y Movimientos consumen la API correctamente
- La alerta de stock bajo se muestra cuando corresponde
- La validación de stock insuficiente en movimientos se anticipa en el frontend
- Los mensajes de error y éxito son claros y legibles
- El proyecto levanta con `npm run dev` sin errores

## Preguntas de reflexión (entrega escrita)

1. Justifiquen la decisión de la Parte 1 (`ApiService` genérico vs. services por dominio).
2. ¿Cómo decidieron almacenar y verificar el `rol` del usuario en el frontend? ¿Qué pasa si alguien edita manualmente el `localStorage` para cambiar su rol?
3. La validación de stock insuficiente existe tanto en el frontend como en el backend. ¿Por qué es necesaria esa duplicación? ¿Cuál es la fuente de verdad?
4. ¿Qué problemas de CORS pueden surgir al consumir esta API desde Vite, y cómo se resuelven en este proyecto (`vite.config.js`)?

## Entrega
- Push a la rama `main` del repositorio generado por GitHub Classroom.
