import { verificar } from "./auth.js";
verificar();
const formulario = document.getElementById("formularioProducto");
const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";
let productos = [];

const listProducts = async () => {
  const listProducts = localStorage.getItem("productos");
  if (listProducts) {
    productos = JSON.parse(listProducts);
  } else {
    localStorage.setItem("productos", JSON.stringify([]));
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

const addProduct = async (codigo, nombre, proveedor) => {
  try {
    await httpClient(
      `${URL}/productos/${codigo}.json`,
      { codigo, nombre, proveedor, stock: 0 },
      "PUT",
    );
    productos.push({ codigo, nombre, proveedor, stock: 0 });
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
      p.codigo === codigo ? { codigo, nombre, proveedor, stock: stockNum } : p
    );
    localStorage.setItem("productos", JSON.stringify(productos));
    showProducts();
  } catch (error) {
    console.error(error);
  }
};

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(formulario);
  const codigo = fd.get("codigo");
  const nombre = fd.get("nombre");
  const proveedor = fd.get("proveedor");

  if (productos.find((p) => p.codigo == codigo)) {
    document.getElementById("mensajeErrorProducto").textContent =
      "El producto ya existe";
    return;
  }
  document.getElementById("mensajeErrorProducto").textContent = "";
  addProduct(codigo, nombre, proveedor);
  formulario.reset();
});

const renderTabla = (lista) => {
  document.querySelector("#tablaProductos").datos = lista;
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
