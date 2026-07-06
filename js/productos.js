import { verificar } from "./auth.js";
verificar();

const formulario = document.getElementById("formularioProducto");
const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";
let productos = [];
let contadorIngredientes = 0;

const listProducts = async () => {
  const listProductsLS = localStorage.getItem("productos");
  if (listProductsLS && JSON.parse(listProductsLS).length > 0) {
    productos = JSON.parse(listProductsLS);
  } else {
    const res = await fetch(`${URL}/productos.json`);
    const data = await res.json();
    productos = data ? Object.values(data) : [];
    localStorage.setItem("productos", JSON.stringify(productos));
  }
  return productos;
};

const httpClient = (url, payload, method) => {
  return fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
};

const deleteProduct = async (codigo) => {
  try {
    await httpClient(`${URL}/productos/${codigo}.json`, null, "DELETE");
    productos = productos.filter((p) => p.codigo !== codigo);
    localStorage.setItem("productos", JSON.stringify(productos));
    showProducts();
  } catch (error) {
    console.error(error);
  }
};

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

const updateProduct = async (codigo, nombre, proveedor, stock) => {
  try {
    const stockNum = Number(stock);
    await httpClient(
      `${URL}/productos/${codigo}.json`,
      { codigo, nombre, proveedor, stock: stockNum },
      "PUT",
    );
    productos = productos.map((p) =>
      p.codigo === codigo ? { codigo, nombre, proveedor, stock: stockNum } : p,
    );
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

document
  .getElementById("btnAgregarIngrediente")
  .addEventListener("click", () => {
    const id = contadorIngredientes++;
    const opciones = productos
      .map((p) => `<option value="${p.nombre}">${p.nombre}</option>`)
      .join("");

    const fila = document.createElement("div");
    fila.classList.add("fila-ingrediente");
    fila.dataset.id = id;
    fila.innerHTML = `
    <select class="select-ingrediente">${opciones}</select>
    <input type="number" class="cantidad-ingrediente" placeholder="Cantidad" min="1" required>
    <button type="button" class="btn-quitar-ingrediente">✕</button>
  `;

    document.getElementById("listaIngredientes").appendChild(fila);

    fila
      .querySelector(".btn-quitar-ingrediente")
      .addEventListener("click", () => {
        fila.remove();
      });
  });

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(formulario);
  const codigo = fd.get("codigo");
  const nombre = fd.get("nombre");
  const proveedor = fd.get("proveedor");
  const receta = leerReceta();

  if (productos.find((p) => p.codigo == codigo)) {
    document.getElementById("mensajeErrorProducto").textContent =
      "El producto ya existe";
    return;
  }
  document.getElementById("mensajeErrorProducto").textContent = "";
  addProduct(codigo, nombre, proveedor, receta);
  document.getElementById("listaIngredientes").innerHTML = "";
  formulario.reset();
});

const renderTabla = (lista) => {
  document.querySelector("#tablaProductos").datos = lista;

  if (lista.length === 0) {
    document.querySelector("#tablaVaciaProductos").style.display = "flex";
  } else {
    document.querySelector("#tablaVaciaProductos").style.display = "none";
  }
};

const showProducts = async () => {
  const lista = await listProducts();
  renderTabla(lista);
};

document
  .querySelector("#tablaProductos")
  .addEventListener("accion-tabla", async (e) => {
    const { accion, dato } = e.detail;

    if (accion === "eliminar") {
      await deleteProduct(dato.codigo);
    } else if (accion === "editar") {
      const editor = document.querySelector("app-editor");
      editor.datos = dato;
      editor.open = true;
    }
  });

document
  .querySelector("app-editor")
  .addEventListener("product-edit", async (e) => {
    const { codigo, nombre, proveedor, stock } = e.detail;
    await updateProduct(codigo, nombre, proveedor, stock);
  });

document
  .querySelector("#buscadorProductos")
  .addEventListener("input", async (e) => {
    const termino = e.target.value.toLowerCase();
    const lista = await listProducts();
    const filtrada = lista.filter(
      (p) =>
        p.codigo.toLowerCase().includes(termino) ||
        p.nombre.toLowerCase().includes(termino),
    );
    renderTabla(filtrada);
  });

customElements.whenDefined("app-tabla").then(() => {
  document.querySelector("#tablaProductos").columnas = [
    { campo: "codigo", titulo: "Código" },
    { campo: "nombre", titulo: "Nombre" },
    { campo: "proveedor", titulo: "Proveedor" },
    { campo: "stock", titulo: "Stock" },
  ];

  showProducts();
});
