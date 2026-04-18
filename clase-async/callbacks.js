function descarga(callback) {
    console.log("Recibiendo datos...")

    setTimeout(() => {
        if (Math.random() > 0.5) {
            callback(null, { mensaje: "Datos descargados..." })
        } else {
            callback({ mensaje: "Error al descargar" })
        }
    }, 1000)
}

descarga((error, datos) => {
    if (error) {
        console.log(error)
    } else {
        console.log(datos)
    }
})

console.log("Esta línea es código sincrono y no se afecta por la ejecución de la parte de arriba")