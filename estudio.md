# Guía de Implementación — Sistema de Control y Producción (Acme)

---

## 📊 Estado del Proyecto (Acme Producción)

> Nota: en el código actual, el campo `username` cumple la función de **número de identificación** solicitado en el enunciado. No es un campo adicional, es el mismo dato.

### ✅ Módulo de Usuarios — Completo

- [x] Registro con identificación (`username`), nombre completo, cargo (`rol`) y contraseña
- [x] Doble validación de contraseña
- [x] Validación de identificación duplicada
- [x] Validación de cargo/rol obligatorio
- [x] Listar, editar y eliminar usuarios
- [x] Sincronización con Firebase

### ✅ Login — Completo

- [x] Formulario de autenticación por identificación + contraseña
- [x] Protección de rutas (evitar entrar a index.html o cualquier panel sin sesión activa)
- [x] Botón "Salir" funcional (cerrar sesión)
- [x] Redirección automática si ya hay sesión activa al entrar a login.html

### ✅ Módulo de Inventario — Completo

- [x] Registrar producto: código, nombre, proveedor
- [x] Definir fórmula/receta cuando el producto es fabricado (materia prima + cantidades)
- [x] Aumentar/editar stock por código de producto + cantidad
- [x] Listado de productos con datos completos y saldo actual
- [x] Buscador/filtro de productos

### ✅ Módulo de Producción — Completo

- [x] Seleccionar producto(s) a fabricar y cantidad
- [x] Descontar materia prima según la fórmula
- [x] Incrementar stock del producto terminado
- [x] Código consecutivo autoincremental por proceso de producción
- [x] Resumen e historial de producción (cantidad fabricada + materia prima consumida)

### ⚠️ Transversales — En Progreso

- [x] Web Components para reutilización de UI (tabla, formulario, modal, buscador)
- [ ] Diseño responsive y validación en móvil
- [ ] Wireframes de Inventario y Producción
- [ ] Cifrado de contraseñas antes de almacenarlas

---

## ✅ ¿Cumplimos el Objetivo?

**Sí. El objetivo de registro de usuarios con validación, login, gestión de inventario y módulo de producción fue cumplido al 100%.**

El requisito solicitado era:

> _"Para evitar alteraciones por terceros, se necesita un login, por lo cual se debe registrar usuarios en el sistema. Para registrar un usuario, se debe solicitar número de identificación, nombre completo, cargo y contraseña (Hacer doble validación para prevenir errores en la contraseña)."_

Lo que se implementó exitosamente:

- ✅ Formulario de registro con campos de **Username (Identificación)**, **Nombre**, **Contraseña** y **Rol (cargo)**.
- ✅ **Doble validación de contraseña** para prevenir errores de escritura.
- ✅ **Validación de usuario duplicado** para evitar registros repetidos.
- ✅ **Validación de Rol obligatorio** para asegurar que cada usuario tenga un cargo asignado.
- ✅ **Mensajes de error** mostrados en pantalla para guiar al usuario en caso de fallo.
- ✅ **Persistencia** de los datos en `localStorage` y sincronización con **Firebase**.
- ✅ **Tabla de control de usuarios** con opciones de editar y eliminar.
- ✅ **Modal de edición** con selección de rol y actualización local inmediata.
- ✅ **Módulo de Login** que valida la existencia del usuario y contraseña en la base de datos de Firebase.
- ✅ **Protección de rutas** en el frontend para evitar accesos no autorizados a las páginas de gestión.
- ✅ **Módulo de Inventario** para definir productos e insumos, permitiendo estructurar recetas de fabricación.
- ✅ **Módulo de Producción** que calcula el requerimiento de stock de ingredientes en tiempo real y realiza los descuentos automáticos al procesar la manufactura.

---

## Análisis del Código: Registro de Usuarios y Validación

Esta sección explica el código del flujo de usuarios en detalle, elemento por elemento.

