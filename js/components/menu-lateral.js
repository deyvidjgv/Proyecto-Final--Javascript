import { cerrarSesion } from "../auth.js";

class MenuLateral extends HTMLElement {
  connectedCallback() {
    const seccionActiva = this.getAttribute("activo");
    this.innerHTML = `
  <aside class="sidebar">
    <div class="sidebar-logo">
      <i class="ti ti-planet"></i>
      <span class="sidebar-titulo">Orbit Panel</span>
    </div>

    <nav class="sidebar-nav">
      <a href="index.html" class="nav-item" data-seccion="usuarios">
        <i class="ti ti-users"></i>
        <span>Usuarios</span>
      </a>
      <a href="productos.html" class="nav-item" data-seccion="productos">
        <i class="ti ti-package"></i>
        <span>Productos</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <a href="#" class="nav-item" id="salir">
        <i class="ti ti-logout"></i>
        <span>Salir</span>
      </a>
    </div>
  </aside>
`;

    const navItems = this.querySelectorAll(".nav-item");
    for (let i = 0; i < navItems.length; i++) {
      const seccionItem = navItems[i].getAttribute("data-seccion");
      if (seccionActiva === seccionItem) {
        navItems[i].classList.add("active");
      } else {
        navItems[i].classList.remove("active");
      }
    }

    const cerrarSesionBtn = this.querySelector("#salir");
    cerrarSesionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
}

customElements.define("menu-lateral", MenuLateral);
