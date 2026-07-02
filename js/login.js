const URL = "https://stock-slow-5f434-default-rtdb.firebaseio.com";

const formulario = document.getElementById("formularioLogin");


formulario.addEventListener("submit",async (event) => {
    event.preventDefault();

    const id = document.getElementById("username").value; 
    const contrasena = document.getElementById("contrasena").value; 

    const user = await formularioLogin(id);

    if (user != null){
        if (contrasena === user.contrasena){
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "index.html";
        }
        else{
            document.getElementById("mensajeError").textContent = "Contraseña incorrecta";
        }
    }

    if(contrasena === ""){
        document.getElementById("mensajeError").textContent = "Ingrese una contraseña";
    } else if (user == null){
        document.getElementById("mensajeError").textContent = "Usuario no encontrado";
    }

    
});

async function formularioLogin(username ) {
    
    const res = await fetch(`${URL}/users/${username}.json`);
    return await res.json();
}

