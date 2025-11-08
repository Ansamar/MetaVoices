/**
 * VOICE SELECTION - VERSIONE AGGIORNATA E FUNZIONANTE
 * Compatibile con le nuove API ElevenLabs
 */

class VoiceSelectionManager {
    constructor() {
        this.voices = [];
        this.currentVoice = null;
        this.init();
    }

    async init() {
        console.log('🚀 Voice Manager - Inizializzazione');
        await this.loadVoices();
        this.setupEventListeners();
        this.setupSliders();
    }

    async loadVoices() {
        console.log('📡 Caricamento voci...');
        
        const apiKey = localStorage.getItem('elevenlabs_api_key');
        
        if (!apiKey) {
            this.showError('Inserisci la API Key di ElevenLabs nelle impostazioni');
            this.loadFallbackVoices();
            return;
        }

        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                method: 'GET',
                headers: {
                    'Xi-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            this.voices = data.voices || [];
            
            console.log(`✅ Caricate ${this.voices.length} voci`);
            this.populateVoiceSelect();
            
        } catch (error) {
            console.error('❌ Errore caricamento voci:', error);
            this.showError('Errore nel caricamento delle voci');
            this.loadFallbackVoices();
        }
    }

    populateVoiceSelect() {
        const select = document.getElementById('voiceSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Seleziona una voce...</option>';

        this.voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voice_id;
            option.textContent = `${voice.name} (${voice.category || 'default'})`;
            option.dataset.voice = JSON.stringify(voice);
            select.appendChild(option);
        });

        // Seleziona la prima voce disponibile
        if (this.voices.length > 0) {
            select.value = this.voices[0].voice_id;
            this.onVoiceChange();
        }
    }

    loadFallbackVoices() {
        console.log('🔄 Caricamento voci di fallback');
        this.voices = [
            {
                voice_id: 'fallback-1',
                name: 'Alice Italiano',
                category: 'premade'
            },
            {
                voice_id: 'fallback-2',
                name: 'Luca Italiano', 
                category: 'premade'
            },
            {
                voice_id: 'fallback-3',
                name: 'Sofia Italiano',
                category: 'premade'
            }
        ];
        this.populateVoiceSelect();
    }

    setupEventListeners() {
        // Selezione voce
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', () => this.onVoiceChange());
        }

        // Test voce
        const testBtn = document.getElementById('testVoiceBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testVoice());
        }

        // Reset impostazioni
        const resetBtn = document.getElementById('resetVoiceBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        console.log('✅ Event listeners configurati');
    }

    setupSliders() {
        // Slider Pitch
        const pitchSlider = document.getElementById('pitchSlider');
        const pitchValue = document.getElementById('pitchValue');
        if (pitchSlider && pitchValue) {
            pitchSlider.addEventListener('input', () => {
                pitchValue.textContent = pitchSlider.value + ' st';
            });
        }

        // Slider Volume
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', () => {
                volumeValue.textContent = volumeSlider.value + '%';
            });
        }

        // Slider Speed
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', () => {
                speedValue.textContent = speedSlider.value + 'x';
            });
        }
    }

    onVoiceChange() {
        const voiceSelect = document.getElementById('voiceSelect');
        if (!voiceSelect || !voiceSelect.value) return;

        const voiceId = voiceSelect.value;
        const voice = this.voices.find(v => v.voice_id === voiceId);
        
        if (voice) {
            this.currentVoice = voice;
            this.updateVoiceDisplay(voice);
            console.log('🎤 Voce selezionata:', voice.name);
        }
    }

    updateVoiceDisplay(voice) {
        const nameElement = document.getElementById('currentVoiceName');
        const descElement = document.getElementById('currentVoiceDescription');
        
        if (nameElement) {
            nameElement.textContent = voice.name;
        }
        
        if (descElement) {
            let description = `Tipo: ${voice.category || 'Predefinita'}`;
            if (voice.labels) {
                if (voice.labels.accent) description += ` | Accento: ${voice.labels.accent}`;
                if (voice.labels.gender) description += ` | Genere: ${voice.labels.gender}`;
            }
            descElement.textContent = description;
        }
    }

    async testVoice() {
        console.log('🔊 Test voce...');
        
        const voiceSelect = document.getElementById('voiceSelect');
        const textInput = document.getElementById('mainTextInput');
        const testStatus = document.getElementById('testStatus');
        
        if (!voiceSelect || !voiceSelect.value) {
            this.showError('Seleziona una voce prima di testare');
            return;
        }

        const voiceId = voiceSelect.value;
        const testText = textInput?.value.trim() || "Ciao, questo è un test della sintesi vocale con ElevenLabs.";

        if (testStatus) {
            testStatus.innerHTML = '<i class="fas fa-sync fa-spin"></i> Generazione audio...';
        }

        try {
            await this.generateAudio(voiceId, testText);
            
            if (testStatus) {
                testStatus.innerHTML = '<i class="fas fa-check"></i> Test completato!';
            }
            this.showSuccess('Test voce completato');
            
        } catch (error) {
            console.error('❌ Errore test voce:', error);
            if (testStatus) {
                testStatus.innerHTML = '<i class="fas fa-times"></i> Test fallito';
            }
            this.showError('Errore nel test della voce: ' + error.message);
        }
    }

    async generateAudio(voiceId, text) {
        const apiKey = localStorage.getItem('elevenlabs_api_key');
        if (!apiKey) throw new Error('API Key non trovata');

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Xi-Api-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error ${response.status}: ${errorData.detail || response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Riproduci l'audio
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.src = audioUrl;
            await audioPlayer.play();
        }

        return audioUrl;
    }

    resetSettings() {
        document.getElementById('pitchSlider').value = 0;
        document.getElementById('volumeSlider').value = 80;
        document.getElementById('speedSlider').value = 1.0;
        
        document.getElementById('pitchValue').textContent = '0 st';
        document.getElementById('volumeValue').textContent = '80%';
        document.getElementById('speedValue').textContent = '1.0x';
        
        this.showSuccess('Impostazioni resettate');
    }

    showError(message) {
        this.showStatus(message, 'error');
    }

    showSuccess(message) {
        this.showStatus(message, 'success');
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status status-${type}`;
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status';
            }, 5000);
        }
        
        // Log in console
        if (type === 'error') {
            console.error('❌', message);
        } else {
            console.log('✅', message);
        }
    }
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    window.voiceManager = new VoiceSelectionManager();
});