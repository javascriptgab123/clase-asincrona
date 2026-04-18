function obtenerUsuario(id) {
    return new Promise((resolve, reject) => {
        if (id <= 0) {
            reject(new Error("id invalido"))
            return
        }
        setTimeout(() => {
            resolve({ id, nombre: "Usuario " + id })
        }, 0)

    })
}

obtenerUsuario(1)
    .then((u) => {
        console.log("Paso 1, Then:", u)
        return u.nombre.toUpperCase()
    })
    .then((nombre) => {
        console.log('paso 2 operando con el return anterior', nombre)
    })
    .catch((e) => {
        console.log('error obteniendo el id', e.message)
    })
    .finally(() => {
        console.log("Siempre ejecutamos al último el finally(opcional)")
    })

obtenerUsuario(-1)
    .then((u) => {
        console.log('El usuario es: ', u)
    })
    .catch((e) => {
        console.log('mensaje de error: ', e.message)
    })
    .finally(() => {
        console.log('Ejecuta sin importar si hay errores o no')
    })