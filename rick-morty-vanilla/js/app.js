/**
 * app.js — Lógica de la aplicación (estado, pintar HTML, eventos)
 *
 * Flujo típico:
 * 1. Guardamos datos en un objeto `state`.
 * 2. `render()` construye un string HTML y lo mete en #app.
 * 3. Después de pintar, `bindEvents()` conecta botones e inputs.
 * 4. `loadData()` pide datos a api.js y vuelve a llamar a render().
 */

import {
  getCharacters,
  getLocations,
  getEpisodes,
  getMultipleCharacters,
} from './api.js'

// --- Estado global (una “foto” de lo que muestra la app en este momento) ---
const state = {
  tab: 'characters', // 'characters' | 'locations' | 'episodes'
  page: 1,
  search: '',
  statusFilter: '',
  loading: false,
  characters: null,
  locations: null,
  episodes: null,
  // Modal de personaje
  modal: null,
  modalType: null, // 'character' | 'episode' | null
  episodeCharacters: [],
  selectedEpisode: null,
}

const app = document.getElementById('app')

/** Evita inyectar HTML peligroso si un nombre viniera raro (buena costumbre) */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function statusBadge(status) {
  const cls =
    status === 'Alive' ? 'alive' : status === 'Dead' ? 'dead' : 'unknown'
  const label = escapeHtml(status)
  return `<span class="badge-status"><span class="badge-dot ${cls}"></span>${label}</span>`
}

function renderHeader() {
  const tabs = [
    { id: 'characters', label: 'Personajes', icon: '👽' },
    { id: 'locations', label: 'Ubicaciones', icon: '🌍' },
    { id: 'episodes', label: 'Episodios', icon: '📺' },
  ]
  return `
    <header class="site-header">
      <div class="container header-inner">
        <div class="brand">
          <span class="brand-icon" aria-hidden="true">🛸</span>
          <h1 class="brand-title">Rick & Morty Explorer</h1>
        </div>
        <nav class="nav-tabs" aria-label="Secciones">
          ${tabs
            .map(
              (t) => `
            <button type="button" data-tab="${t.id}" class="nav-tab ${state.tab === t.id ? 'is-active' : ''}">
              <span class="mr">${t.icon}</span>${t.label}
            </button>
          `
            )
            .join('')}
        </nav>
      </div>
    </header>`
}

function renderFilters() {
  if (state.tab !== 'characters') return ''
  const s = escapeHtml(state.search)
  return `
    <div class="filters">
      <div class="search-wrap">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input id="search-input" class="input" type="search" placeholder="Buscar personaje..." value="${s}" autocomplete="off" />
      </div>
      <select id="status-filter" class="select" aria-label="Filtrar por estado">
        <option value="" ${state.statusFilter === '' ? 'selected' : ''}>Todos los estados</option>
        <option value="alive" ${state.statusFilter === 'alive' ? 'selected' : ''}>🟢 Vivo</option>
        <option value="dead" ${state.statusFilter === 'dead' ? 'selected' : ''}>🔴 Muerto</option>
        <option value="unknown" ${state.statusFilter === 'unknown' ? 'selected' : ''}>⚪ Desconocido</option>
      </select>
    </div>`
}

function renderCharacters() {
  if (!state.characters) return ''
  return `
    <div class="grid-chars">
      ${state.characters.results
        .map((c) => {
          const name = escapeHtml(c.name)
          const species = escapeHtml(c.species)
          const typeExtra = c.type ? ` — ${escapeHtml(c.type)}` : ''
          const loc = escapeHtml(c.location.name)
          return `
        <button type="button" class="card-char" data-character-id="${c.id}">
          <div class="card-char-img-wrap">
            <img src="${escapeHtml(c.image)}" alt="${name}" loading="lazy" width="300" height="300" />
            <div class="card-char-overlay" aria-hidden="true"></div>
            <div class="badge-wrap">${statusBadge(c.status)}</div>
          </div>
          <div class="card-char-body">
            <h3>${name}</h3>
            <p class="meta">${species}${typeExtra}</p>
            <p class="loc">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>${loc}</span>
            </p>
          </div>
        </button>`
        })
        .join('')}
    </div>`
}

function renderLocations() {
  if (!state.locations) return ''
  return `
    <div class="grid-locs">
      ${state.locations.results
        .map((l) => {
          const typeLabel = escapeHtml(l.type || 'Desconocido')
          const dim = escapeHtml(l.dimension || 'Dimensión desconocida')
          return `
        <div class="card-loc">
          <div class="card-loc-head">
            <span class="emoji" aria-hidden="true">🌍</span>
            <span class="tag-type">${typeLabel}</span>
          </div>
          <h3>${escapeHtml(l.name)}</h3>
          <p class="sub">${dim}</p>
          <p class="card-foot">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${l.residents.length} residentes</span>
          </p>
        </div>`
        })
        .join('')}
    </div>`
}

