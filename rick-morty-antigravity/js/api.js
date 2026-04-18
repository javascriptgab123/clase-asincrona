const BASE_URL = 'https://rickandmortyapi.com/api';

const api = {
    /**
     * Fetch characters with optional filters
     * @param {Object} filters { name, status, gender, page }
     */
    async getCharacters(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`${BASE_URL}/character?${query}`);
        if (!response.ok) return { results: [], info: {} };
        return await response.json();
    },

    /**
     * Fetch locations by name
     * @param {string} name 
     */
    async getLocations(name = '') {
        const response = await fetch(`${BASE_URL}/location?name=${name}`);
        if (!response.ok) return { results: [], info: {} };
        return await response.json();
    },

    /**
     * Fetch episodes by name
     * @param {string} name 
     */
    async getEpisodes(name = '') {
        const response = await fetch(`${BASE_URL}/episode?name=${name}`);
        if (!response.ok) return { results: [], info: {} };
        return await response.json();
    },

    /**
     * Fetch multiple characters given an array of URLs or IDs
     * The API allows fetching multiple IDs with /character/[1,2,3]
     * @param {Array} urls 
     */
    async getCharactersByIds(urls) {
        if (!urls || urls.length === 0) return [];
        
        // Extract IDs from URLs
        const ids = urls.map(url => url.split('/').pop()).join(',');
        const response = await fetch(`${BASE_URL}/character/${ids}`);
        
        if (!response.ok) return [];
        
        const data = await response.json();
        // If only one ID is requested, the API returns an object, not an array
        return Array.isArray(data) ? data : [data];
    }
};

// Export to window if needed or just use globally as we are in vanilla
window.rickAndMortyApi = api;
