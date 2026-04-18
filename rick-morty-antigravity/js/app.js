// Configuration and State
const state = {
    activeSection: 'characters',
    filters: {
        character: { name: '', status: '', gender: '', page: 1 },
        location: { name: '' },
        episode: { name: '' }
    }
};

// DOM Elements
const sections = {
    characters: document.getElementById('characters-section'),
    locations: document.getElementById('locations-section'),
    episodes: document.getElementById('episodes-section')
};

const grids = {
    characters: document.getElementById('characters-grid'),
    locations: document.getElementById('locations-grid'),
    episodes: document.getElementById('episodes-grid'),
    modal: document.getElementById('modal-characters-grid')
};

const navLinks = document.querySelectorAll('.nav-links a');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupNavigation();
    setupFilters();
    loadCharacters();
    setupModal();
}

/**
 * Navigation logic
 */
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').replace('#', '');
            const sectionName = targetId.split('-')[0];
            
            switchSection(sectionName);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function switchSection(sectionName) {
    state.activeSection = sectionName;
    
    // Hide all sections
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    
    // Show target section
    const targetSection = sections[sectionName];
    if (targetSection) targetSection.classList.remove('hidden');
    
    // Load data if empty
    if (sectionName === 'locations' && grids.locations.children.length === 0) {
        loadLocations();
    } else if (sectionName === 'episodes' && grids.episodes.children.length === 0) {
        loadEpisodes();
    }
}

/**
 * Filter and Search logic
 */
function setupFilters() {
    // Character Filters
    document.getElementById('btn-filter-char').addEventListener('click', () => {
        state.filters.character.name = document.getElementById('char-name').value;
        state.filters.character.status = document.getElementById('char-status').value;
        state.filters.character.gender = document.getElementById('char-gender').value;
        state.filters.character.page = 1;
        loadCharacters();
    });

    // Location Search
    document.getElementById('btn-search-location').addEventListener('click', () => {
        state.filters.location.name = document.getElementById('location-name').value;
        loadLocations();
    });

    // Episode Search
    document.getElementById('btn-search-episode').addEventListener('click', () => {
        state.filters.episode.name = document.getElementById('episode-name').value;
        loadEpisodes();
    });
}

/**
 * Data Loading & Rendering
 */
async function loadCharacters() {
    showLoader(grids.characters);
    const data = await window.rickAndMortyApi.getCharacters(state.filters.character);
    renderCharacters(data.results, grids.characters);
    renderPagination(data.info);
}

async function loadLocations() {
    showLoader(grids.locations);
    const data = await window.rickAndMortyApi.getLocations(state.filters.location.name);
    renderLocations(data.results);
}

async function loadEpisodes() {
    showLoader(grids.episodes);
    const data = await window.rickAndMortyApi.getEpisodes(state.filters.episode.name);
    renderEpisodes(data.results);
}

function renderCharacters(items, container, isModal = false) {
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="error-msg">No se encontraron personajes.</p>';
        return;
    }

    items.forEach(char => {
        const charCard = document.createElement('div');
        charCard.className = 'card';
        charCard.innerHTML = `
            <img src="${char.image}" alt="${char.name}" class="card-image" loading="lazy">
            <div class="card-content">
                <h4 class="card-title">${char.name}</h4>
                <div class="card-info">
                    <p><span class="status-indicator status-${char.status}"></span> ${char.status} - ${char.species}</p>
                    <p><strong>Género:</strong> ${char.gender}</p>
                    ${!isModal ? `<p><strong>Origen:</strong> ${char.origin.name}</p>` : ''}
                </div>
            </div>
        `;
        container.appendChild(charCard);
    });
}

function renderLocations(locations) {
    grids.locations.innerHTML = '';
    if (!locations || locations.length === 0) {
        grids.locations.innerHTML = '<p class="error-msg">No se encontraron ubicaciones.</p>';
        return;
    }

    locations.forEach(loc => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.innerHTML = `
            <h4>${loc.name}</h4>
            <p><strong>Tipo:</strong> ${loc.type}</p>
            <p><strong>Dimensión:</strong> ${loc.dimension}</p>
            <p><strong>Residentes:</strong> ${loc.residents.length}</p>
        `;
        card.addEventListener('click', () => openDetailModal(loc.name, loc.type + ' - ' + loc.dimension, loc.residents));
        grids.locations.appendChild(card);
    });
}

function renderEpisodes(episodes) {
    grids.episodes.innerHTML = '';
    if (!episodes || episodes.length === 0) {
        grids.episodes.innerHTML = '<p class="error-msg">No se encontraron episodios.</p>';
        return;
    }

    episodes.forEach(ep => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.innerHTML = `
            <h4>${ep.name}</h4>
            <p><strong>Código:</strong> ${ep.episode}</p>
            <p><strong>Fecha:</strong> ${ep.air_date}</p>
            <p><strong>Personajes:</strong> ${ep.characters.length}</p>
        `;
        card.addEventListener('click', () => openDetailModal(ep.name, ep.episode + ' | ' + ep.air_date, ep.characters));
        grids.episodes.appendChild(card);
    });
}

/**
 * Pagination
 */
function renderPagination(info) {
    const container = document.getElementById('char-pagination');
    container.innerHTML = '';
    if (!info || !info.pages || info.pages <= 1) return;

    const current = state.filters.character.page;
    
    // Simple pagination: Prev, Current, Next
    if (info.prev) {
        const btn = createPageBtn('←', current - 1);
        container.appendChild(btn);
    }

    const currentBtn = createPageBtn(current, current);
    currentBtn.classList.add('active');
    container.appendChild(currentBtn);

    if (info.next) {
        const btn = createPageBtn('→', current + 1);
        container.appendChild(btn);
    }
}

function createPageBtn(text, page) {
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => {
        state.filters.character.page = page;
        loadCharacters();
        window.scrollTo(0, document.getElementById('characters-section').offsetTop - 100);
    });
    return btn;
}

/**
 * Modal Logic
 */
async function openDetailModal(title, subtitle, charUrls) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-info').innerHTML = `<p>${subtitle}</p>`;
    
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scroll
    
    showLoader(grids.modal);
    
    if (charUrls && charUrls.length > 0) {
        // Limit to 50 residents for performance in modal
        const limitedUrls = charUrls.slice(0, 50);
        const characters = await window.rickAndMortyApi.getCharactersByIds(limitedUrls);
        renderCharacters(characters, grids.modal, true);
    } else {
        grids.modal.innerHTML = '<p>No hay personajes registrados aquí.</p>';
    }
}

function setupModal() {
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Helpers
 */
function showLoader(container) {
    container.innerHTML = '<div class="loader"></div>';
}
