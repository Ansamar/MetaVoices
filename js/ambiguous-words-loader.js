/**
 * Caricatore dizionario parole ambigue italiane
 */

class AmbiguousWordsLoader {
    constructor() {
        this.dictionary = new Map();
        this.loaded = false;
    }

    async loadDictionary() {
        if (this.loaded) return;

        // Dizionario base di parole ambigue italiane
        const ambiguousWords = {
            // Omofoni
            "da": {
                type: "omofono",
                meanings: ["preposizione", "verbo dare"],
                suggestions: [
                    {
                        correction: "dà",
                        context: "verbo",
                        example: "Lui dà il libro a Maria"
                    }
                ]
            },
            "dà": {
                type: "omofono", 
                meanings: ["verbo dare", "preposizione"],
                suggestions: [
                    {
                        correction: "da",
                        context: "preposizione",
                        example: "Vengo da Roma"
                    }
                ]
            },
            "e": {
                type: "omofono",
                meanings: ["congiunzione", "nota musicale"],
                suggestions: []
            },
            "è": {
                type: "omofono",
                meanings: ["verbo essere"],
                suggestions: []
            },
            
            // Errori comuni
            "qual'è": {
                type: "apostrofo",
                meanings: ["forma errata"],
                suggestions: [
                    {
                        correction: "qual è",
                        context: "forma corretta",
                        example: "Qual è il tuo nome?"
                    }
                ]
            },
            "affianco": {
                type: "separazione",
                meanings: ["avverbio errato"],
                suggestions: [
                    {
                        correction: "a fianco",
                        context: "locuzione avverbiale",
                        example: "Mi metto a fianco a te"
                    }
                ]
            },
            "dappertutto": {
                type: "separazione",
                meanings: ["avverbio errato"],
                suggestions: [
                    {
                        correction: "da per tutto",
                        context: "locuzione avverbiale", 
                        example: "Ho cercato da per tutto"
                    }
                ]
            },
            
            // Accenti
            "perche": {
                type: "accento",
                meanings: ["forma senza accento"],
                suggestions: [
                    {
                        correction: "perché",
                        context: "congiunzione",
                        example: "Non so perché sia successo"
                    },
                    {
                        correction: "perchè", 
                        context: "forma obsoleta",
                        example: "Forma meno comune"
                    }
                ]
            },
            "poi": {
                type: "accento",
                meanings: ["avverbio", "forma senza accento"],
                suggestions: [
                    {
                        correction: "poi",
                        context: "avverbio tempo",
                        example: "Prima studio, poi esco"
                    },
                    {
                        correction: "poi",
                        context: "avverbio luogo",
                        example: "E poi cosa fai?"
                    }
                ]
            }
        };

        // Converti in Map per accesso più efficiente
        Object.entries(ambiguousWords).forEach(([word, data]) => {
            this.dictionary.set(word.toLowerCase(), data);
        });

        this.loaded = true;
        console.log('✅ Dizionario parole ambigue caricato:', this.dictionary.size, 'parole');
    }

    getSuggestions(ambiguity) {
        const wordData = this.dictionary.get(ambiguity.original.toLowerCase());
        return wordData ? wordData.suggestions : [];
    }

    isAmbiguous(word) {
        return this.dictionary.has(word.toLowerCase());
    }

    getWordData(word) {
        return this.dictionary.get(word.toLowerCase());
    }
}

// Istanza globale
window.ambiguousWordsLoader = new AmbiguousWordsLoader();