/**
 * MetaVoices SPA - Applicazione principale
 * Versione 3.0 - Architettura modulare
 */

// ===== IMPORT DEI MODULI =====
import { AppState } from './core/AppState.js';
import { EventManager } from './core/EventManager.js';
import { UIManager } from './modules/UIManager.js';
import { TextAnalyzer } from './modules/TextAnalyzer.js';
import { VoiceManager } from './modules/VoiceManager.js';
import { AudioPlayer } from './modules/AudioPlayer.js';
import { SSMLManager } from './modules/SSMLManager.js';
import { FileHandler } from './modules/FileHandler.js';

class MetaVoicesApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.currentTab = 'editor';
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inizializzazione MetaVoices SPA (Architettura Modulare)...');
            
            // Carica i moduli
            await this.loadModules();
            
            // Inizializza i moduli
            await this.initializeModules();
            
            // Setup iniziale
            this.setupApplication();
            
            this.isInitialized = true;
            console.log('✅ MetaVoices SPA inizializzata con successo');
            this.modules.ui.showStatus('Applicazione pronta', 'success');
            
        } catch (error) {
            console.error('❌ Errore inizializzazione app:', error);
            this.showError('Errore inizializzazione: ' + error.message);
        }
    }

    async loadModules() {
        // Caricamento moduli core
        this.modules.state = new AppState();
        this.modules.events = new EventManager();
        
        // Caricamento moduli funzionali
        this.modules.ui = new UIManager(this.modules.state, this.modules.events);
        this.modules.textAnalyzer = new TextAnalyzer(this.modules.state, this.modules.events);
        this.modules.voiceManager = new VoiceManager(this.modules.state, this.modules.events);
        this.modules.audioPlayer = new AudioPlayer(this.modules.state, this.modules.events);
        this.modules.ssmlManager = new SSMLManager(this.modules.state, this.modules.events);
        this.modules.fileHandler = new FileHandler(this.modules.state, this.modules.events);
    }

    async initializeModules() {
        // Inizializza nell'ordine corretto
        await this.modules.state.init();
        await this.modules.ui.init();
        await this.modules.voiceManager.init();
        await this.modules.textAnalyzer.init();
        await this.modules.audioPlayer.init();
        await this.modules.ssmlManager.init();
        await this.modules.fileHandler.init();
        
        // Setup eventi cross-modulo
        this.setupCrossModuleEvents();
    }

    setupApplication() {
        // Setup iniziale dell'applicazione
        this.modules.ui.switchTab('editor');
        this.setupGlobalEventHandlers();
        this.setupAutoSave();
    }

    setupCrossModuleEvents() {
        // Quando il testo cambia, aggiorna l'analisi
        this.modules.events.on('textChanged', (text) => {
            this.modules.ui.updateTextStats();
            if (this.modules.state.autoCorrectEnabled) {
                this.modules.textAnalyzer.scheduleAutoAnalysis(text);
            }
        });

        // Quando una voce è selezionata, aggiorna l'UI
        this.modules.events.on('voiceSelected', (voice) => {
            this.modules.ui.updateVoiceDisplay(voice);
        });

        // Quando l'analisi è completata, aggiorna l'UI
        this.modules.events.on('analysisComplete', (ambiguities) => {
            this.modules.ui.displayAnalysisResults(ambiguities);
        });

        // Gestione errori
        this.modules.events.on('analysisError', (error) => {
            this.modules.ui.showStatus('Errore analisi testo: ' + error.message, 'error');
        });

        // Quando le correzioni sono applicate
        this.modules.events.on('correctionsApplied', (corrections) => {
            this.modules.ui.showCorrectionToast(corrections);
            this.modules.ui.updateCorrectionUI();
        });

        // Quando le voci sono caricate
        this.modules.events.on('voicesLoaded', (voices) => {
            this.modules.ui.populateVoiceSelect(voices);
        });

        // Gestione richiesta analisi
        this.modules.events.on('analyzeRequested', () => {
            this.modules.textAnalyzer.analyzeText(this.modules.state.currentText);
        });
    }

    setupGlobalEventHandlers() {
        // Gestione errori globali
        window.addEventListener('error', (e) => {
            console.error('Errore globale:', e.error);
            this.modules.ui.showStatus('Errore nell\'applicazione', 'error');
        });

        // Gestione promise rejection
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rejection non gestita:', e.reason);
            this.modules.ui.showStatus('Errore nell\'esecuzione di un\'operazione', 'error');
            e.preventDefault();
        });

        // Gestione resize
        window.addEventListener('resize', () => {
            this.modules.ui.handleResize();
        });

        // Tasti rapidi
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.modules.state.saveToStorage();
                this.modules.ui.showStatus('Progetto salvato', 'success');
            }
        });
    }

    setupAutoSave() {
        setInterval(() => {
            if (this.modules.state.currentText) {
                this.modules.state.saveToStorage();
            }
        }, 30000);

        window.addEventListener('beforeunload', () => {
            this.modules.state.saveToStorage();
        });
    }

    // Metodi pubblici per API esterna
    getCurrentText() {
        return this.modules.state.currentText;
    }

    setText(text) {
        this.modules.state.setText(text);
        this.modules.events.emit('textChanged', text);
    }

    getStats() {
        return this.modules.state.getStats();
    }

    destroy() {
        // Pulizia di tutti i moduli
        Object.values(this.modules).forEach(module => {
            if (module.destroy) module.destroy();
        });
        console.log('MetaVoices app distrutta');
    }

    showError(message) {
        // Fallback per errori prima dell'inizializzazione UI
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f44336;
            color: white;
            padding: 1rem;
            z-index: 10000;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Inizializzazione globale
let metaVoicesApp = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        metaVoicesApp = new MetaVoicesApp();
        window.metaVoicesApp = metaVoicesApp; // Per debug
    } catch (error) {
        console.error('Errore critico nell\'inizializzazione:', error);
        
        // Fallback per errori critici
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <div>
                <h2 style="color: #dc3545; margin-bottom: 1rem;">Errore di caricamento</h2>
                <p style="margin-bottom: 1rem;">${error.message}</p>
                <p style="color: #6c757d;">Controlla la console per i dettagli e verifica che tutti i file siano presenti.</p>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Export per utilizzo in moduli (se necessario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MetaVoicesApp };
}