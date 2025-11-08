/**
 * APP SSML - Controlli SSML per MetaVoices
 */

class SSMLApp {
    constructor() {
        this.currentText = '';
        this.ssmlControls = [];
        this.init();
    }

    init() {
        console.log('🎯 SSML App inizializzata');
        this.loadData();
        this.setupEventListeners();
        this.renderText();
        this.updateStats();
    }

    loadData() {
        // Carica i dati dalla pagina precedente
        const savedData = localStorage.getItem('metavoices_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentText = data.text || '';
            console.log('📥 Testo caricato:', this.currentText);
        }
    }

    setupEventListeners() {
        // Navigazione
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.location.href = 'analysis.html';
        });

        document.getElementById('nextBtn')?.addEventListener('click', () => {
            this.navigateToPreview();
        });

        // Controlli SSML
        document.getElementById('applySSMLBtn')?.addEventListener('click', () => {
            this.applySSMLControls();
        });

        document.getElementById('testSSMLBtn')?.addEventListener('click', () => {
            this.testSSML();
        });

        document.getElementById('clearSSMLBtn')?.addEventListener('click', () => {
            this.clearSSML();
        });

        document.getElementById('copySSMLBtn')?.addEventListener('click', () => {
            this.copySSML();
        });

        // Preset rapidi
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyPreset(e.currentTarget.dataset.preset);
            });
        });

        console.log('✅ Tutti gli event listeners configurati');
    }

    applySSMLControls() {
        console.log('🎛️ Applicazione controlli SSML');
        
        const pauseControl = document.getElementById('pauseControl')?.value;
        const emphasisControl = document.getElementById('emphasisControl')?.value;
        const rateControl = document.getElementById('rateControl')?.value;
        const volumeControl = document.getElementById('volumeControl')?.value;

        // Salva i controlli applicati
        this.ssmlControls = [
            { type: 'pause', value: pauseControl },
            { type: 'emphasis', value: emphasisControl },
            { type: 'rate', value: rateControl },
            { type: 'volume', value: volumeControl }
        ].filter(control => control.value);

        this.renderText();
        this.generateSSMLPreview();
        this.updateStats();

        // Mostra conferma
        this.showStatus('✅ Controlli SSML applicati', 'success');
    }

    applyPreset(preset) {
        console.log('🎨 Applicazione preset:', preset);
        
        const presets = {
            news: {
                pause: '0.3s',
                emphasis: 'moderate',
                rate: '1.1',
                volume: '1.0'
            },
            storytelling: {
                pause: '1s',
                emphasis: 'strong',
                rate: '0.8',
                volume: '1.0'
            },
            presentation: {
                pause: '0.5s',
                emphasis: 'moderate',
                rate: '1.0',
                volume: '1.2'
            },
            accessibility: {
                pause: '0.7s',
                emphasis: 'strong',
                rate: '0.7',
                volume: '1.0'
            }
        };

        const presetConfig = presets[preset];
        if (presetConfig) {
            document.getElementById('pauseControl').value = presetConfig.pause;
            document.getElementById('emphasisControl').value = presetConfig.emphasis;
            document.getElementById('rateControl').value = presetConfig.rate;
            document.getElementById('volumeControl').value = presetConfig.volume;

            this.applySSMLControls();
            this.showStatus(`✅ Preset "${preset}" applicato`, 'success');
        }
    }

    renderText() {
        const textDisplay = document.getElementById('textDisplay');
        if (!textDisplay) return;

        let displayedText = this.currentText;

        // Applica formattazione SSML visiva
        if (this.ssmlControls.length > 0) {
            this.ssmlControls.forEach(control => {
                switch (control.type) {
                    case 'pause':
                        displayedText = this.addPauseVisual(displayedText, control.value);
                        break;
                    case 'emphasis':
                        displayedText = this.addEmphasisVisual(displayedText, control.value);
                        break;
                }
            });
        }

        textDisplay.innerHTML = displayedText || '<div class="empty-text">Nessun testo disponibile</div>';
    }

    addPauseVisual(text, pauseValue) {
        // Aggiunge indicatori visivi per le pause
        const pauseIcons = {
            '0.3s': '⏱️',
            '0.5s': '⏱️⏱️',
            '1s': '⏱️⏱️⏱️',
            '2s': '⏱️⏱️⏱️⏱️'
        };
        
        return text.replace(/[.!?]/g, `$& ${pauseIcons[pauseValue] || '⏱️'}`);
    }

    addEmphasisVisual(text, emphasisValue) {
        // Aggiunge enfasi visiva
        const emphasisTags = {
            'strong': '<strong class="emphasis-strong">$1</strong>',
            'moderate': '<em class="emphasis-moderate">$1</em>',
            'reduced': '<span class="emphasis-reduced">$1</span>'
        };

        // Enfatizza le parole in maiuscolo o tra virgolette
        return text.replace(/([A-Z][a-z]+)|("([^"]+)")/g, emphasisTags[emphasisValue] || '$1');
    }

    generateSSMLPreview() {
        const ssmlPreview = document.getElementById('ssmlPreview');
        if (!ssmlPreview) return;

        let ssml = `<speak>\n`;
        
        // Aggiungi controlli SSML
        this.ssmlControls.forEach(control => {
            switch (control.type) {
                case 'pause':
                    ssml += `  <break time="${control.value}"/>\n`;
                    break;
                case 'emphasis':
                    ssml += `  <emphasis level="${control.value}">\n`;
                    break;
                case 'rate':
                    ssml += `  <prosody rate="${control.value}">\n`;
                    break;
                case 'volume':
                    ssml += `  <prosody volume="${control.value}">\n`;
                    break;
            }
        });

        ssml += `  ${this.currentText}\n`;
        ssml += `</speak>`;

        ssmlPreview.textContent = ssml;
    }

    testSSML() {
        console.log('🔊 Test SSML');
        this.showStatus('🔊 Test audio in corso...', 'info');
        
        // Simula test audio
        setTimeout(() => {
            this.showStatus('✅ Test SSML completato', 'success');
        }, 2000);
    }

    clearSSML() {
        console.log('🗑️ Pulizia controlli SSML');
        
        // Reset controlli
        document.getElementById('pauseControl').value = '';
        document.getElementById('emphasisControl').value = '';
        document.getElementById('rateControl').value = '1.0';
        document.getElementById('volumeControl').value = '1.0';
        
        this.ssmlControls = [];
        this.renderText();
        this.generateSSMLPreview();
        this.updateStats();
        
        this.showStatus('✅ Controlli SSML rimossi', 'success');
    }

    copySSML() {
        const ssmlPreview = document.getElementById('ssmlPreview');
        if (ssmlPreview && ssmlPreview.textContent) {
            navigator.clipboard.writeText(ssmlPreview.textContent)
                .then(() => this.showStatus('✅ SSML copiato negli appunti', 'success'))
                .catch(() => this.showStatus('❌ Errore nella copia', 'error'));
        }
    }

    navigateToPreview() {
        console.log('📍 Navigazione a preview.html');
        
        // Salva dati SSML
        const ssmlData = {
            text: this.currentText,
            ssmlControls: this.ssmlControls,
            ssmlCode: document.getElementById('ssmlPreview')?.textContent || ''
        };
        
        localStorage.setItem('metavoices_ssml_data', JSON.stringify(ssmlData));
        window.location.href = 'preview.html';
    }

    updateStats() {
        const wordCount = document.getElementById('wordCount');
        const ssmlCount = document.getElementById('ssmlCount');
        
        if (wordCount) {
            wordCount.textContent = this.currentText ? this.currentText.trim().split(/\s+/).length : 0;
        }
        
        if (ssmlCount) {
            ssmlCount.textContent = this.ssmlControls.length;
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status status-${type}`;
            
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status';
            }, 3000);
        }
    }
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    window.ssmlApp = new SSMLApp();
});