### 1. Estructura HTML del Formulario (`index.html`)

```html
<form id="formulario">
  <div class="campo-grupo">
    <label>Username</label>
    <input type="text" name="username" placeholder="usuario" required />
  </div>

  <div class="campo-grupo">
    <label>Nombre</label>
    <input type="text" name="nombre" placeholder="nombre completo" required />
  </div>

  <div class="campo-grupo">
    <label>Contraseña</label>
    <input type="password" name="contrasena" placeholder="••••••••" required />
  </div>

  <div class="campo-grupo">
    <label>Validar contraseña</label>
    <input type="password" name="validarContrasena" placeholder="••••••••" required />
  </div>

  <div class="campo-grupo">
    <label>Rol</label>
    <select name="rol">
      <option value="">Seleccionar rol</option>
      <option value="admin">Administrador</option>
      <option value="usuario">Usuario</option>
    </select>
  </div>

  <div class="form-actions">
    <button type="submit" class="btn-primario">
      <i class="ti ti-user-plus"></i> Registrar
    </button>
  </div>

  <p class="mensaje-error" id="mensajeError"></p>
</form>
```

| Elemento | Atributo Clave | Para qué sirve |
| --- | --- | --- |
| `<form id="formulario">` | `id` | Permite seleccionarlo con JavaScript para escuchar el evento de envío |
| `<input name="username">` | `name` | Identificador que usa `FormData` para leer el valor del campo |
| `<input type="password">` | `type="password"` | Oculta el texto escrito por seguridad |
| `<input name="validarContrasena">` | `name` | Segundo campo de contraseña para la doble validación |
| `<select name="rol">` | `name` | Menú desplegable que permite asignar el cargo del usuario |
| `<option value="">` | `value=""` | Opción vacía que sirve como valor neutral para detectar si no se eligió rol |
| `<button type="submit">` | `type="submit"` | Dispara el evento `submit` del formulario al hacer clic |
| `<p id="mensajeError">` | `id` | Párrafo donde se escriben los mensajes de error visibles para el usuario |

---

### 2. El Escuchador de Envío del Formulario (`main.js`)

```javascript
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(formulario);
  // ...
});
```

| Elemento | Para qué sirve |
| --- | --- |
| `document.getElementById("formulario")` | Busca y captura el elemento `<form>` en el HTML |
| `.addEventListener("submit", ...)` | Registra una función que se ejecuta automáticamente cuando el usuario hace clic en "Registrar" |
| `event.preventDefault()` | **Cancela el comportamiento predeterminado del navegador** (que sería recargar la página al enviar el formulario) |
| `new FormData(formulario)` | Crea un objeto especial que lee automáticamente todos los campos del formulario por su atributo `name` |
| `fd.get("username")` | Extrae el valor del campo cuyo `name` es `"username"` |

---

### 3. Validación 1 — Doble Verificación de Contraseña

```javascript
const contrasena = fd.get("contrasena");
const validarContrasena = fd.get("validarContrasena");

/* validar contraseña */
if (contrasena !== validarContrasena) {
  document.getElementById("mensajeError").textContent = "Las contraseñas no coinciden";
  return;
}
```

| Elemento | Para qué sirve |
| --- | --- |
| `fd.get("contrasena")` | Lee el valor del primer campo de contraseña |
| `fd.get("validarContrasena")` | Lee el valor del campo de confirmación de contraseña |
| `if (contrasena !== validarContrasena)` | Compara los dos valores. Si son diferentes, entra al bloque de error |
| `.textContent = "..."` | Escribe el mensaje de error en el párrafo `#mensajeError` del HTML |
| `return` | **Detiene la ejecución** de la función inmediatamente, evitando que el registro continúe |

---

### 4. Validación 2 — Usuario Duplicado

```javascript
/* validar que el usuario no exista */
if (users.find((u) => u.username == fd.get("username"))) {
  document.getElementById("mensajeError").textContent = "El usuario ya existe";
  return;
}
```

