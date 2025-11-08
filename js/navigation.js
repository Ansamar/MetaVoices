/**
 * Gestione navigazione tra schermate MetaVoices
 */

class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setupNavbar();
        this.updateNavbarState();
        this.setupNavigationEvents();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/') return 1;
        if (path.includes('analysis.html')) return 2;
        if (path.includes('ssml.html')) return 3;
        if (path.includes('preview.html')) return 4;
        return 1;
    }

    setupNavbar() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const pageNum = parseInt(item.dataset.page);
            
            // Marca la pagina corrente come attiva
            if (pageNum === this.currentPage) {
                item.classList.add('active');
            }
            
            // Marca le pagine precedenti come completate
            if (pageNum < this.currentPage) {
                item.classList.add('completed');
            }
            
            // Disabilita le pagine future (tranne se abbiamo i dati)
            if (pageNum > this.currentPage) {
                if (!this.hasRequiredData(pageNum)) {
                    item.classList.add('disabled');
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showNavigationWarning(pageNum);
                    });
                }
            }
        });
    }

    hasRequiredData(targetPage) {
        switch(targetPage) {
            case 2: // Analisi
                return this.hasVoiceSelectionData();
            case 3: // SSML
                return this.hasAnalysisData();
            case 4: // Anteprima
                return this.hasSSMLData();
            default:
                return true;
        }
    }

    hasVoiceSelectionData() {
        try {
            const data = localStorage.getItem('metavoices_voice_selection');
            if (!data) return false;
            
            const state = JSON.parse(data);
            return state.currentText && state.currentText.trim().length > 0;
        } catch {
            return false;
        }
    }

    hasAnalysisData() {
        try {
            const data = localStorage.getItem('metavoices_analysis');
            if (!data) return false;
            
            const state = JSON.parse(data);
            return state.currentText && state.currentText.trim().length > 0;
        } catch {
            return false;
        }
    }

    hasSSMLData() {
        // Per ora sempre true, poi implementeremo i controlli
        return true;
    }

    updateNavbarState() {
        // Aggiorna lo stato in base ai dati salvati
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const pageNum = parseInt(item.dataset.page);
            
            if (pageNum < this.currentPage) {
                item.classList.add('completed');
            }
            
            if (pageNum > this.currentPage && this.hasRequiredData(pageNum)) {
                item.classList.remove('disabled');
            }
        });
    }

    setupNavigationEvents() {
        // Salva lo stato prima di navigare
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });

        // Aggiorna navbar quando i dati cambiano
        window.addEventListener('storage', () => {
            this.updateNavbarState();
        });
    }

    showNavigationWarning(targetPage) {
        const pageNames = {
            2: 'Analisi Testo',
            3: 'Controlli SSML', 
            4: 'Anteprima Finale'
        };
        
        const requirement = {
            2: 'devi prima selezionare una voce e inserire del testo',
            3: 'devi prima completare l\'analisi del testo',
            4: 'devi prima applicare i controlli SSML'
        };

        alert(`Per accedere a "${pageNames[targetPage]}", ${requirement[targetPage]}.`);
    }

    saveCurrentState() {
        // Questo metodo sarà chiamato dalle app specifiche
        console.log('💾 Salvataggio stato navigazione...');
    }

    // Metodo per forzare l'aggiornamento della navbar
    refreshNavigation() {
        this.updateNavbarState();
    }
}

// Inizializzazione globale
document.addEventListener('DOMContentLoaded', function() {
    window.navigationManager = new NavigationManager();
});