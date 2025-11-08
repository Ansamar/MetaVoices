/**
 * MetaVoices - Schermata 2: Analisi Testo
 * Gestione analisi e correzioni automatiche
 */

class AnalysisApp {
    constructor() {
        this.currentText = '';
        this.ambiguities = [];
        this.appliedCorrections = [];
        this.highlightEnabled = true;
        this.autoCorrectEnabled = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inizializzazione Schermata 2: Analisi Testo');
            
            // Carica stato precedente
            await this.loadPreviousState();
            
            this.setupEventListeners();
            this.setupUIComponents();
            
            // Inizializza analizzatore
            await window.textAnalyzer.init();
            
            console.log('✅ Schermata 2 pronta');
            this.showStatus('Sistema di analisi pronto', 'success');
            
        } catch (error) {
            console.error('❌ Errore inizializzazione:', error);
            this.showStatus('Errore inizializzazione: ' + error.message, 'error');
        }
    }

    async loadPreviousState() {
        try {
            const savedState = localStorage.getItem('metavoices_voice_selection');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.currentText = state.currentText || '';
                
                // Mostra il testo nella display area
                this.displayText(this.currentText);
                this.updateTextStats();
                
                console.log('✅ Stato precedente caricato');
            }
        } catch (error) {
            console.error('Errore caricamento stato:', error);
            this.currentText = "Ciao, sono MetaVoices. Questo è un esempio di testo da analizzare per trovare parole ambigue come 'da' e 'dà' oppure 'affianco' che dovrebbe essere 'a fianco'.";
            this.displayText(this.currentText);
            this.updateTextStats();
        }
    }

    setupEventListeners() {
        // Analisi testo
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.addEventListener('click', () => {
            this.analyzeText();
        });

        // Toggle highlight
        const toggleHighlightBtn = document.getElementById('toggleHighlightBtn');
        toggleHighlightBtn.addEventListener('click', () => {
            this.toggleHighlight();
        });

        // Correzione automatica
        const autoCorrectToggle = document.getElementById('autoCorrectToggle');
        autoCorrectToggle.addEventListener('change', (e) => {
            this.autoCorrectEnabled = e.target.checked;
            this.showStatus(
                e.target.checked ? 
                'Correzione automatica attivata' : 
                'Correzione automatica disattivata',
                'info'
            );
        });

        // Applica tutte le correzioni
        const applyAllBtn = document.getElementById('applyAllBtn');
        applyAllBtn.addEventListener('click', () => {
            this.applyAllSuggestions();
        });

        // Navigazione
        const backBtn = document.getElementById('backBtn');
        backBtn.addEventListener('click', () => {
            this.goBack();
        });

        const nextBtn = document.getElementById('nextBtn');
        nextBtn.addEventListener('click', () => {
            this.goToSSML();
        });
    }

    setupUIComponents() {
        this.updateTextStats();
    }

    displayText(text) {
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.innerHTML = this.formatTextForDisplay(text);
    }

    formatTextForDisplay(text) {
        if (!this.highlightEnabled || this.ambiguities.length === 0) {
            return `<div class="text-plain">${this.escapeHTML(text)}</div>`;
        }

        let highlightedText = this.escapeHTML(text);
        
        // Highlight parole ambigue (in ordine inverso per evitare problemi di indice)
        const sortedAmbiguities = [...this.ambiguities].sort((a, b) => b.position - a.position);
        
        sortedAmbiguities.forEach(ambiguity => {
            const original = this.escapeHTML(ambiguity.original);
            const highlight = `<span class="word-ambiguous" data-word="${original}">${original}</span>`;
            highlightedText = highlightedText.substring(0, ambiguity.position) + 
                            highlight + 
                            highlightedText.substring(ambiguity.position + ambiguity.original.length);
        });

        return `<div class="text-highlighted">${highlightedText}</div>`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async analyzeText() {
        const text = this.currentText;
        if (!text.trim()) {
            this.showStatus('Inserisci del testo da analizzare', 'warning');
            return;
        }

        try {
            this.showStatus('Analisi testo in corso...', 'loading');
            
            this.ambiguities = await window.textAnalyzer.analyzeText(text);
            
            // Aggiorna UI
            this.displayText(text);
            this.updateAnalysisUI();
            
            if (this.ambiguities.length === 0) {
                this.showStatus('Nessuna ambiguità trovata nel testo', 'success');
            } else {
                this.showStatus(`Trovate ${this.ambiguities.length} ambiguità`, 'info');
                
                // Applica correzioni automatiche se attivo
                if (this.autoCorrectEnabled) {
                    this.applyAutoCorrections();
                }
            }
            
        } catch (error) {
            console.error('Errore analisi:', error);
            this.showStatus('Errore durante l\'analisi del testo', 'error');
        }
    }

    updateAnalysisUI() {
        const ambiguitiesCount = document.getElementById('ambiguitiesCount');
        const ambiguitiesList = document.getElementById('ambiguitiesList');
        const suggestionsList = document.getElementById('suggestionsList');
        const applyAllBtn = document.getElementById('applyAllBtn');

        // Aggiorna contatore
        ambiguitiesCount.textContent = this.ambiguities.length;
        applyAllBtn.disabled = this.ambiguities.length === 0;

        // Aggiorna lista ambiguità
        if (this.ambiguities.length === 0) {
            ambiguitiesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>Nessuna ambiguità trovata</h3>
                    <p>Il testo non contiene parole ambigue rilevate</p>
                </div>
            `;
            suggestionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <h3>Nessun suggerimento</h3>
                    <p>Non sono necessarie correzioni</p>
                </div>
            `;
            return;
        }

        // Mostra ambiguità trovate
        let ambiguitiesHTML = '';
        let suggestionsHTML = '';

        this.ambiguities.forEach((ambiguity, index) => {
            // Item ambiguità
            ambiguitiesHTML += `
                <div class="ambiguity-item" data-index="${index}">
                    <div class="ambiguity-header">
                        <span class="ambiguity-word">"${ambiguity.original}"</span>
                        <span class="ambiguity-type">${ambiguity.data.type}</span>
                    </div>
                    <div class="ambiguity-context">
                        <span class="context-label">Contesto:</span>
                        <span class="context-text">${ambiguity.context}</span>
                    </div>
                    <div class="ambiguity-meanings">
                        <span class="meanings-label">Significati:</span>
                        <span class="meanings-text">${ambiguity.data.meanings.join(', ')}</span>
                    </div>
                </div>
            `;

            // Suggerimenti per questa ambiguità
            const suggestions = window.ambiguousWordsLoader.getSuggestions(ambiguity);
            if (suggestions.length > 0) {
                suggestions.forEach((suggestion, suggestionIndex) => {
                    suggestionsHTML += `
                        <div class="suggestion-item" data-ambiguity-index="${index}" data-suggestion-index="${suggestionIndex}">
                            <div class="suggestion-content">
                                <div class="suggestion-correction">
                                    <span class="correction-from">"${ambiguity.original}"</span>
                                    <i class="fas fa-arrow-right"></i>
                                    <span class="correction-to">"${suggestion.correction}"</span>
                                </div>
                                <div class="suggestion-details">
                                    <span class="suggestion-context">${suggestion.context}</span>
                                    ${suggestion.example ? `
                                        <span class="suggestion-example">Esempio: ${suggestion.example}</span>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="suggestion-actions">
                                <button class="btn-primary btn-small apply-suggestion-btn">
                                    <i class="fas fa-check"></i>
                                    Applica
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        });

        ambiguitiesList.innerHTML = ambiguitiesHTML;
        suggestionsList.innerHTML = suggestionsHTML || `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <h3>Nessun suggerimento disponibile</h3>
                <p>Non sono disponibili correzioni per le ambiguità trovate</p>
            </div>
        `;

        // Aggiungi event listeners per i pulsanti applica
        document.querySelectorAll('.apply-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestionItem = e.target.closest('.suggestion-item');
                const ambiguityIndex = parseInt(suggestionItem.dataset.ambiguityIndex);
                const suggestionIndex = parseInt(suggestionItem.dataset.suggestionIndex);
                
                this.applySuggestion(ambiguityIndex, suggestionIndex);
            });
        });
    }

    applySuggestion(ambiguityIndex, suggestionIndex) {
        const ambiguity = this.ambiguities[ambiguityIndex];
        const suggestions = window.ambiguousWordsLoader.getSuggestions(ambiguity);
        const suggestion = suggestions[suggestionIndex];

        if (!suggestion) return;

        // Applica correzione
        this.currentText = window.textAnalyzer.applyCorrection(
            this.currentText, 
            ambiguity.original, 
            suggestion.correction
        );

        // Salva correzione applicata
        this.appliedCorrections.push({
            original: ambiguity.original,
            corrected: suggestion.correction,
            timestamp: new Date().toISOString()
        });

        // Rimuovi ambiguità dalla lista
        this.ambiguities.splice(ambiguityIndex, 1);

        // Aggiorna UI
        this.displayText(this.currentText);
        this.updateAnalysisUI();
        this.updateTextStats();

        this.showStatus(`Correzione applicata: "${ambiguity.original}" → "${suggestion.correction}"`, 'success');
    }

    applyAllSuggestions() {
        let appliedCount = 0;

        this.ambiguities.forEach(ambiguity => {
            const suggestions = window.ambiguousWordsLoader.getSuggestions(ambiguity);
            if (suggestions.length > 0) {
                const suggestion = suggestions[0]; // Prendi il primo suggerimento
                this.currentText = window.textAnalyzer.applyCorrection(
                    this.currentText, 
                    ambiguity.original, 
                    suggestion.correction
                );

                this.appliedCorrections.push({
                    original: ambiguity.original,
                    corrected: suggestion.correction,
                    timestamp: new Date().toISOString()
                });

                appliedCount++;
            }
        });

        // Svuota ambiguità
        this.ambiguities = [];

        // Aggiorna UI
        this.displayText(this.currentText);
        this.updateAnalysisUI();
        this.updateTextStats();

        this.showStatus(`Applicate ${appliedCount} correzioni automaticamente`, 'success');
    }

    applyAutoCorrections() {
        if (!this.autoCorrectEnabled) return;

        let appliedCount = 0;
        const tempAmbiguities = [...this.ambiguities];

        tempAmbiguities.forEach(ambiguity => {
            const suggestions = window.ambiguousWordsLoader.getSuggestions(ambiguity);
            if (suggestions.length > 0) {
                const suggestion = suggestions[0];
                this.currentText = window.textAnalyzer.applyCorrection(
                    this.currentText, 
                    ambiguity.original, 
                    suggestion.correction
                );

                this.appliedCorrections.push({
                    original: ambiguity.original,
                    corrected: suggestion.correction,
                    timestamp: new Date().toISOString(),
                    autoApplied: true
                });

                appliedCount++;

                // Rimuovi dall'array ambiguities
                const index = this.ambiguities.findIndex(a => 
                    a.original === ambiguity.original && a.position === ambiguity.position
                );
                if (index > -1) {
                    this.ambiguities.splice(index, 1);
                }
            }
        });

        if (appliedCount > 0) {
            this.displayText(this.currentText);
            this.updateAnalysisUI();
            this.updateTextStats();
            this.showStatus(`Correzioni automatiche applicate: ${appliedCount}`, 'success');
        }
    }

    toggleHighlight() {
        this.highlightEnabled = !this.highlightEnabled;
        
        const toggleText = document.getElementById('highlightToggleText');
        toggleText.textContent = this.highlightEnabled ? 'Nascondi Highlight' : 'Mostra Highlight';
        
        this.displayText(this.currentText);
        this.showStatus(
            this.highlightEnabled ? 'Highlight attivato' : 'Highlight disattivato', 
            'info'
        );
    }

    updateTextStats() {
        const stats = window.textAnalyzer.getTextStats(this.currentText);
        
        document.getElementById('wordCount').textContent = stats.wordCount;
        document.getElementById('readingTime').textContent = stats.readingTime;
    }

  goBack() {
    this.saveCurrentState();
    // 🎯 TORNA ALLA SCHERMATA 1
    window.location.href = 'index.html';
}

goToSSML() {
    if (this.currentText.trim().length === 0) {
        this.showStatus('Il testo non può essere vuoto', 'warning');
        return;
    }

    this.saveCurrentState();
    this.showStatus('Passaggio ai controlli SSML...', 'info');
    
    // 🎯 NAVIGAZIONE REALE alla Schermata 3
    window.location.href = 'ssml.html';
}

    saveCurrentState() {
        const state = {
            currentText: this.currentText,
            appliedCorrections: this.appliedCorrections,
            ambiguities: this.ambiguities,
            timestamp: new Date().toISOString()
        };
        
        if (window.navigationManager) {
    window.navigationManager.refreshNavigation();
}
        localStorage.setItem('metavoices_analysis', JSON.stringify(state));
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        statusElement.className = `status ${type}`;
        statusElement.textContent = message;
        statusElement.style.display = 'block';

        if (type !== 'loading') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, type === 'error' ? 5000 : 3000);
        }
    }
}

// Inizializzazione globale
document.addEventListener('DOMContentLoaded', () => {
    window.analysisApp = new AnalysisApp();
});