async function main() {
    const nuevoPost = {
        title: 'Mi nuevo post',
        body: 'Texto para probar el método post de fetch',
        userId: 2
    }

    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPost)
    })

    console.log('status:', res.status)
    const data = await res.json();
    console.log('respuesta:' + data.body)

}

main()
    .catch((e) => {
        console.log('Error: ', e)
    })