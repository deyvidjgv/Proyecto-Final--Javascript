let users = [];
let items = [];

const formulario = document.getElementById("formulario");
const URL = 'https://stock-slow-5f434-default-rtdb.firebaseio.com';

formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    const fd = new FormData(formulario);

    const datos = {
        username: fd.get('username'),
        nombre: fd.get('nombre'),
        contrasena: fd.get('contrasena')
    };
    addUser(datos.username, datos.nombre, datos.contrasena);
    console.log('Datos del formulario:', datos);
    formulario.reset();
});

const listUsers = async () => {
    const usersLS = localStorage.getItem('users');
    if (usersLS) {
        users = JSON.parse(usersLS);
    } else {
        localStorage.setItem('users', JSON.stringify([]));
    }
    return users;
};

const httpClient = (url, payload, method) => {
    return fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: payload ? JSON.stringify(payload) : undefined
    });
};

const addUser = async (username, nombre, contrasena) => {
    try {
        const res = await httpClient(`${URL}/users/${username}.json`, { username, nombre, contrasena }, "PUT");
        const data = await res.json();
        console.log(data);

        users.push({ username, nombre, contrasena });
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
    } catch (error) {
        console.error(error);
    }
};

const deleteUser = async (username) => {
    try {
        await httpClient(`${URL}/users/${username}.json`, null, "DELETE");
        users = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
    } catch (error) {
        console.error(error);
    }
};


const showUsers = async () => {
    const lista = await listUsers();
    console.log('Usuarios:', lista);
};

document.addEventListener("product-submit", (event) => {
    const item = event.detail;
    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
});

const renderTabla = (lista) => {
    const tbody = document.getElementById('cuerpoTablaUsuarios');
    const tablaVacia = document.getElementById('tablaVacia');

    tbody.innerHTML = '';
    if (lista.length === 0) {
        tablaVacia.style.display = 'flex';
        return;
    }
    tablaVacia.style.display = 'none';

    lista.forEach(user => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${user.username}</td>
            <td>${user.nombre}</td>
            <td>
                <button class="btn-accion" data-username="${user.username}">
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

document.getElementById('buscadorUsuarios').addEventListener('input', async (e) => {
    const termino = e.target.value.toLowerCase();
    const lista = await listUsers();

    const filtrada = lista.filter(user =>
        user.username.toLowerCase().includes(termino) ||
        user.nombre.toLowerCase().includes(termino)
    );
    renderTabla(filtrada);
});

document.getElementById('cuerpoTablaUsuarios').addEventListener('click', async (e) => {
    const boton = e.target.closest('.btn-accion');
    if (!boton) return;

    const username = boton.dataset.username;
    await deleteUser(username);
});



showUsers();
renderUsers();

// Obtener elementos
const tbody = document.getElementById('cuerpoTablaUsuarios');
const btnCerrar = document.getElementById('cerrarVentana');
const modal = document.getElementById('miModal');

// Abrir ventana
tbody.addEventListener('click', (event) => {
    const botonEditar = event.target.closest('.btn-editar');
    if (botonEditar) {
        const usernameParaEditar = botonEditar.getAttribute('data-edit');
        const user = users.find(u => u.username === usernameParaEditar);
 
        if (user) {
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editNombre').value = user.nombre;
            document.getElementById('editPassword').value = user.contrasena;
        }
 
        modal.style.display = 'flex';
    }
});

// Cerrar ventana haciendo clic en la 'X'
btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Cerrar ventana haciendo clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
