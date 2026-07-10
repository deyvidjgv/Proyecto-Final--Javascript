import { verificar } from "./auth.js";
verificar();

const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";
let procesos = [];

const formulario = document.getElementById("formularioReporte");
const selecAnio = document.getElementById("selecAnio");
const selecMes = document.getElementById("selecMes");

const listProcesos = async () => {
    const listaProcesos = localStorage.getItem("procesos");
    if (listaProcesos && JSON.parse(listaProcesos).length > 0) {
        procesos = JSON.parse(listaProcesos).filter((p) => p !== null);
    } else {
        const res = await fetch(`${URL}/procesos.json`);
        const data = await res.json();
        procesos = data ? Object.values(data).filter((p) => p !== null) : [];
        localStorage.setItem("procesos", JSON.stringify(procesos));
    }
    return procesos;
};

const llenarSelectAnios = () => {
    const anios = [...new Set(procesos.map((p) => p.anio))].sort((a, b) => b - a);

    anios.forEach((anio) => {
        const option = document.createElement("option");
        option.textContent = anio;
        option.value = anio;
        selecAnio.appendChild(option);
    });
};

const generarReporte = (anio, mes) => {
    const procesosDelMes = procesos.filter(
        (p) => p.anio === Number(anio) && p.mes === Number(mes),
    );

    const consumo = {};

    procesosDelMes.forEach((proceso) => {
        Object.entries(proceso.detalle).forEach(([nombreIngrediente, info]) => {
            if (!consumo[nombreIngrediente]) {
                consumo[nombreIngrediente] = {
                    codigo: info.codigo,
                    nombre: nombreIngrediente,
                    cantidad: 0,
                };
            }
            consumo[nombreIngrediente].cantidad += info.cantidad;
        });
    });

    return Object.values(consumo);
};

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const anio = selecAnio.value;
    const mes = selecMes.value;

    if (!anio || !mes) {
        document.getElementById("mensajeErrorReporte").textContent =
            "Debe seleccionar un año y un mes";
        return;
    }

    document.getElementById("mensajeErrorReporte").textContent = "";

    const resultado = generarReporte(anio, mes);
    document.querySelector("#tablaReporte").datos = resultado;

    if (resultado.length === 0) {
        document.querySelector("#tablaVaciaReporte").style.display = "flex";
    } else {
        document.querySelector("#tablaVaciaReporte").style.display = "none";
    }
});

customElements.whenDefined("app-tabla").then(async () => {
    document.querySelector("#tablaReporte").columnas = [
        { campo: "codigo", titulo: "Código" },
        { campo: "nombre", titulo: "Nombre" },
        { campo: "cantidad", titulo: "Cantidad consumida" },
    ];

    await listProcesos();
    llenarSelectAnios();
});