| Elemento | Para qué sirve |
| --- | --- |
| `users` | Array (lista) en memoria que contiene todos los usuarios registrados, cargados desde `localStorage` |
| `.find((u) => u.username == ...)` | Recorre la lista buscando un usuario cuyo `username` coincida con el ingresado. Si lo encuentra, devuelve ese objeto |
| `if (users.find(...))` | Si `.find()` encuentra algo (no es `undefined`), significa que el usuario ya existe → muestra error y detiene el registro |

---

### 5. Validación 3 — Rol Obligatorio

```javascript
/* validar rol */
if (!fd.get("rol")) {
  document.getElementById("mensajeError").textContent = "Debe seleccionar un rol";
  return;
}
```

| Elemento | Para qué sirve |
| --- | --- |
| `fd.get("rol")` | Lee el valor seleccionado en el `<select name="rol">` |
| `!fd.get("rol")` | Si el valor es `""` (la opción "Seleccionar rol") o `null`, el `!` lo convierte en `true`, activando el error |
| `return` | Detiene el registro si no se eligió un rol válido |

---

### 6. Registro del Usuario — `addUser()`

```javascript
const addUser = async (username, nombre, contrasena, rol) => {
  try {
    await httpClient(
      `${URL}/users/${username}.json`,
      { username, nombre, contrasena, rol },
      "PUT",
    );
    users.push({ username, nombre, contrasena, rol });
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  } catch (error) {
    console.error(error);
  }
};
```

| Elemento | Para qué sirve |
| --- | --- |
| `httpClient(url, payload, "PUT")` | Envía una petición HTTP `PUT` a la base de datos de Firebase para registrar o actualizar el usuario. |
| `users.push(...)` | Añade el nuevo usuario al array en memoria para uso inmediato de la aplicación. |
| `localStorage.setItem(...)` | Persiste localmente los usuarios en formato de texto JSON para optimizar la carga. |
| `renderUsers()` | Redibuja el listado de usuarios en la tabla a través del componente `<app-tabla>`. |

---

## Análisis del Código: Login y Autenticación Paso a Paso

Esta sección detalla cómo funciona el inicio de sesión y la protección de accesos.

### 1. Estructura HTML de Inicio de Sesión (`login.html`)

El archivo [login.html](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/login.html) define la interfaz para que los usuarios puedan autenticarse.

```html
<form id="formularioLogin">
    <div class="campo-grupo">
        <label for="username">Username / Identificación</label>
        <input type="text" id="username" name="username" placeholder="usuario" required>
    </div>

    <div class="campo-grupo">
        <label for="contrasena">Contraseña</label>
        <input type="password" id="contrasena" name="contrasena" placeholder="••••••••" required>
    </div>

    <div class="form-actions">
        <button type="submit" class="btn-primario" id="btnIngresar">
            <i class="ti ti-login"></i> Ingresar
        </button>
    </div>

    <p class="mensaje-error" id="mensajeError"></p>
</form>
```

| Elemento | Atributo Clave | Para qué sirve |
| --- | --- | --- |
| `<form id="formularioLogin">` | `id` | Permite capturar el formulario en JavaScript para validar y procesar las credenciales al enviarlo. |
| `<input id="username">` | `id` / `name` | Recibe la identificación del usuario. |
| `<input id="contrasena">` | `type="password"` | Recibe la contraseña de forma enmascarada por motivos de seguridad. |
| `<button id="btnIngresar">` | `type="submit"` | Envía las credenciales ingresadas al manejador de eventos en JavaScript. |
| `<p id="mensajeError">` | `id` | Lugar reservado para imprimir avisos como "Contraseña incorrecta" o "Usuario no encontrado". |

---

### 2. Autenticación de Credenciales (`js/login.js`)

El controlador [login.js](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/js/login.js) consulta Firebase y compara las contraseñas introducidas por el usuario.

