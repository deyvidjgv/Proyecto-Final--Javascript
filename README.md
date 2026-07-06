# ProyectoAcmeProduccion_JavaScript

Sistema de Producción Acme — aplicación de gestión de usuarios, inventario y producción para la planta de Acme en Macondo. Permite controlar el inventario de materia prima y productos terminados, administrar usuarios del sistema y ejecutar el proceso productivo (transformación de materia prima en producto terminado según una receta).

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instrucciones de ejecución](#instrucciones-de-ejecución)
- [Módulos y funcionalidades](#módulos-y-funcionalidades)
- [Web Components](#web-components)
- [Base de datos](#base-de-datos)
- [Wireframes](#wireframes)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Autor](#autor)

## Descripción general

La aplicación resuelve el flujo operativo de la planta:

- Un usuario autenticado registra materia prima y productos elaborados en el inventario.
- A un producto elaborado se le puede asociar una **receta**, que indica cuánta materia prima se necesita para fabricarlo.
- Al ejecutar un proceso de producción, el sistema valida que haya stock suficiente de cada material, descuenta la materia prima usada y aumenta el stock del producto terminado, dejando un historial con código consecutivo.

## Tecnologías utilizadas

- **HTML5** — estructura de las vistas.
- **CSS3** (Flexbox) — estilos y diseño del panel.
- **JavaScript (ES6+)** — lógica de negocio, sin frameworks.
- **Web Components** (`customElements`) — tabla, menú lateral y modal reutilizables.
- **Firebase Realtime Database** — persistencia de datos vía REST API (`fetch`).
- **Tabler Icons** (CDN) — iconografía.

## Estructura del proyecto

```text
├── index.html # Pantalla de bienvenida (post-login)
├── login.html
├── usuarios.html # Módulo de usuarios
├── productos.html # Módulo de inventario
├── produccion.html # Módulo de producción
├── css/
│   ├── login.css
│   └── style.css # Estilos compartidos (sidebar, tabla, modal, formularios)
├── img/
├── wireframes/ # Bocetos de las pantallas del proyecto
└── js/
    ├── auth.js # Sesión: verificar(), cerrarSesion(), regresar()
    ├── login.js
    ├── inicio.js
    ├── usuarios.js # CRUD de usuarios
    ├── productos.js # CRUD de inventario (incluye recetas)
    ├── produccion.js # Ejecución de procesos de producción
    └── components/
        ├── app-tabla.js # Web Component: tabla genérica
        ├── menu-lateral.js # Web Component: barra de navegación
        └── app-editor.js # Web Component: modal de edición
```

## Instrucciones de ejecución

Este proyecto no requiere instalación de dependencias ni proceso de build: es HTML, CSS y JavaScript puro.

1. Clona el repositorio:
   git clone <url-del-repositorio>
   cd ProyectoAcmeProduccion_JavaScript_ApellidoNombre
2. Sírvelo con un servidor local en vez de abrir los `.html` directamente con `file://`, ya que las peticiones `fetch` a Firebase pueden bloquearse por CORS. Recomendado: la extensión **Live Server** de VS Code, o desplegarlo en Netlify / GitHub Pages.
3. Abre `login.html` como punto de entrada.

### Usuario de prueba

Para ingresar sin necesidad de registrar un usuario nuevo:

| Identificación (username) | Contraseña |
| ------------------------- | ---------- |
| `profe`                   | `123`      |

Este usuario ya está cargado en la instancia de Firebase que consume el proyecto. Si despliegas tu propia instancia de Firebase, deberás crear un usuario manualmente antes de poder iniciar sesión.

> **Nota:** el registro de nuevos usuarios no es público — solo puede hacerse desde dentro del sistema, ya con sesión iniciada, en el módulo de Usuarios.

## Módulos y funcionalidades

### Login (`login.html`)

- Autenticación por **identificación** (el campo `username` cumple esta función; no es un dato adicional al margen del enunciado) y **contraseña**.
- La sesión se guarda en `localStorage`.
- Todas las páginas internas verifican la sesión al cargar (`verificar()`); si no hay sesión activa, redirigen al login.
- Si ya hay sesión activa, `login.html` redirige automáticamente a la pantalla de inicio.

### Inicio (`index.html`)

- Pantalla de bienvenida tras iniciar sesión, con acceso directo a los 3 módulos del sistema.

### Módulo de usuarios (`usuarios.html`)

- Crear, editar y eliminar usuarios.
- Registro de identificación, nombre completo, cargo (rol) y contraseña, con doble validación para prevenir errores de digitación.
- Listado con buscador por identificación o nombre.

### Módulo de inventario (`productos.html`)

- Crear productos con **código, nombre y proveedor** (el stock siempre nace en `0`).
- Un producto puede tener una **receta** (materia prima + cantidad), agregada dinámicamente al crearlo mediante "+Agregar ingrediente":
  - Sin receta → el producto es materia prima.
  - Con receta → el producto es un producto elaborado.
- Listado con buscador por código o nombre, y eliminación de productos.
- **Edición de producto:**
  - Nombre y proveedor: siempre editables.
  - Stock: editable **solo si el producto es materia prima**. Si el producto tiene receta (es elaborado), el campo de stock queda bloqueado — su stock únicamente aumenta al fabricarlo desde el módulo de Producción, para mantener la trazabilidad real del inventario.

### Módulo de producción (`produccion.html`)

- Selección de un producto elaborado (con receta) y la cantidad a fabricar.
- Vista previa en tiempo real: calcula la materia prima necesaria (receta × cantidad) y la compara contra el stock disponible, marcando en rojo los ingredientes insuficientes y bloqueando la fabricación si no alcanza el stock.
- Al fabricar: descuenta el stock de cada materia prima usada y aumenta el stock del producto terminado.
- Cada proceso recibe un **código consecutivo** (inicia en 1) y queda registrado en un historial (producto fabricado, cantidad, fecha).

## Web Components

Para favorecer la reutilización de código entre los distintos módulos, se implementaron los siguientes componentes personalizados (`js/components/`):

- **`<app-tabla>`**: renderiza dinámicamente una tabla a partir de columnas y datos recibidos como propiedades, generando también los botones de acción (editar, eliminar) y emitiendo un evento `accion-tabla` al usarlos. Se reutiliza en Usuarios, Productos y el historial de Producción.
- **`<menu-lateral>`**: barra de navegación lateral; recibe la sección activa por atributo (`activo`) y marca el ítem correspondiente. Incluye el cierre de sesión.
- **`<app-editor>`**: modal de edición de productos; recibe los datos a editar mediante un setter y controla si el campo de stock puede modificarse según si el producto tiene receta o no.

## Base de datos

Se utiliza Firebase Realtime Database como backend, consumido directamente vía `fetch` (GET/PUT/DELETE) sin backend propio. Las entidades persistidas son:

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

## Wireframes

Los bocetos de las pantallas de Login, Usuarios, Inventario y Producción se encuentran en la carpeta `/wireframes` de este repositorio.

[Login](wireframes/wireframe-login.svg)
[Usuarios](wireframes/wireframe-usuarios.svg)
[Inventario](wireframes/wireframe-productos.svg)
[Producción](wireframes/wireframe-produccion.svg)

## Limitaciones conocidas

- No existe una acción independiente de "aumentar saldo" de materia prima por código + cantidad; el aumento de stock de materia prima se realiza editando el producto directamente.
- Un proceso de producción fabrica un solo producto a la vez (no varios productos en un mismo proceso).

## Autor

Deyvid Godoy — Proyecto individual, modulo de JavaScript.
