# Guía de Implementación — Sistema de Registro de Usuarios

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
- [x] Protección de rutas (evitar entrar a index.html sin sesión activa)
- [x] Botón "Salir" funcional (cerrar sesión)
- [x] Redirección automática si ya hay sesión activa al entrar a login.html

### ❌ Módulo de Inventario — Sin iniciar

- [ ] Registrar producto: código, nombre, proveedor
- [ ] Definir fórmula/receta cuando el producto es fabricado (materia prima + cantidades)
- [ ] Aumentar stock por código de producto + cantidad
- [ ] Listado de productos con datos completos y saldo actual
- [ ] Buscador/filtro de productos

### ❌ Módulo de Producción — Sin iniciar

- [ ] Seleccionar producto(s) a fabricar y cantidad
- [ ] Descontar materia prima según la fórmula
- [ ] Incrementar stock del producto terminado
- [ ] Código consecutivo autoincremental por proceso de producción
- [ ] Resumen de producción (cantidad fabricada + materia prima consumida)

### ❌ Transversales — Sin iniciar

- [ ] Web Components para reutilización de UI (tabla, formulario, modal, buscador)
- [ ] Diseño responsive validado en móvil
- [ ] Wireframes de Inventario y Producción
- [ ] Cifrado de contraseñas antes de almacenarlas

---

## ✅ ¿Cumplimos el Objetivo?

**Sí. El objetivo de registro de usuarios con validación fue cumplido al 100%.**

El requisito solicitado era:

> _"Para evitar alteraciones por terceros, se necesita un login, por lo cual se debe registrar usuarios en el sistema. Para registrar un usuario, se debe solicitar número de identificación, nombre completo, cargo y contraseña (Hacer doble validación para prevenir errores en la contraseña)."_

Lo que se implementó exitosamente:

- ✅ Formulario de registro con campos de **Username**, **Nombre**, **Contraseña** y **Rol (cargo)**.
- ✅ **Doble validación de contraseña** para prevenir errores de escritura.
- ✅ **Validación de usuario duplicado** para evitar registros repetidos.
- ✅ **Validación de Rol obligatorio** para asegurar que cada usuario tenga un cargo asignado.
- ✅ **Mensajes de error** mostrados en pantalla para guiar al usuario en caso de fallo.
- ✅ **Persistencia** de los datos en `localStorage` y sincronización con **Firebase**.
- ✅ **Tabla de control de usuarios** con opciones de editar y eliminar.
- ✅ **Modal de edición** con selección de rol y actualización local inmediata.

---

## Análisis del Código: Registro y Validación Paso a Paso

Esta sección explica el código en detalle, elemento por elemento.

---

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
    <input
      type="password"
      name="validarContrasena"
      placeholder="••••••••"
      required
    />
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

| Elemento                           | Atributo Clave    | Para qué sirve                                                              |
| ---------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| `<form id="formulario">`           | `id`              | Permite seleccionarlo con JavaScript para escuchar el evento de envío       |
| `<input name="username">`          | `name`            | Identificador que usa `FormData` para leer el valor del campo               |
| `<input type="password">`          | `type="password"` | Oculta el texto escrito por seguridad                                       |
| `<input name="validarContrasena">` | `name`            | Segundo campo de contraseña para la doble validación                        |
| `<select name="rol">`              | `name`            | Menú desplegable que permite asignar el cargo del usuario                   |
| `<option value="">`                | `value=""`        | Opción vacía que sirve como valor neutral para detectar si no se eligió rol |
| `<button type="submit">`           | `type="submit"`   | Dispara el evento `submit` del formulario al hacer clic                     |
| `<p id="mensajeError">`            | `id`              | Párrafo donde se escriben los mensajes de error visibles para el usuario    |

---

### 2. El Escuchador de Envío del Formulario (`main.js`)

```javascript
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(formulario);
  ...
});
```