function renderEpisodes() {
  if (!state.episodes) return ''
  return `
    <div class="grid-eps">
      ${state.episodes.results
        .map((e) => {
          const code = escapeHtml(e.episode)
          const ad = escapeHtml(e.air_date)
          return `
        <button type="button" class="card-ep" data-episode-id="${e.id}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
            <span class="ep-code">${code}</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${ad}</span>
          </div>
          <h3>${escapeHtml(e.name)}</h3>
          <p class="card-foot">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${e.characters.length} personajes</span>
          </p>
        </button>`
        })
        .join('')}
    </div>`
}

function renderPagination(info) {
  if (!info || info.pages <= 1) return ''
  const maxVisible = 5
  let start = Math.max(1, state.page - Math.floor(maxVisible / 2))
  const end = Math.min(info.pages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)

  return `
    <div class="pagination">
      <button type="button" class="page-btn" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''} aria-label="Página anterior">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      ${pages
        .map(
          (p) => `
        <button type="button" class="page-num ${p === state.page ? 'is-current' : ''}" data-page="${p}">${p}</button>
      `
        )
        .join('')}
      <button type="button" class="page-btn" data-page="${state.page + 1}" ${state.page === info.pages ? 'disabled' : ''} aria-label="Página siguiente">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>`
}

function renderStats() {
  const data =
    state.tab === 'characters'
      ? state.characters
      : state.tab === 'locations'
        ? state.locations
        : state.episodes
  if (!data) return ''
  return `
    <div class="stats">
      <p>
        <strong>${data.info.count}</strong> resultados encontrados
        — Página <strong>${state.page}</strong> de <strong>${data.info.pages}</strong>
      </p>
    </div>`
}

function renderLoading() {
  return `
    <div class="state-center">
      <div class="spinner" role="status" aria-label="Cargando"></div>
      <p>Cargando datos del multiverso...</p>
    </div>`
}

function renderError() {
  return `
    <div class="state-center">
      <span class="error-emoji" aria-hidden="true">😵</span>
      <h3 style="margin:0 0 0.5rem;font-size:1.25rem;color:#d1d5db;">No se encontraron resultados</h3>
      <p style="margin:0;font-size:0.875rem;color:var(--text-muted);">Intenta con otra búsqueda o filtro diferente</p>
    </div>`
}

function renderCharacterModal() {
  if (state.modalType !== 'character' || !state.modal) return ''
  const c = state.modal
  const name = escapeHtml(c.name)
  return `
    <div id="modal-backdrop" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-char-title">
      <div class="modal-panel">
        <div class="modal-hero">
          <img src="${escapeHtml(c.image)}" alt="" />
          <button type="button" id="close-modal" class="modal-close" aria-label="Cerrar">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div class="modal-badge">${statusBadge(c.status)}</div>
        </div>
        <div class="modal-body">
          <h2 id="modal-char-title">${name}</h2>
          <div class="grid-details">
            <div class="detail-box"><p class="label">Especie</p><p class="value">${escapeHtml(c.species)}</p></div>
            <div class="detail-box"><p class="label">Género</p><p class="value">${escapeHtml(c.gender)}</p></div>
            <div class="detail-box"><p class="label">Origen</p><p class="value">${escapeHtml(c.origin.name)}</p></div>
            <div class="detail-box"><p class="label">Ubicación</p><p class="value">${escapeHtml(c.location.name)}</p></div>
          </div>
          <div class="detail-full">
            <p class="label">Aparece en</p>
            <p class="value" style="color:var(--portal);">${c.episode.length} episodios</p>
          </div>
        </div>
      </div>
    </div>`
}

function renderEpisodeModal() {
  if (state.modalType !== 'episode' || !state.selectedEpisode) return ''
  const e = state.selectedEpisode
  const castHtml =
    state.episodeCharacters.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.875rem;">Cargando personajes...</p>'
      : `<div class="grid-cast">
          ${state.episodeCharacters
            .map((c) => {
              return `
            <div class="cast-item">
              <img src="${escapeHtml(c.image)}" alt="" width="40" height="40" />
              <div style="min-width:0;">
                <p class="name">${escapeHtml(c.name)}</p>
                <p class="st">${escapeHtml(c.status)}</p>
              </div>
            </div>`
            })
            .join('')}
        </div>`

  return `
    <div id="modal-backdrop" class="modal-backdrop modal-top" role="dialog" aria-modal="true" aria-labelledby="modal-ep-title">
      <div class="modal-panel wide">
        <div class="modal-ep-header">
          <div>
            <span class="ep-code">${escapeHtml(e.episode)}</span>
            <h2 id="modal-ep-title" style="margin-top:0.75rem;">${escapeHtml(e.name)}</h2>
            <p style="margin:0.25rem 0 0;font-size:0.875rem;color:var(--text-muted);">${escapeHtml(e.air_date)}</p>
          </div>
          <button type="button" id="close-modal" class="modal-close" aria-label="Cerrar">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-ep-list">
          <h3>Personajes (${state.episodeCharacters.length})</h3>
          ${castHtml}
        </div>
      </div>
    </div>`
}

