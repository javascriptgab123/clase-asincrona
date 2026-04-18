function fibonacci(n) {
    if (n === 0) return 0
    if (n === 1) return 1
    let anterior = 0
    let actual = 1
    for (let i = 2; i < n; i++) {
        const siguiente = anterior + actual
        anterior = actual
        actual = siguiente
    }
    return actual
}
function funcionEjemplo(param) {

    return new Promise((resolve, reject) => {
        //codigo asincrono
        let i = 1
        if (!i) {
            reject(new Error("i es 0"))
            return
        }

        resolve(i)
    })


}
function fibonacciAsincrono(n) {


    return new Promise((resolve, reject) => {
        if (!Number.isInteger(n) || n < 0) {
            reject(new Error('n debe ser un numero entero >= 0'))
            return
        }

        setTimeout(() => {
            const resultado = fibonacci(n)
            resolve(resultado)
        }, 0)
    })
}

const promesaFibonacci = fibonacciAsincrono(-1)

promesaFibonacci
    .then((valor) => console.log('fibonacci asincrono: ', valor))
    .catch((err) => console.log('Hubo un error al calcular fibonacci: ', err.message))