| Elemento                                | Para qué sirve                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `document.getElementById("formulario")` | Busca y captura el elemento `<form>` en el HTML                                                                   |
| `.addEventListener("submit", ...)`      | Registra una función que se ejecuta automáticamente cuando el usuario hace clic en "Registrar"                    |
| `event.preventDefault()`                | **Cancela el comportamiento predeterminado del navegador** (que sería recargar la página al enviar el formulario) |
| `new FormData(formulario)`              | Crea un objeto especial que lee automáticamente todos los campos del formulario por su atributo `name`            |
| `fd.get("username")`                    | Extrae el valor del campo cuyo `name` es `"username"`                                                             |

---

### 3. Validación 1 — Doble Verificación de Contraseña

```javascript
const contrasena = fd.get("contrasena");
const validarContrasena = fd.get("validarContrasena");

/* validar contraseña */
if (contrasena !== validarContrasena) {
  document.getElementById("mensajeError").textContent =
    "Las contraseñas no coinciden";
  return;
}
```

| Elemento                                | Para qué sirve                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fd.get("contrasena")`                  | Lee el valor del primer campo de contraseña                                              |
| `fd.get("validarContrasena")`           | Lee el valor del campo de confirmación de contraseña                                     |
| `if (contrasena !== validarContrasena)` | Compara los dos valores. Si son diferentes, entra al bloque de error                     |
| `.textContent = "..."`                  | Escribe el mensaje de error en el párrafo `#mensajeError` del HTML                       |
| `return`                                | **Detiene la ejecución** de la función inmediatamente, evitando que el registro continúe |

---

### 4. Validación 2 — Usuario Duplicado

```javascript
/* validar que el usuario no exista */
if (users.find((u) => u.username == fd.get("username"))) {
  document.getElementById("mensajeError").textContent = "El usuario ya existe";
  return;
}
```

| Elemento                          | Para qué sirve                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `users`                           | Array (lista) en memoria que contiene todos los usuarios registrados, cargados desde `localStorage`                       |
| `.find((u) => u.username == ...)` | Recorre la lista buscando un usuario cuyo `username` coincida con el ingresado. Si lo encuentra, devuelve ese objeto      |
| `if (users.find(...))`            | Si `.find()` encuentra algo (no es `undefined`), significa que el usuario ya existe → muestra error y detiene el registro |

---

### 5. Validación 3 — Rol Obligatorio

```javascript
/* validar rol */
if (!fd.get("rol")) {
  document.getElementById("mensajeError").textContent =
    "Debe seleccionar un rol";
  return;
}
```

| Elemento         | Para qué sirve                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `fd.get("rol")`  | Lee el valor seleccionado en el `<select name="rol">`                                                         |
| `!fd.get("rol")` | Si el valor es `""` (la opción "Seleccionar rol") o `null`, el `!` lo convierte en `true`, activando el error |
| `return`         | Detiene el registro si no se eligió un rol válido                                                             |

---

### 6. Registro del Usuario — `addUser()`

```javascript
const datos = {
  username: fd.get("username"),
  nombre: fd.get("nombre"),
  contrasena: fd.get("contrasena"),
  rol: fd.get("rol"),
};
addUser(datos.username, datos.nombre, datos.contrasena, datos.rol);
formulario.reset();
```

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

| Elemento                          | Para qué sirve                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `const datos = { ... }`           | Agrupa los valores del formulario en un solo objeto organizado                                         |
| `addUser(...)`                    | Llama a la función que hace el proceso completo de guardado                                            |
| `formulario.reset()`              | Limpia todos los campos del formulario después de registrar                                            |
| `async / await`                   | Permite hacer operaciones de red (Firebase) sin bloquear la pantalla mientras espera la respuesta      |
| `httpClient(url, payload, "PUT")` | Función que envía una petición HTTP `PUT` a Firebase para guardar el usuario en la nube                |
| `users.push(...)`                 | Agrega el nuevo usuario al array en memoria                                                            |
| `localStorage.setItem(...)`       | Guarda la lista actualizada en el almacenamiento del navegador (persiste aunque se recargue la página) |
| `JSON.stringify(users)`           | Convierte el array a texto en formato JSON para poder guardarlo                                        |
| `renderUsers()`                   | Actualiza la tabla visual en pantalla para mostrar el nuevo usuario                                    |

