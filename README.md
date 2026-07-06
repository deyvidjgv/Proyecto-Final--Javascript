# Sistema de Producción Acme

Aplicación web para la gestión del proceso productivo de la planta Acme en Macondo: control de usuarios, inventario de productos/materia prima con recetas, y ejecución de procesos de producción con trazabilidad de stock.

Desarrollado con HTML, CSS y JavaScript (vanilla), utilizando Web Components para la reutilización de interfaz y Firebase Realtime Database como backend.

## Cómo ejecutar el proyecto

Este proyecto no requiere instalación de dependencias ni build. Para ejecutarlo:

1. Clona el repositorio.
2. Abre la carpeta con Live Server (extensión de VSCode) o despliega el contenido en Netlify / GitHub Pages.
3. Abre `login.html` como punto de entrada.

### Cuenta de acceso de prueba

| Usuario | Contraseña |
| ------- | ---------- |
| `profe` | `123`      |

> El registro de nuevos usuarios **no es público**: solo puede hacerse desde dentro del sistema, ya con sesión iniciada, en el módulo de Usuarios. Usa la cuenta anterior para el primer ingreso.

## Estructura del proyecto

├── css/
│ ├── login.css
│ └── style.css
├── img/
├── js/
│ ├── components/
│ │ ├── app-editor.js # Web Component: modal de edición
│ │ ├── app-tabla.js # Web Component: tabla genérica reutilizable
│ │ └── menu-lateral.js # Web Component: barra de navegación lateral
│ ├── auth.js # Lógica de sesión (login/logout/redirecciones)
│ ├── inicio.js
│ ├── login.js
│ ├── usuarios.js
│ ├── productos.js
│ └── produccion.js
├── index.html # Pantalla de bienvenida (post-login)
├── login.html
├── usuarios.html # Módulo de Usuarios
├── productos.html # Módulo de Inventario
├── produccion.html # Módulo de Producción
└── README.md

## Funcionalidades por módulo

### Login

- Autenticación por **identificación** (el campo `username` cumple esta función; no es un dato adicional) y **contraseña**.
- Protección de rutas: cualquier página del panel redirige a `login.html` si no hay sesión activa.
- Si ya hay sesión activa, `login.html` redirige automáticamente al panel.

### Inicio

- Pantalla de bienvenida tras iniciar sesión, con acceso directo a los 3 módulos del sistema.

### Módulo de Usuarios

- Registro con identificación (`username`), nombre completo, cargo (rol) y contraseña (con doble validación).
- Validación de identificación duplicada y rol obligatorio.
- Listado, búsqueda, edición y eliminación de usuarios.

### Módulo de Inventario (Productos)

- Registro de producto: **código, nombre, proveedor** (el stock siempre nace en `0`).
- Un producto puede tener una **receta** (materia prima + cantidad necesaria), agregada dinámicamente con el botón "+Agregar ingrediente" al crear el producto.
  - Producto **sin** receta → es materia prima.
  - Producto **con** receta → es un producto elaborado.
- Listado, búsqueda y eliminación de productos.
- **Edición de producto:**
  - Nombre y proveedor: siempre editables.
  - Stock: **editable solo si el producto es materia prima** (no tiene receta). Si el producto tiene receta (es elaborado), el campo de stock aparece bloqueado — su stock únicamente puede aumentar fabricándolo desde el módulo de Producción, para mantener la trazabilidad real del inventario.

### Módulo de Producción

- Selección de un producto elaborado (con receta) y la cantidad a fabricar.
- Vista previa en tiempo real: calcula la materia prima necesaria (receta × cantidad) y la compara contra el stock disponible, marcando en rojo los ingredientes insuficientes y bloqueando la fabricación si no alcanza.
- Al fabricar: descuenta el stock de cada materia prima usada y aumenta el stock del producto terminado.
- Cada proceso de producción recibe un **código consecutivo** (inicia en 1) y queda registrado en un historial (producto fabricado, cantidad, fecha).

## Web Components

| Componente     | Función                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app-tabla`    | Tabla reutilizable: recibe columnas y datos como propiedades; emite un evento `accion-tabla` al editar/eliminar una fila. Se usa en Usuarios, Productos y el historial de Producción. |
| `menu-lateral` | Barra de navegación lateral; recibe la sección activa por atributo y marca el ítem correspondiente. Incluye el cierre de sesión.                                                      |
| `app-editor`   | Modal de edición de productos; recibe los datos a editar y controla si el stock puede modificarse según si el producto tiene receta o no.                                             |

## Modelo de datos (Firebase Realtime Database)

```json
{
  "users": {
    "profe": {
      "username": "profe",
      "nombre": "...",
      "contrasena": "123",
      "rol": "admin"
    }
  },
  "productos": {
    "COD_001": {
      "codigo": "COD_001",
      "nombre": "Galleta Chocolate",
      "proveedor": "Acme Corp",
      "stock": 50,
      "receta": { "Harina": 100, "Mantequilla": 100, "Huevo": 1 }
    }
  },
  "procesos": {
    "1": {
      "codigo": "1",
      "producto": "Galleta Chocolate",
      "cantidad": 5,
      "fecha": "..."
    }
  }
}
```
