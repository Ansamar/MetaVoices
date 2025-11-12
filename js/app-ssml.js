// ssml.js - CORRETTO con API ElevenLabs per SSML
class SSMLManager {
    constructor() {
        this.selectedText = '';
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.isPlaying = false;
        this.currentAudio = null;
        this.init();
    }

    init() {
        this.loadElements();
        this.setupEventListeners();
        this.loadTextFromStorage();
        this.updateCounters();
        console.log('✅ SSML Manager inizializzato');
    }

    loadElements() {
        this.elements = {
            textArea: document.getElementById('textArea'),
            ssmlControls: document.getElementById('ssmlControls'),
            presetControls: document.getElementById('presetControls'),
            applyFilter: document.getElementById('applyFilter'),
            playText: document.getElementById('playText'),
            stopPlayback: document.getElementById('stopPlayback'),
            nextPage: document.getElementById('nextPage'),
            playbackStatus: document.getElementById('playbackStatus'),
            statusText: document.getElementById('statusText'),
            selectionInfo: document.getElementById('selectionInfo'),
            charCount: document.getElementById('charCount'),
            ssmlTagsCount: document.getElementById('ssmlTagsCount')
        };
    }

    setupEventListeners() {
        // Selezione testo
        this.elements.textArea.addEventListener('mouseup', () => this.handleTextSelection());
        this.elements.textArea.addEventListener('keyup', () => this.handleTextSelection());

        // Applicazione filtri
        this.elements.applyFilter.addEventListener('click', () => this.applySSMLFilter());

        // Riproduzione audio con ElevenLabs
        this.elements.playText.addEventListener('click', () => this.playWithElevenLabs());

        // Ferma riproduzione
        this.elements.stopPlayback.addEventListener('click', () => this.stopPlayback());

        // Navigazione
        this.elements.nextPage.addEventListener('click', () => this.goToPreview());

        // Cambiamento controlli
        this.elements.ssmlControls.addEventListener('change', () => this.updateSelectionInfo());
        this.elements.presetControls.addEventListener('change', () => this.updateSelectionInfo());
    }

    loadTextFromStorage() {
        const storedText = localStorage.getItem('Testo per Controlli SSML');
        
        if (storedText) {
            this.elements.textArea.value = storedText;
            console.log('✅ Testo caricato dal localStorage:', storedText.substring(0, 50) + '...');
        } else {
            this.elements.textArea.value = "Nessun testo disponibile. Torna alla pagina precedente per inserire il testo.";
            console.warn('❌ Nessun testo trovato nel localStorage');
        }
    }

    handleTextSelection() {
        const textArea = this.elements.textArea;
        const selectionInfo = this.elements.selectionInfo;
        
        this.selectionStart = textArea.selectionStart;
        this.selectionEnd = textArea.selectionEnd;
        
        if (this.selectionStart !== this.selectionEnd) {
            this.selectedText = textArea.value.substring(this.selectionStart, this.selectionEnd);
            selectionInfo.textContent = `Testo selezionato: "${this.selectedText}"`;
            selectionInfo.style.display = 'block';
            
            textArea.focus();
            textArea.setSelectionRange(this.selectionStart, this.selectionEnd);
        } else {
            this.selectedText = '';
            selectionInfo.style.display = 'none';
        }
    }

    updateSelectionInfo() {
        if (!this.selectedText) return;

        const ssmlControl = this.elements.ssmlControls.value;
        const presetControl = this.elements.presetControls.value;
        
        let action = '';
        if (ssmlControl) {
            action = `Applicherà: ${this.elements.ssmlControls.options[this.elements.ssmlControls.selectedIndex].textContent}`;
        } else if (presetControl) {
            action = `Applicherà: ${this.elements.presetControls.options[this.elements.presetControls.selectedIndex].textContent}`;
        }
        
        if (action) {
            this.elements.selectionInfo.textContent = `Selezionato: "${this.selectedText}" - ${action}`;
        }
    }

