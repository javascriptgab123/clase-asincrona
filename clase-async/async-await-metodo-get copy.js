
async function cargarUsuario(id) {
    const req = await fetch('https://jsonplaceholder.typicode.com/users/' + id)

    if (!req.ok) {
        throw new Error('Falló petición HTTP' + req.status)
    }

    return req.json()
}

async function main() {
    try {
        const usuario = await cargarUsuario(2)
        console.log(usuario)
        console.log(usuario.username)
    } catch (error) {
        console.log('Error: ', error.message)
    }
}

main()