```javascript
formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("username").value; 
    const contrasena = document.getElementById("contrasena").value; 

    const user = await formularioLogin(id);

    if (user != null) {
        if (contrasena === user.contrasena) {
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "index.html";
        } else {
            document.getElementById("mensajeError").textContent = "Contraseña incorrecta";
        }
    }

    if (contrasena === "") {
        document.getElementById("mensajeError").textContent = "Ingrese una contraseña";
    } else if (user == null) {
        document.getElementById("mensajeError").textContent = "Usuario no encontrado";
    }
});
```

| Elemento / Sentencia | Para qué sirve |
| --- | --- |
| `formularioLogin(id)` | Realiza un `fetch` hacia Firebase para recuperar el registro del usuario según su ID (`/users/${username}.json`). |
| `contrasena === user.contrasena` | Compara la contraseña en texto plano ingresada con la guardada en la base de datos. |
| `localStorage.setItem("user", ...)` | Guarda el objeto de usuario activo en el almacenamiento local para persistir la sesión. |
| `window.location.href = "index.html"` | Redirecciona a la página de inicio (Dashboard de control de usuarios) si la validación es correcta. |

---

### 3. Control de Acceso y Sesión (`js/auth.js`)

El archivo [auth.js](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/js/auth.js) provee seguridad e impide la navegación no autorizada.

```javascript
export function verificar() {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "login.html";
  }
}

export function cerrarSesion() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

export function regresar() {
  const user = localStorage.getItem("user");
  if (user) {
    window.location.href = "index.html";
  }
}
```

| Función | Uso / Comportamiento |
| --- | --- |
| `verificar()` | Se invoca al inicio de las páginas del panel (`index.html`, `productos.html`, `produccion.html`). Si no hay sesión iniciada, fuerza la redirección inmediata a `login.html`. |
| `cerrarSesion()` | Elimina la información de usuario autenticado de `localStorage` y redirige a la pantalla de login. |
| `regresar()` | Se llama al entrar a la página de login. Evita que un usuario ya autenticado vuelva a iniciar sesión, redirigiéndolo de vuelta al panel (`index.html`). |

---

## Análisis del Código: Módulo de Inventario Paso a Paso

Este módulo administra los productos (materias primas y productos elaborados) y define sus fórmulas o recetas.

### 1. Interfaz de Administración de Productos (`productos.html`)

El archivo [productos.html](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/productos.html) define el formulario para añadir un nuevo producto y su correspondiente tabla de control.

```html
<form id="formularioProducto">
    <div class="campo-grupo">
        <label>Código</label>
        <input type="text" name="codigo" placeholder="Código del producto" required>
    </div>
    <div class="campo-grupo">
        <label>Nombre</label>
        <input type="text" name="nombre" placeholder="Nombre del producto" required>
    </div>
    <div class="campo-grupo">
        <label>Proveedor</label>
        <input type="text" name="proveedor" placeholder="Proveedor" required>
    </div>
    <div class="campo-grupo" style="margin-bottom: 1.5rem;">
        <label>Ingredientes (Opcional)</label>
        <div id="listaIngredientes"></div>
        <button type="button" id="btnAgregarIngrediente" class="btn-secundario">+ Agregar ingrediente</button>
    </div>
</form>
```

| Elemento | Atributo Clave | Para qué sirve |
| --- | --- | --- |
| `input name="codigo"` | `required` | Código identificador del producto. Se valida que no esté duplicado antes del registro. |
| `div id="listaIngredientes"` | `id` | Contenedor dinámico donde se agregan los selectores de insumos/ingredientes y sus cantidades requeridas. |
| `button id="btnAgregarIngrediente"` | `type="button"` | Agrega una fila de insumo para crear una receta (fórmula). |

---

### 2. Gestión de Recetas e Inventario (`js/productos.js`)

El archivo [productos.js](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/js/productos.js) gestiona la lógica del catálogo.

