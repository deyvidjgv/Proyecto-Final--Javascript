export function verificar() {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "login.html";
  }
}

export function cerrarSesion() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

export function regresar() {
  const user = localStorage.getItem("user");
  if (user) {
    window.location.href = "index.html";
  }
}
