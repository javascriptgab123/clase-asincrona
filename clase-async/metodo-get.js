
async function consumirApiRickMorty(nombre, estado, genero) {
    const req = await fetch('https://rickandmortyapi.com/api/character/?name=' + nombre + '&status=' + estado + '&gender=' + genero)

    if (!req.ok) {
        throw new Error('Falló petición HTTP' + req.status)
    }

    return req.json()
}

async function main() {
    try {
        const personajes = await consumirApiRickMorty('Smith', 'Alive', 'Male')
        console.log(personajes)
    } catch (error) {
        console.log('Error: ', error.message)
    }
}

main()