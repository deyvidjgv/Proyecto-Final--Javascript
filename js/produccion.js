import { verificar } from "./auth.js";
verificar();

const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";
let productos = [];
let procesos = [];

const formulario = document.getElementById("formularioProduccion");
const selectProducto = document.getElementById("selectProducto");
const inputCantidad = document.getElementById("inputCantidad");
const btnFabricar = document.getElementById("btnFabricar");

const httpClient = (url, payload, method) => {
  return fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
};

const listProduccion = async () => {
  const listaProductos = localStorage.getItem("productos");
  if (listaProductos) {
    productos = JSON.parse(listaProductos);
  } else {
    localStorage.setItem("productos", JSON.stringify([]));
  }
  return productos;
};

const listProcesos = async () => {
  const listaProcesos = localStorage.getItem("procesos");
  if (listaProcesos && JSON.parse(listaProcesos).length > 0) {
    procesos = JSON.parse(listaProcesos);
  } else {
    const res = await fetch(`${URL}/procesos.json`);
    const data = await res.json();
    procesos = data ? Object.values(data) : [];
    localStorage.setItem("procesos", JSON.stringify(procesos));
  }
  return procesos;
};

const llenarSelectProductos = () => {
  const elaborados = productos.filter((p) => p.receta);
  selectProducto.innerHTML = '<option value="">Seleccionar producto</option>';

  elaborados.forEach((p) => {
    const option = document.createElement("option");
    option.textContent = p.nombre;
    option.value = p.nombre;
    selectProducto.appendChild(option);
  });
};

const renderTablaProcesos = async () => {
  const lista = await listProcesos();
  document.querySelector("#tablaProduccion").datos = lista;
};

const validarStock = (producto, cantidad) => {
  const ingredientes = Object.entries(producto.receta);
  let alcanza = true;

  const filas = ingredientes.map(([nombre, cantidadReceta]) => {
    const ingrediente = productos.find((p) => p.nombre === nombre);
    const stockDisponible = ingrediente ? ingrediente.stock : 0;
    const necesario = cantidadReceta * cantidad;

    if (stockDisponible < necesario) alcanza = false;

    return `<div class="ingrediente-item">
      <span class="ingrediente-nombre">${nombre}</span>
      <span class="ingrediente-cantidad">Req: ${necesario} / Stock: ${stockDisponible}</span>
    </div>`;
  });

  return { alcanza, html: filas.join("") };
};

const actualizarVistaPrevia = () => {
  const nombreProducto = selectProducto.value;
  const cantidad = Number(inputCantidad.value) || 0;
  const vistaPrevia = document.querySelector("#vistaPrevia");

  if (!nombreProducto || cantidad <= 0) {
    vistaPrevia.innerHTML =
      "<div class='vista-previa-empty'>Selecciona un producto y una cantidad</div>";
    btnFabricar.disabled = true;
    return;
  }

  const producto = productos.find((p) => p.nombre === nombreProducto);
  const { alcanza, html } = validarStock(producto, cantidad);

  vistaPrevia.innerHTML = `
    <div class="vista-previa-header">
      <i class="ti ti-package"></i>
      <h2>${producto.nombre}</h2>
      <span class="badge ${alcanza ? "badge-success" : "badge-error"}">
        ${alcanza ? "Stock suficiente" : "Stock insuficiente"}
      </span>
    </div>
    <div class="vista-previa-content">
      <div class="lista-ingredientes">${html}</div>
    </div>
  `;

  btnFabricar.disabled = !alcanza;
};

selectProducto.addEventListener("change", actualizarVistaPrevia);
inputCantidad.addEventListener("input", actualizarVistaPrevia);

const fabricarProducto = async (nombreProducto, cantidad) => {
  const productoTerminado = productos.find((p) => p.nombre === nombreProducto);

  for (const [nombreIngrediente, cantidadReceta] of Object.entries(
    productoTerminado.receta,
  )) {
    const ingrediente = productos.find((p) => p.nombre === nombreIngrediente);
    ingrediente.stock -= cantidadReceta * cantidad;
    await httpClient(
      `${URL}/productos/${ingrediente.codigo}.json`,
      ingrediente,
      "PUT",
    );
  }

  productoTerminado.stock += cantidad;
  await httpClient(
    `${URL}/productos/${productoTerminado.codigo}.json`,
    productoTerminado,
    "PUT",
  );

  localStorage.setItem("productos", JSON.stringify(productos));

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

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (btnFabricar.disabled) return;

  const nombreProducto = selectProducto.value;
  const cantidad = Number(inputCantidad.value);

  btnFabricar.disabled = true;

  await fabricarProducto(nombreProducto, cantidad);

  formulario.reset();
  document.querySelector("#vistaPrevia").innerHTML = "";
  await renderTablaProcesos();
});

customElements.whenDefined("app-tabla").then(async () => {
  document.querySelector("#tablaProduccion").columnas = [
    { campo: "codigo", titulo: "Código" },
    { campo: "producto", titulo: "Producto" },
    { campo: "cantidad", titulo: "Cantidad" },
    { campo: "fecha", titulo: "Fecha" },
  ];

  await listProduccion();
  llenarSelectProductos();
  await renderTablaProcesos();
});