```javascript
const addProduct = async (codigo, nombre, proveedor, receta) => {
  try {
    const producto = { codigo, nombre, proveedor, stock: 0 };
    if (receta) producto.receta = receta;

    await httpClient(`${URL}/productos/${codigo}.json`, producto, "PUT");
    productos.push(producto);
    localStorage.setItem("productos", JSON.stringify(productos));
    showProducts();
  } catch (error) {
    console.error(error);
  }
};

const leerReceta = () => {
  const filas = document.querySelectorAll(".fila-ingrediente");
  if (filas.length === 0) return null;

  const receta = {};
  filas.forEach((fila) => {
    const ingrediente = fila.querySelector(".select-ingrediente").value;
    const cantidad = Number(fila.querySelector(".cantidad-ingrediente").value);
    receta[ingrediente] = cantidad;
  });
  return receta;
};
```

| Función | Para qué sirve |
| --- | --- |
| `listProducts()` | Retorna la lista de productos consultando en `localStorage` o en Firebase si este último está vacío. |
| `leerReceta()` | Parsea los selectores creados dinámicamente en el formulario para generar un objeto clave-valor que representa la fórmula (ej. `{ "Madera": 2, "Clavos": 10 }`). |
| `addProduct(...)` | Almacena un producto con stock en 0 e incluye su receta en Firebase y el almacenamiento local. |
| `updateProduct(...)` | Modifica los datos del producto (incluido el stock) en Firebase y actualiza la vista. |
| `deleteProduct(...)` | Envía una petición `DELETE` a Firebase y lo remueve del listado local en memoria. |
| Evento `#buscadorProductos` | Permite buscar en tiempo real productos comparando el término de búsqueda con el código y el nombre. |

---

## Análisis del Código: Módulo de Producción Paso a Paso

Permite llevar a cabo los procesos de manufactura descontando materias primas y registrando el historial.

### 1. Interfaz de Producción (`produccion.html`)

El archivo [produccion.html](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/produccion.html) contiene el formulario de manufacturación y la tabla histórica.

```html
<form id="formularioProduccion">
    <div class="campo-grupo">
        <label>Producto a fabricar</label>
        <select name="producto" id="selectProducto" required>
            <option value="">Seleccionar producto</option>
        </select>
    </div>
    <div class="campo-grupo">
        <label>Cantidad a fabricar</label>
        <input type="number" name="cantidad" id="inputCantidad" placeholder="0" min="1" required>
    </div>
    <div id="vistaPrevia" class="vista-previa"></div>
</form>
```

| Elemento | Atributo Clave | Para qué sirve |
| --- | --- | --- |
| `select id="selectProducto"` | `required` | Selector de productos que cuentan con una receta definida para poder iniciar su fabricación. |
| `input id="inputCantidad"` | `min="1"` | Define cuántas unidades del producto final se desean producir. |
| `div id="vistaPrevia"` | `id` | Panel informativo que detalla los ingredientes requeridos frente al stock disponible antes de fabricar. |

---

### 2. Validación de Stock e Historial de Producción (`js/produccion.js`)