    // Mappa dei controlli SSML
    ssmlMap = {
        'break': '<break time="500ms"/>',
        'emphasis': '<emphasis level="moderate">SELECTED_TEXT</emphasis>',
        'prosody': '<prosody rate="medium" pitch="medium">SELECTED_TEXT</prosody>',
        'say-as': '<say-as interpret-as="characters">SELECTED_TEXT</say-as>',
        'phoneme': '<phoneme alphabet="ipa" ph="SELECTED_TEXT">SELECTED_TEXT</phoneme>'
    };

    // Mappa dei preset rapidi
    presetMap = {
        'pause-short': '<break time="1s"/>',
        'pause-medium': '<break time="2s"/>',
        'emphasis-strong': '<emphasis level="strong">SELECTED_TEXT</emphasis>',
        'emphasis-moderate': '<emphasis level="moderate">SELECTED_TEXT</emphasis>',
        'slow-speech': '<prosody rate="slow">SELECTED_TEXT</prosody>'
    };

    applySSMLFilter() {
        const textArea = this.elements.textArea;
        const selectionInfo = this.elements.selectionInfo;
        
        if (!this.selectedText) {
            this.showStatus('❌ Seleziona prima una parte del testo!', 'error');
            return;
        }
        
        let ssmlTag = '';
        
        // Controlla se è stato selezionato un controllo SSML
        const ssmlControl = this.elements.ssmlControls.value;
        if (ssmlControl) {
            ssmlTag = this.ssmlMap[ssmlControl];
        }
        
        // Se non è stato selezionato un controllo SSML, controlla i preset
        if (!ssmlTag) {
            const presetControl = this.elements.presetControls.value;
            if (presetControl) {
                ssmlTag = this.presetMap[presetControl];
            }
        }
        
        if (!ssmlTag) {
            this.showStatus('❌ Seleziona un controllo SSML o un preset rapido!', 'error');
            return;
        }
        
        // Sostituisce il testo selezionato con il tag SSML
        const beforeText = textArea.value.substring(0, this.selectionStart);
        const afterText = textArea.value.substring(this.selectionEnd);
        const newText = ssmlTag.replace(/SELECTED_TEXT/g, this.selectedText);
        
        textArea.value = beforeText + newText + afterText;
        
        // SALVA IMMEDIATAMENTE IL TESTO CORRETTO
        this.saveCorrectedText();
        
        // Aggiorna i contatori
        this.updateCounters();
        
        // Reimposta la selezione
        this.selectedText = '';
        selectionInfo.style.display = 'none';
        
        // Reimposta i dropdown
        this.elements.ssmlControls.selectedIndex = 0;
        this.elements.presetControls.selectedIndex = 0;
        
        this.showStatus('✅ Filtro SSML applicato correttamente', 'success');
    }

    // SALVA IL TESTO CORRETTO CON CHIAVE SPECIFICA
    saveCorrectedText() {
        const correctedText = this.elements.textArea.value;
        
        // Salva con la chiave specifica per il testo corretto
        localStorage.setItem('TestoCorrettoSSML', correctedText);
        
        // Salva anche con la chiave originale per compatibilità
        localStorage.setItem('Testo per Controlli SSML', correctedText);
        localStorage.setItem('metavoices_text_input', correctedText);
        
        console.log('💾 Testo corretto salvato:', correctedText.substring(0, 50) + '...');
    }

