# Preguntas de reflexión

## 1. Justifiquen la decisión de la Parte 1 (ApiService genérico vs. services por dominio).

Decidí usar un `ApiService` genérico directamente desde los stores de Pinia porque la lógica de cada entidad es la misma: listar, crear, editar y eliminar. Por eso no me pareció necesario crear un archivo service separado para categorías, proveedores, productos y movimientos.

## 2. ¿Cómo decidieron almacenar y verificar el rol del usuario en el frontend? ¿Qué pasa si alguien edita manualmente el localStorage para cambiar su rol?

El token se guarda en `localStorage` para mantener la sesión aunque se recargue la página. Después del login, el frontend llama a `/auth/me` para obtener los datos reales del usuario y su rol. Ese usuario también se guarda en `localStorage` para poder restaurar la sesión.

El rol se usa en el frontend para mostrar u ocultar opciones de la interfaz y para aplicar guards en Vue Router. Si el usuario no es admin, no se muestran los botones de edición y eliminación ni las rutas de categorías y proveedores.

Si alguien edita manualmente el `localStorage`, podría modificar lo que ve en el frontend, pero eso no le daría permisos reales. La seguridad depende del backend porque cada request protegida se envía con el token JWT y el backend valida el rol del token antes de permitir la operación.

## 3. La validación de stock insuficiente existe tanto en el frontend como en el backend. ¿Por qué es necesaria esa duplicación? ¿Cuál es la fuente de verdad?

La validación se repite en frontend y backend porque cumplen objetivos distintos.

En el frontend se valida antes de enviar el movimiento para darle una respuesta rápida al usuario. Por ejemplo, si intenta registrar una salida mayor al stock disponible, la interfaz le muestra una advertencia sin esperar la respuesta del servidor.

Por otro lado, en el backend el stock real está en la base de datos y puede cambiar por otras operaciones o usuarios. Por eso, aunque el frontend valide, el backend tiene que volver a controlar el stock antes de registrar el movimiento. 

En general, la validación del frontend mejora la experiencia, pero la validación del backend garantiza la integridad de los datos.

## 4. ¿Qué problemas de CORS pueden surgir al consumir esta API desde Vite, y cómo se resuelven en este proyecto (vite.config.js)?

Un problema de CORS puede aparecer porque el frontend de Vite corre en un origen distinto al backend. Por ejemplo: si el frontend está en `http://localhost:5173` y el backend en `http://localhost:5001`, aunque ambos estén en localhost, al tener distinto puerto el navegador los va a considerar de orígenes diferentes.

Para evitar problemas de CORS, el proyecto usa un proxy en `vite.config.js`. Las llamadas del frontend se hacen a `/api`, y Vite las redirige al backend configurado en el proxy. En este caso, el proxy apunta a `http://localhost:5001` y elimina el `/api` antes de enviar la request.

De esta forma, desde el navegador parece que las requests salen al mismo origen del frontend y Vite se encarga de comunicarse con el backend.