---

### 7. Persistencia de Datos — `localStorage`

```javascript
const listUsers = async () => {
  const usersLS = localStorage.getItem("users");
  if (usersLS) {
    users = JSON.parse(usersLS);
  } else {
    localStorage.setItem("users", JSON.stringify([]));
  }
  return users;
};
```

| Elemento                                            | Para qué sirve                                               |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `localStorage.getItem("users")`                     | Intenta leer la lista de usuarios guardada en el navegador   |
| `JSON.parse(usersLS)`                               | Convierte el texto JSON de vuelta a un array de JavaScript   |
| `localStorage.setItem("users", JSON.stringify([]))` | Si no existe ningún dato guardado, inicializa la lista vacía |

---

### 8. Visualización de Mensajes de Error

```javascript
document.getElementById("mensajeError").textContent =
  "Las contraseñas no coinciden";
// ...
document.getElementById("mensajeError").textContent = ""; // Limpia el error si todo está bien
```

```css
.mensaje-error {
  font-size: 15px;
  color: #c0392b;
  margin-top: 10px;
  min-height: 16px;
  text-align: center;
}
```

| Elemento                  | Para qué sirve                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `textContent = "mensaje"` | Escribe texto dentro del `<p>` en el HTML, visible para el usuario                                       |
| `textContent = ""`        | Borra el mensaje de error cuando las validaciones pasan exitosamente                                     |
| `.mensaje-error` (CSS)    | Aplica el color rojo (`#c0392b`) y centra el texto para que sea claramente visible                       |
| `min-height: 16px`        | Reserva espacio visual en el formulario para que el layout no "salte" al aparecer/desaparecer el mensaje |

---

## Flujo Completo del Registro (Resumen Visual)

```
Usuario llena el formulario
          ↓
  ¿Las contraseñas coinciden?  →  NO  →  Muestra error → STOP
          ↓ SÍ
  ¿El username ya existe?      →  SÍ  →  Muestra error → STOP
          ↓ NO
  ¿Se seleccionó un rol?       →  NO  →  Muestra error → STOP
          ↓ SÍ
  Limpia mensajes de error
          ↓
  Guarda usuario en Firebase (nube)
          ↓
  Guarda usuario en localStorage (local)
          ↓
  Actualiza la tabla en pantalla
          ↓
  Limpia el formulario
```

---

## Próximos Pasos Pendientes

- [ ] Implementar pantalla de **Login** con verificación de credenciales.
- [ ] Control de acceso: redirigir al Login si no hay sesión activa.
- [ ] Diferenciación de permisos según el **Rol** (Administrador vs. Usuario).
- [ ] Cifrado de contraseñas antes de almacenarlas.

Este documento explica paso a paso cómo reestructurar y ampliar la aplicación para implementar un control de acceso seguro mediante inicio de sesión (Login) y registro de usuarios con doble validación de contraseña, sin alterar el código actual de manera automática.

---

## Paso 1: Reestructuración de la Interfaz (HTML)

Para controlar el acceso de terceros, es necesario contar con pantallas para iniciar sesión y para registrar usuarios antes de mostrar el panel de control principal.

1. **Crear Contenedores para las Pantallas (Screens):**
   - Agrupa las secciones actuales del panel en un contenedor principal (por ejemplo, una pantalla de tipo "Dashboard").
   - Define dos nuevos contenedores principales al mismo nivel en el archivo HTML: uno para la pantalla de **Login** y otro para la pantalla de **Registro**.
   - Utiliza clases de CSS (como las que ya tienes, ej. `.screen` y `.screen.active`) para alternar la visibilidad de estas pantallas mediante manipulación de clases desde JavaScript.

2. **Modificar los Campos del Formulario de Registro:**
   - En el formulario de registro de usuario, asegúrate de solicitar los siguientes campos específicos:
     - **Número de Identificación:** Un campo de entrada numérico único para cada usuario.
     - **Nombre Completo:** Un campo de texto estándar.
     - **Cargo:** Un campo de texto o un menú desplegable (select) con las opciones de roles del sistema.
     - **Contraseña:** Campo tipo contraseña.
     - **Confirmar Contraseña:** Un segundo campo tipo contraseña indispensable para la doble validación.

