const jsonSopa = '{"plato": "Sancocho"}'

const sopaEnJs = JSON.parse(jsonSopa)

console.log(sopaEnJs)

const orden = {
    plato: "Pollo Asado",
    sobremesa: "Jugo Hit Mora"
}

console.log(orden)

const peticionOrden = JSON.stringify(orden)

console.log(peticionOrden)
