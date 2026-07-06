class AppEditor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = ` <div id="miModal" class="modal">
                <div class="container-modal">
                    <span id="cerrarVentana" class="cerrar">&times;</span>
                    <h2>Editar Producto</h2>
                    
                    <form id="formularioEditarProducto">

                        
                        <label for="editProductoCodigo">Codigo:</label>
                        <input type="text" id="editProductoCodigo" required readonly>

                        <label for="editProductoNombre">Nombre:</label>
                        <input type="text" id="editProductoNombre" required>

                        <label for="editProductoProveedor">Proveedor:</label>
                        <input type="text" id="editProductoProveedor" required>

                        <label for="editProductoStock">Stock:</label>
                        <input type="text" id="editProductoStock" required>
                        
                        <button type="submit">Guardar Cambios</button>
                    </form>
                </div>
            </div>`;
    this.querySelector("#cerrarVentana").addEventListener("click", () => {
      this.open = false;
    });
    this.querySelector("#formularioEditarProducto").addEventListener(
      "submit",
      (e) => {
        e.preventDefault();
        const codigo = this.querySelector("#editProductoCodigo").value;
        const nombre = this.querySelector("#editProductoNombre").value;
        const proveedor = this.querySelector("#editProductoProveedor").value;
        const stock = this.querySelector("#editProductoStock").value;
        this.dispatchEvent(
          new CustomEvent("product-edit", {
            detail: {
              codigo,
              nombre,
              proveedor,
              stock,
            },
          }),
        );
        this.open = false;
      },
    );
  }

  set open(value) {
    if (value) {
      this.querySelector("#miModal").style.display = "flex";
    } else {
      this.querySelector("#miModal").style.display = "none";
    }
  }

  set datos(datos) {
    this.querySelector("#editProductoCodigo").value = datos.codigo;
    this.querySelector("#editProductoNombre").value = datos.nombre;
    this.querySelector("#editProductoProveedor").value = datos.proveedor;
    this.querySelector("#editProductoStock").value = datos.stock;
    if (datos.receta) {
      this.querySelector("#editProductoStock").disabled = true;
    } else {
      this.querySelector("#editProductoStock").disabled = false;
    }
  }
}

customElements.define("app-editor", AppEditor);