/**
 * Pinta toda la página: lee `state` y escribe HTML dentro de #app.
 * Cada vez que cambia algo importante, volvemos a llamar a render().
 */
function render() {
  const content = state.loading
    ? renderLoading()
    : state.tab === 'characters' &&
        (!state.characters || state.characters.results.length === 0)
      ? renderError()
      : state.tab === 'characters'
        ? renderCharacters()
        : state.tab === 'locations'
          ? renderLocations()
          : renderEpisodes()

  const info =
    state.tab === 'characters'
      ? state.characters?.info
      : state.tab === 'locations'
        ? state.locations?.info
        : state.episodes?.info

  app.innerHTML = `
    ${renderHeader()}
    <main>
      <div class="container">
        ${renderFilters()}
        ${!state.loading ? renderStats() : ''}
        ${content}
        ${!state.loading ? renderPagination(info) : ''}
      </div>
    </main>
    <footer class="site-footer">
      <div class="container">
        Datos de <a href="https://rickandmortyapi.com" target="_blank" rel="noopener noreferrer">rickandmortyapi.com</a>
        — JavaScript vanilla (sin framework)
      </div>
    </footer>
    ${renderCharacterModal()}
    ${renderEpisodeModal()}
  `

  bindEvents()
}

// Retraso al escribir en el buscador (evita llamar a la API en cada tecla)
let searchTimeout

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tab = btn.getAttribute('data-tab')
      state.page = 1
      state.search = ''
      state.statusFilter = ''
      loadData()
    })
  })

  const searchInput = document.getElementById('search-input')
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout)
      // Esperamos 400 ms después de que el usuario deje de escribir
      searchTimeout = setTimeout(() => {
        state.search = searchInput.value.trim()
        state.page = 1
        loadData()
      }, 400)
    })
  }

  const statusSelect = document.getElementById('status-filter')
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      state.statusFilter = statusSelect.value
      state.page = 1
      loadData()
    })
  }

  document.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = Number(btn.getAttribute('data-page'))
      if (!Number.isNaN(page) && page >= 1) {
        state.page = page
        loadData()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  })

  document.querySelectorAll('[data-character-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-character-id'))
      const char = state.characters?.results.find((c) => c.id === id)
      if (char) {
        state.modal = char
        state.modalType = 'character'
        render()
      }
    })
  })

  document.querySelectorAll('[data-episode-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.getAttribute('data-episode-id'))
      const ep = state.episodes?.results.find((e) => e.id === id)
      if (ep) {
        state.selectedEpisode = ep
        state.episodeCharacters = []
        state.modalType = 'episode'
        render()
        // URLs tipo .../character/5 → sacamos el ID del final
        const charIds = ep.characters.map((url) => Number(url.split('/').pop()))
        try {
          state.episodeCharacters = await getMultipleCharacters(charIds)
        } catch {
          state.episodeCharacters = []
        }
        render()
      }
    })
  })

  const modalBackdrop = document.getElementById('modal-backdrop')
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (ev) => {
      if (ev.target === modalBackdrop) closeModal()
    })
  }

  const closeBtn = document.getElementById('close-modal')
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal)
  }
}

function closeModal() {
  state.modal = null
  state.selectedEpisode = null
  state.episodeCharacters = []
  state.modalType = null
  render()
}

/** Pide datos según la pestaña activa y actualiza state */
async function loadData() {
  state.loading = true
  render()

  try {
    const filters = {}
    if (state.search) filters.name = state.search
    if (state.statusFilter) filters.status = state.statusFilter

    if (state.tab === 'characters') {
      state.characters = await getCharacters(state.page, filters)
    } else if (state.tab === 'locations') {
      state.locations = await getLocations(state.page)
    } else {
      state.episodes = await getEpisodes(state.page)
    }
  } catch {
    if (state.tab === 'characters') state.characters = null
    else if (state.tab === 'locations') state.locations = null
    else state.episodes = null
  }

  state.loading = false
  render()
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.modalType) closeModal()
})

loadData()