El archivo [produccion.js](file:///c:/Users/Carol%20Sofia/OneDrive/Escritorio/Deyvid/Proyecto-Final--Javascript/js/produccion.js) coordina el flujo de manufacturación.

```javascript
const fabricarProducto = async (nombreProducto, cantidad) => {
  const productoTerminado = productos.find((p) => p.nombre === nombreProducto);

  // Descuenta stock de cada ingrediente
  for (const [nombreIngrediente, cantidadReceta] of Object.entries(productoTerminado.receta)) {
    const ingrediente = productos.find((p) => p.nombre === nombreIngrediente);
    ingrediente.stock -= cantidadReceta * Math.abs(cantidad);
    await httpClient(
      `${URL}/productos/${ingrediente.codigo}.json`,
      ingrediente,
      "PUT",
    );
  }

  // Incrementa stock del producto final
  productoTerminado.stock += cantidad;
  await httpClient(
    `${URL}/productos/${productoTerminado.codigo}.json`,
    productoTerminado,
    "PUT",
  );

  localStorage.setItem("productos", JSON.stringify(productos));

  // Genera el proceso y asigna id incremental
  const codigoProceso = procesos.length + 1;
  const proceso = {
    codigo: codigoProceso.toString(),
    producto: nombreProducto,
    cantidad: cantidad,
    fecha: new Date().toLocaleString(),
  };

  procesos.push(proceso);
  localStorage.setItem("procesos", JSON.stringify(procesos));
  await httpClient(`${URL}/procesos/${codigoProceso}.json`, proceso, "PUT");
};
```

| Función o Evento | Para qué sirve |
| --- | --- |
| `llenarSelectProductos()` | Carga en el selector únicamente los productos que tienen una propiedad `receta` asignada. |
| `validarStock(producto, cantidad)` | Calcula si el stock de materias primas alcanza para la cantidad especificada. Si falta stock, marca la diferencia en rojo y establece `alcanza = false`. |
| `actualizarVistaPrevia()` | Actualiza la UI de vista previa e inhabilita el botón de enviar si `alcanza === false`. |
| `fabricarProducto(...)` | Ejecuta las transacciones para descontar ingredientes, añadir stock final y subir el historial de producción a Firebase. |

---

## Análisis de Web Components Reutilizables

La aplicación implementa componentes web personalizados y modulares que facilitan la administración y reutilización de elementos.

### 1. Tabla Genérica (`js/components/app-tabla.js`)
El componente `<app-tabla>` centraliza la visualización de listas de datos tabulares (usuarios, productos o historial de producción).

- **Propiedad `columnas`:** Recibe una lista de objetos definidos por `{ campo: "clave", titulo: "Título Columna" }`.
- **Propiedad `datos`:** Arreglo de objetos a plasmar.
- **Acción:** Escucha clicks en botones identificados con `data-accion` ("editar", "eliminar") y emite un evento personalizado `accion-tabla` que arrastra los datos específicos del elemento de la fila.

### 2. Modal Editor (`js/components/app-editor.js`)
El componente `<app-editor>` dibuja la ventana flotante para la edición de productos en el inventario.

- **Propiedad `datos`:** Al asignarle un producto, rellena el formulario de edición con los datos correspondientes. Deshabilita el control de stock si el producto posee una receta (protegiendo el flujo de fabricación del módulo de producción).
- **Propiedad `open` (Booleana):** Muestra u oculta la ventana agregando o quitando propiedades de estilo en pantalla.
- **Acción:** Al enviar el formulario de edición, despacha el evento personalizado `product-edit` con los nuevos valores.

### 3. Menú Lateral de Navegación (`js/components/menu-lateral.js`)
El componente `<menu-lateral>` renderiza la barra lateral izquierda del panel de administración.

- **Atributo `activo`:** Indica en qué página se encuentra el usuario (ej. `"usuarios"`, `"productos"`, `"produccion"`) para resaltar visualmente el enlace de navegación activo.
- **Acción:** Registra el evento de clic sobre el enlace de cierre de sesión, invocando la función `cerrarSesion()` importada de `auth.js`.

---

## Próximas Tareas de Desarrollo (Plan de Mejora)

1. **Seguridad y Cifrado de Contraseñas:**
   - Cifrar las contraseñas con un algoritmo como SHA-256 o bcrypt antes de persistirlas en LocalStorage o enviarlas a Firebase.
2. **Diferenciación de Permisos por Rol:**
   - Ocultar o deshabilitar pestañas y botones de administración en el `<menu-lateral>` o las vistas de usuarios si el usuario logueado posee el rol `"usuario"` común y no `"admin"`.
3. **Diseño Adaptativo (Mobile-First):**
   - Incorporar reglas `@media` adicionales en `style.css` para optimizar la visualización de los menús laterales y las tablas en pantallas pequeñas.
