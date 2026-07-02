import {verificar} from "./auth.js";
import {cerrarSesion} from "./auth.js";

verificar();
let users = [];
let items = [];

const formulario = document.getElementById("formulario");
const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(formulario);

  const contrasena = fd.get("contrasena");
  const validarContrasena = fd.get("validarContrasena");

  /* validar contraseña */
  if (contrasena !== validarContrasena) {
    document.getElementById("mensajeError").textContent =
      "Las contraseñas no coinciden";
    return;
  }

  /* validar que el usuario no exista */
  if (users.find((u) => u.username == fd.get("username"))) {
    document.getElementById("mensajeError").textContent =
      "El usuario ya existe";
    return;
  }

  /* validar rol */
  if (!fd.get("rol")) {
    document.getElementById("mensajeError").textContent =
      "Debe seleccionar un rol";
    return;
  }

  document.getElementById("mensajeError").textContent = "";

  const datos = {
    username: fd.get("username"),
    nombre: fd.get("nombre"),
    contrasena: fd.get("contrasena"),
    rol: fd.get("rol"),
  };
  addUser(datos.username, datos.nombre, datos.contrasena, datos.rol);
  console.log("Datos del formulario:", datos);
  formulario.reset();
});

const listUsers = async () => {
  const usersLS = localStorage.getItem("users");
  if (usersLS) {
    users = JSON.parse(usersLS);
  } else {
    localStorage.setItem("users", JSON.stringify([]));
  }
  return users;
};

const httpClient = (url, payload, method) => {
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
};

const addUser = async (username, nombre, contrasena, rol) => {
  try {
    const res = await httpClient(
      `${URL}/users/${username}.json`,
      { username, nombre, contrasena, rol },
      "PUT",
    );
    const data = await res.json();
    console.log(data);

    users.push({ username, nombre, contrasena, rol });
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  } catch (error) {
    console.error(error);
  }
};

const deleteUser = async (username) => {
  try {
    await httpClient(`${URL}/users/${username}.json`, null, "DELETE");
    users = users.filter((u) => u.username !== username);
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  } catch (error) {
    console.error(error);
  }
};

const showUsers = async () => {
  const lista = await listUsers();
  console.log("Usuarios:", lista);
};

document.addEventListener("product-submit", (event) => {
  const item = event.detail;
  items.push(item);
  localStorage.setItem("items", JSON.stringify(items));
});

const renderTabla = (lista) => {
  const tbody = document.getElementById("cuerpoTablaUsuarios");
  const tablaVacia = document.getElementById("tablaVacia");

  tbody.innerHTML = "";
  if (lista.length === 0) {
    tablaVacia.style.display = "flex";
    return;
  }
  tablaVacia.style.display = "none";

  lista.forEach((user) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
            <td>${user.username}</td>
            <td>${user.nombre}</td>
            <td>${user.rol}</td>
            <td>
                <button class="btn-accion btn-eliminar" data-username="${user.username}">
                    <i class="ti ti-trash" title="Eliminar"></i>
                </button>
                <button class="btn-accion btn-editar" data-edit="${user.username}">
                    <i class="ti ti-edit" title="Editar"></i>
                </button>
            </td>
        `;
    tbody.appendChild(fila);
  });
};

const renderUsers = async () => {
  const lista = await listUsers();
  renderTabla(lista);
};

document.getElementById("buscadorUsuarios").addEventListener("input", async (e) => {
    const termino = e.target.value.toLowerCase();
    const lista = await listUsers();

    const filtrada = lista.filter(
      (user) =>
        user.username.toLowerCase().includes(termino) ||
        user.nombre.toLowerCase().includes(termino),
    );
    renderTabla(filtrada);
  });

document
  .getElementById("cuerpoTablaUsuarios")
  .addEventListener("click", async (e) => {
    const boton = e.target.closest(".btn-eliminar");
    if (!boton) return;

    const username = boton.dataset.username;
    await deleteUser(username);
  });

// Obtener elementos
const tbody = document.getElementById("cuerpoTablaUsuarios");
const btnCerrar = document.getElementById("cerrarVentana");
const modal = document.getElementById("miModal");

// Abrir ventana
let usuarioSeleccionado = null;

tbody.addEventListener("click", async (event) => {
  const botonEditar = event.target.closest(".btn-editar");
  if (botonEditar) {
    const usernameParaEditar = botonEditar.getAttribute("data-edit");
    const user = users.find((u) => u.username === usernameParaEditar);

    if (user) {
      usuarioSeleccionado = user.username;
      document.getElementById("editUsername").value = user.username;
      document.getElementById("editNombre").value = user.nombre;
      document.getElementById("editRol").value = user.rol || "";
      document.getElementById("editPassword").value = user.contrasena;
      modal.style.display = "flex";
    }
  }
});

/* editar usuario */

document
  .getElementById("formEditarUsuario")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const nuevoNombre = document.getElementById("editNombre").value;
    const nuevaContrasena = document.getElementById("editPassword").value;
    const nuevoRol = document.getElementById("editRol").value;

    // Actualizar localmente
    users = users.map((u) =>
      u.username === usuarioSeleccionado
        ? {
            username: usuarioSeleccionado,
            nombre: nuevoNombre,
            contrasena: nuevaContrasena,
            rol: nuevoRol,
          }
        : u,
    );
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
    modal.style.display = "none";

    //sincronizar con Firebase
    try {
      await httpClient(
        `${URL}/users/${usuarioSeleccionado}.json`,
        {
          username: usuarioSeleccionado,
          nombre: nuevoNombre,
          contrasena: nuevaContrasena,
          rol: nuevoRol,
        },
        "PUT",
      );
    } catch (error) {
      console.error("Error al sincronizar con Firebase:", error);
    }
  });

// Cerrar ventana haciendo clic en la X
btnCerrar.addEventListener("click", () => {
  modal.style.display = "none";
});

// Cerrar ventana haciendo clic fuera del contenido
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

const salir = document.getElementById("salir");

salir.addEventListener("click", () => {
  cerrarSesion();
});

showUsers();
renderUsers();
