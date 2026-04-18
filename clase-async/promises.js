const exito = new Promise((resolve) => {

    // Código y operaciones que se ejectuan de manera asíncrona
    setTimeout(() => {
        resolve({ id: 1, nombre: "Ana" })
    }, 1000)

})

const fallo = new Promise((_, reject) => {
    setTimeout(() => {
        console.log(new Error("Algo salió mal en la ejecución"))
    }, 1000)
})

exito.then((dato) => {
    console.log(dato)
})
fallo.catch((e) => { console.log('Rejected: ', e.message) })