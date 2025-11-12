// js/data-manager.js
class DataManager {
    constructor() {
        this.STORAGE_KEYS = {
            MAIN_DATA: 'metavoices_main_data',
            VOICE_DATA: 'metavoices_voice_data',
            SSML_DATA: 'metavoices_ssml_data',
            API_KEY: 'elevenlabs_api_key',
            VOICES_CACHE: 'elevenlabs_voices_cache'
        };
        this.API_BASE_URL = 'https://api.elevenlabs.io/v1';
    }

    // Imposta API Key
    setApiKey(apiKey) {
        localStorage.setItem(this.STORAGE_KEYS.API_KEY, apiKey);
        console.log('🔑 API Key salvata');
    }

    // Ottieni API Key
    getApiKey() {
        return localStorage.getItem(this.STORAGE_KEYS.API_KEY);
    }

    // Verifica se l'API Key è configurata
    hasApiKey() {
        return !!this.getApiKey();
    }

    // Carica le voci da ElevenLabs
    async loadVoicesFromAPI() {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API Key non configurata');
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/voices`, {
                method: 'GET',
                headers: {
                    'Xi-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Errore API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🎵 Voci caricate da ElevenLabs:', data.voices.length);
            
            // Salva in cache
            localStorage.setItem(this.STORAGE_KEYS.VOICES_CACHE, JSON.stringify({
                voices: data.voices,
                timestamp: new Date().toISOString()
            }));

            return data.voices;
        } catch (error) {
            console.error('❌ Errore caricamento voci:', error);
            throw error;
        }
    }

    // Ottieni voci (dalla cache o API)
    async getVoices(forceRefresh = false) {
        // Controlla cache
        const cache = localStorage.getItem(this.STORAGE_KEYS.VOICES_CACHE);
        if (cache && !forceRefresh) {
            const cachedData = JSON.parse(cache);
            const cacheAge = new Date() - new Date(cachedData.timestamp);
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

            if (cacheAge < CACHE_DURATION) {
                console.log('📦 Voci caricate dalla cache');
                return cachedData.voices;
            }
        }

        // Carica da API
        return await this.loadVoicesFromAPI();
    }

    // Ottieni voce specifica
    getVoice(voiceId) {
        const cache = localStorage.getItem(this.STORAGE_KEYS.VOICES_CACHE);
        if (cache) {
            const cachedData = JSON.parse(cache);
            return cachedData.voices.find(voice => voice.voice_id === voiceId);
        }
        return null;
    }

    // ... resto dei metodi esistenti ...
}