    // RIPRODUZIONE CON API ELEVENLABS (SUPPORTA SSML)
    async playWithElevenLabs() {
        const textToPlay = this.elements.textArea.value;
        
        if (!textToPlay || textToPlay === "Nessun testo disponibile. Torna alla pagina precedente per inserire il testo.") {
            this.showStatus('❌ Non c\'è testo da riprodurre!', 'error');
            return;
        }

        // Recupera i dati dalla pagina precedente
        const voiceData = JSON.parse(localStorage.getItem('metavoices_data') || '{}');
        const apiKey = localStorage.getItem('elevenlabs_api_key');

        if (!voiceData.voiceId || !apiKey) {
            this.showStatus('❌ Dati voce non trovati. Torna alla pagina precedente.', 'error');
            return;
        }

        // Ferma eventuale riproduzione in corso
        if (this.isPlaying && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        this.showStatus('🎵 Generazione audio con ElevenLabs...', 'loading');
        this.elements.playText.style.display = 'none';
        this.elements.stopPlayback.style.display = 'flex';

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceData.voiceId}`, {
                method: 'POST',
                headers: {
                    'Xi-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: textToPlay,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.8,
                        style: 0.2,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.detail?.message || 'Unknown error'}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Crea e riproduci l'audio
            this.currentAudio = new Audio(audioUrl);
            this.isPlaying = true;
            
            this.currentAudio.onloadeddata = () => {
                this.showStatus('🔊 Riproduzione in corso...', 'loading');
                this.currentAudio.play();
            };

            this.currentAudio.onended = () => {
                this.isPlaying = false;
                this.elements.playText.style.display = 'flex';
                this.elements.stopPlayback.style.display = 'none';
                this.showStatus('✅ Riproduzione completata con effetti SSML', 'success');
                URL.revokeObjectURL(audioUrl);
            };

            this.currentAudio.onerror = (error) => {
                this.isPlaying = false;
                this.elements.playText.style.display = 'flex';
                this.elements.stopPlayback.style.display = 'none';
                this.showStatus('❌ Errore nella riproduzione audio', 'error');
                console.error('Audio error:', error);
                URL.revokeObjectURL(audioUrl);
            };

        } catch (error) {
            console.error('❌ Errore chiamata ElevenLabs:', error);
            this.isPlaying = false;
            this.elements.playText.style.display = 'flex';
            this.elements.stopPlayback.style.display = 'none';
            this.showStatus(`❌ Errore: ${error.message}`, 'error');
        }
    }

    stopPlayback() {
        if (this.currentAudio && this.isPlaying) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.isPlaying = false;
            this.elements.playText.style.display = 'flex';
            this.elements.stopPlayback.style.display = 'none';
            this.showStatus('⏹️ Riproduzione interrotta', 'info');
        }
    }

    updateCounters() {
        const text = this.elements.textArea.value;
        const characters = text.length;
        
        // Conta i tag SSML approssimativamente
        const ssmlTags = (text.match(/<[^>]+>/g) || []).length;
        
        this.elements.charCount.textContent = characters;
        this.elements.ssmlTagsCount.textContent = ssmlTags;
    }

    goToPreview() {
        // SALVA DEFINITIVAMENTE IL TESTO CORRETTO PRIMA DI ANDARE AVANTI
        this.saveCorrectedText();
        
        // Verifica che il testo sia stato salvato
        const savedText = localStorage.getItem('TestoCorrettoSSML');
        if (!savedText) {
            this.showStatus('❌ Errore nel salvataggio del testo corretto', 'error');
            return;
        }
        
        console.log('✅ Testo corretto salvato per preview:', savedText.substring(0, 50) + '...');
        this.showStatus('✅ Testo salvato, redirect a preview...', 'success');
        
        setTimeout(() => {
            window.location.href = 'preview.html';
        }, 500);
    }

    showStatus(message, type = 'info') {
        this.elements.statusText.textContent = message;
        this.elements.playbackStatus.className = `playback-status status-${type}`;
        this.elements.playbackStatus.style.display = 'block';
        
        if (type !== 'loading') {
            setTimeout(() => {
                this.elements.statusText.textContent = 'Pronto';
                this.elements.playbackStatus.className = 'playback-status';
            }, 4000);
        }
    }
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    window.ssmlManager = new SSMLManager();
});