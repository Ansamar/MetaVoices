/**
 * Motore di analisi testo per individuare parole ambigue
 */

class TextAnalyzer {
    constructor() {
        this.analyzerReady = false;
    }

    async init() {
        if (!window.ambiguousWordsLoader) {
            console.error('❌ AmbiguousWordsLoader non disponibile');
            return;
        }

        await window.ambiguousWordsLoader.loadDictionary();
        this.analyzerReady = true;
        console.log('✅ TextAnalyzer pronto');
    }

    async analyzeText(text) {
        if (!this.analyzerReady) {
            await this.init();
        }

        const ambiguities = [];
        const words = this.tokenizeText(text);

        for (let i = 0; i < words.length; i++) {
            const word = words[i].word;
            const isAmbiguous = window.ambiguousWordsLoader.isAmbiguous(word);
            
            if (isAmbiguous) {
                const wordData = window.ambiguousWordsLoader.getWordData(word);
                ambiguities.push({
                    original: word,
                    position: words[i].position,
                    context: this.getWordContext(words, i),
                    data: wordData
                });
            }
        }

        console.log('🔍 Analisi completata:', ambiguities.length, 'ambiguità trovate');
        return ambiguities;
    }

    tokenizeText(text) {
        const tokens = [];
        const wordRegex = /[\w'àèéìíîòóùú]+/gi;
        let match;

        while ((match = wordRegex.exec(text)) !== null) {
            tokens.push({
                word: match[0],
                position: match.index,
                length: match[0].length
            });
        }

        return tokens;
    }

    getWordContext(words, currentIndex, contextSize = 2) {
        const start = Math.max(0, currentIndex - contextSize);
        const end = Math.min(words.length, currentIndex + contextSize + 1);
        
        return words.slice(start, end)
            .map(w => w.word)
            .join(' ');
    }

    applyCorrection(text, original, corrected) {
        // Sostituisce tutte le occorrenze della parola
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        return text.replace(regex, corrected);
    }

    getTextStats(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const characters = text.length;
        
        return {
            wordCount: words.length,
            charCount: characters,
            readingTime: Math.ceil(words.length / 200) // 200 parole/minuto
        };
    }
}

// Istanza globale
window.textAnalyzer = new TextAnalyzer();