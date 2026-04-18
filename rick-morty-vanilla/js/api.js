/**
 * api.js — Comunicación con la API pública de Rick and Morty
 * https://rickandmortyapi.com/documentation
 *
 * Aquí solo hay funciones que hacen `fetch` y devuelven datos en JSON.
 * No hay interfaz: eso va en app.js
 */

/** URL base de todos los endpoints */
const BASE_URL = 'https://rickandmortyapi.com/api'

/**
 * Pide una página de personajes. Opcionalmente filtra por nombre y estado.
 * @param {number} page - Número de página (la API empieza en 1)
 * @param {Record<string, string>} filters - Ej: { name: 'rick', status: 'alive' }
 */
export async function getCharacters(page = 1, filters = {}) {
  // URLSearchParams convierte un objeto en ?page=1&name=rick&status=alive
  const params = new URLSearchParams({ page: String(page), ...filters })
  const res = await fetch(`${BASE_URL}/character?${params}`)
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
  return res.json()
}

/** Página de ubicaciones (planetas, dimensiones, etc.) */
export async function getLocations(page = 1) {
  const res = await fetch(`${BASE_URL}/location?page=${page}`)
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
  return res.json()
}

/** Página de episodios */
export async function getEpisodes(page = 1) {
  const res = await fetch(`${BASE_URL}/episode?page=${page}`)
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
  return res.json()
}

/**
 * Varios personajes a la vez por sus IDs (la API acepta /character/1,2,3).
 * Útil para cargar el reparto de un episodio.
 */
export async function getMultipleCharacters(ids) {
  if (!ids.length) return []
  const res = await fetch(`${BASE_URL}/character/${ids.join(',')}`)
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
  const data = await res.json()
  // Si pides un solo ID, la API devuelve un objeto; si son varios, un array
  return Array.isArray(data) ? data : [data]
}