3. **Crear el Formulario de Inicio de Sesión (Login):**
   - Diseña un formulario sencillo que pida únicamente el **Número de Identificación** (o nombre de usuario) y la **Contraseña**.
   - Agrega un botón para enviar las credenciales y un enlace/botón alternativo que redirija a la pantalla de Registro si el usuario no tiene cuenta.

---

## Paso 2: Validación de Datos en el Registro (JavaScript)

La validación debe realizarse del lado del cliente (Frontend) al interceptar el evento de envío del formulario de registro.

1. **Captura del Evento de Envío:**
   - Registra un escuchador de eventos para el envío (`submit`) del formulario de Registro.
   - Cancela el comportamiento predeterminado del formulario para procesar los datos manualmente.

2. **Doble Validación de Contraseña:**
   - Obtén los valores ingresados en los campos de "Contraseña" y "Confirmar Contraseña".
   - Compara ambas cadenas de texto:
     - Si son idénticas: Procede con el registro.
     - Si no coinciden: Cancela el proceso de envío y muestra un mensaje de error claro en pantalla (por ejemplo, usando tu elemento de mensaje de error).
   - Opcional: Valida reglas de seguridad adicionales (longitud mínima, presencia de números o caracteres especiales).

3. **Validación de Identificación Única:**
   - Verifica que el número de identificación ingresado no esté ya registrado en la base de datos local o en Firebase, informando al usuario en caso de duplicidad.

---

## Paso 3: Almacenamiento y Envío de Datos a la Base de Datos

Una vez validados los datos del nuevo usuario, estos deben guardarse tanto de forma remota como local.

1. **Actualizar el Esquema de Datos:**
   - Modifica el objeto enviado a Firebase para que contenga las propiedades correspondientes:
     - `identificacion`
     - `nombre`
     - `cargo`
     - `contrasena` (Nota: En un entorno de producción real, las contraseñas deben cifrarse antes de almacenarse).

2. **Petición HTTP a Firebase:**
   - Llama a tu función de cliente HTTP usando el método adecuado (`PUT` o `POST`) dirigiendo la petición a la ruta de usuarios de Firebase, usando como clave o ID el número de identificación del usuario.

3. **Persistencia en LocalStorage:**
   - Actualiza tu lista local en memoria agregando el nuevo usuario y guarda la lista serializada en el almacenamiento local para consultas rápidas.

---

## Paso 4: Lógica del Inicio de Sesión (Login)

Para autenticar a un usuario ya registrado al ingresar al sistema:

1. **Captura del Formulario de Login:**
   - Intercepta el envío del formulario de Login.
   - Obtén los valores ingresados para la Identificación y la Contraseña.

2. **Verificación de Credenciales:**
   - Busca en la lista de usuarios (ya sea en la base de datos o en el almacenamiento local) un registro que coincida con el número de identificación proporcionado.
   - Si el usuario existe, compara la contraseña ingresada con la contraseña almacenada para ese registro.
     - **Acceso Exitoso:** Almacena la sesión del usuario (por ejemplo, en `sessionStorage`) y cambia la pantalla activa ocultando el Login e introduciendo la clase activa al Dashboard.
     - **Acceso Denegado:** Muestra un error informando que las credenciales no son válidas.

---

## Paso 5: Control de Accesos y Cierre de Sesión

Para garantizar que nadie acceda a las vistas del panel sin estar logueado:

1. **Comprobación de Sesión al Cargar la Página:**
   - Al iniciar el script, comprueba si existe un token o identificador de sesión activa guardado.
   - Si no existe una sesión activa, redirige automáticamente al usuario a la pantalla de Login y oculta las demás secciones.

2. **Cierre de Sesión (Logout):**
   - Asocia una acción al botón de "Salir" del menú lateral.
   - Al hacer clic, elimina los datos de sesión activa del almacenamiento y recarga la página o redirige al usuario de vuelta a la pantalla de Login.
