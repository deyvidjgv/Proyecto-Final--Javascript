import { verificar } from "./auth.js";

verificar();
let users = [];
let items = [];
let usuarioSeleccionado = null;

const formulario = document.getElementById("formulario");
const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";
const btnCerrar = document.getElementById("cerrarVentana");
const modal = document.getElementById("miModal");

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(formulario);

  const contrasena = fd.get("contrasena");
  const validarContrasena = fd.get("validarContrasena");

  if (contrasena !== validarContrasena) {
    document.getElementById("mensajeError").textContent =
      "Las contraseñas no coinciden";
    return;
  }

  if (users.find((u) => u.username == fd.get("username"))) {
    document.getElementById("mensajeError").textContent =
      "El usuario ya existe";
    return;
  }

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
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
};

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
  await listUsers();
};

document.addEventListener("product-submit", (event) => {
  const item = event.detail;
  items.push(item);
  localStorage.setItem("items", JSON.stringify(items));
});

const renderTabla = (lista) => {
  const tablaVacia = document.getElementById("tablaVacia");

  if (lista.length === 0) {
    tablaVacia.style.display = "flex";
    document.querySelector("#tablaUsuarios").style.display = "none";
  } else {
    tablaVacia.style.display = "none";
    document.querySelector("#tablaUsuarios").style.display = "";
    document.querySelector("#tablaUsuarios").datos = lista;
  }
};

const renderUsers = async () => {
  const lista = await listUsers();
  renderTabla(lista);
};

document
  .getElementById("buscadorUsuarios")
  .addEventListener("input", async (e) => {
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
  .querySelector("#tablaUsuarios")
  .addEventListener("accion-tabla", async (e) => {
    const { accion, dato } = e.detail;

    if (accion === "eliminar") {
      await deleteUser(dato.username);
    }

    if (accion === "editar") {
      usuarioSeleccionado = dato.username;
      document.getElementById("editUsername").value = dato.username;
      document.getElementById("editNombre").value = dato.nombre;
      document.getElementById("editRol").value = dato.rol || "";
      document.getElementById("editPassword").value = dato.contrasena;
      modal.style.display = "flex";
    }
  });

document
  .getElementById("formEditarUsuario")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const nuevoNombre = document.getElementById("editNombre").value;
    const nuevaContrasena = document.getElementById("editPassword").value;
    const nuevoRol = document.getElementById("editRol").value;

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

btnCerrar.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

customElements.whenDefined("app-tabla").then(() => {
  document.querySelector("#tablaUsuarios").columnas = [
    { campo: "username", titulo: "Username" },
    { campo: "nombre", titulo: "Nombre" },
    { campo: "rol", titulo: "Rol" },
  ];

  showUsers();
  renderUsers();
});
