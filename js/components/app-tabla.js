class AppTabla extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-accion]");
      if (!boton) return;
      const index = boton.closest("tr").dataset.index;
      const dato = this._datos[index];
      this.dispatchEvent(
        new CustomEvent("accion-tabla", {
          detail: { accion: boton.dataset.accion, dato },
        }),
      );
    });
  }

  set columnas(valor) {
    this._columnas = valor;
    this.render();
  }

  set datos(valor) {
    this._datos = valor;
    this.render();
  }

  render() {
    if (!this._columnas || !this._datos) return;

    let theadHTML = "";
    this._columnas.forEach((columna) => {
      theadHTML += `<th>${columna.titulo}</th>`;
    });
    theadHTML += `<th>Acciones</th>`;

    let tbodyHTML = "";
    this._datos.forEach((dato, index) => {
      tbodyHTML += `<tr data-index="${index}">
        ${this._columnas.map((columna) => `<td>${dato[columna.campo]}</td>`).join("")}
        <td>
          <button class="btn-accion btn-eliminar" data-accion="eliminar">
            <i class="ti ti-trash" title="Eliminar"></i>
          </button>
          <button class="btn-accion btn-editar" data-accion="editar">
            <i class="ti ti-edit" title="Editar"></i>
          </button>
        </td>
      </tr>`;
    });

    this.innerHTML = `
      <table class="tabla">
        <thead>
          <tr>${theadHTML}</tr>
        </thead>
        <tbody>
          ${tbodyHTML}
        </tbody>
      </table>
    `;
  }
}

customElements.define("app-tabla", AppTabla);
