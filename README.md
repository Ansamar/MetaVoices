# 🎙️ MetaVoices v3.0

**Text-to-Speech Platform con Editor SSML Avanzato**

![MetaVoices](assets/images/Metavoices.png)

## ✨ Caratteristiche Principali

### 🎵 Selezione Voce Avanzata
- Supporto **ElevenLabs** per voci di alta qualità
- **Google TTS** per supporto SSML completo
- Controlli di pitch, volume e velocità
- Anteprima vocale in tempo reale

### 📝 Editor SSML Intuitivo
- **Selezione visiva** del testo
- **Toolbar rapida** per tag SSML più comuni:
  - ⏸️ Pause temporizzate (300ms, 500ms, 1s, 2s, 5s)
  - 🔊 Enfasi (Forte, Moderata, Ridotta)
  - 🐌 Velocità (Molto Lento, Lento, Normale, Veloce)
  - 🎵 Tono (Molto Basso, Basso, Normale, Alto)
- **Anteprima SSML** in tempo reale
- **Copia SSML** con un click

### 🔍 Analisi Testo Intelligente
- Divisione automatica in frasi
- Rilevamento punteggiatura
- Preparazione per sintesi vocale

### 🔊 Anteprima e Download
- **Anteprima audio** immediata
- **Download audio finale** in formato MP3
- Supporto per **tag SSML complessi**
- Mantenimento della **voce originale** selezionata

## 🚀 Installazione e Utilizzo

### Prerequisiti
- Browser web moderno
- API Key ElevenLabs (opzionale)
- API Key Google Cloud TTS (opzionale)

### Setup Rapido
1. **Clona il repository**:
   ```bash
   git clone https://github.com/TUO_USERNAME/metavoices.git
   cd metavoices
Apri il file index.html nel browser
Configura le API Keys (opzionale):
ElevenLabs API Key per voci premium
Google Cloud TTS API Key per supporto SSML avanzato
📁 Struttura del Progetto
text
metavoices/
├── index.html              # Pagina iniziale - Selezione voce
├── analysis.html           # Analisi del testo
├── ssml.html              # Editor SSML principale
├── css/
│   ├── style.css          # Stili principali
│   └── ssml.css           # Stili editor SSML
├── js/
│   └── ssml-selection.js  # Gestione selezione SSML
├── assets/
│   └── images/
│       └── Metavoices.png # Logo e risorse
└── README.md
🎯 Flusso di Lavoro
Selezione Voce → Scegli la voce preferita e configura parametri
Analisi Testo → Inserisci il testo e analizzalo
Editor SSML → Applica controlli vocali avanzati
Anteprima/Download → Ascolta e scarica l'audio finale

🔧 Tecnologie Utilizzate
HTML5 + CSS3 + JavaScript ES6+
ElevenLabs API - Sintesi vocale di alta qualità
Google Cloud TTS API - Supporto SSML avanzato
Local Storage - Salvataggio sessioni
Font Awesome - Icone e UI

🌐 API Supportate
ElevenLabs
javascript
// Per voci premium e mantenimento caratteristiche vocali
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
        'Xi-Api-Key': apiKey,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: voiceSettings
    })
});
Google Cloud TTS
javascript
// Per supporto SSML completo
const requestBody = {
    input: { ssml: text },
    voice: {
        languageCode: 'it-IT',
        name: voiceName
    },
    audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speed,
        pitch: pitch
    }
};
🎨 Screenshots
Selezione Voce: Interfaccia intuitiva per scegliere e testare le voci
Editor SSML: Toolbar con controlli vocali e anteprima in tempo reale
Anteprima Finale: Riepilogo e download dell'audio generato

🤝 Contribuire
Le contribuzioni sono benvenute! Per contribuire:
Fai il fork del progetto
Crea un branch per la tua feature (git checkout -b feature/AmazingFeature)
Commit delle modifiche (git commit -m 'Add some AmazingFeature')
Push del branch (git push origin feature/AmazingFeature)
Apri una Pull Request

📄 Licenza
Distribuito sotto licenza MIT. Vedi LICENSE per maggiori informazioni.

👥 Autori
Mario Ansaldi - Sviluppo iniziale - Ansamar

🙏 Ringraziamenti
Deepseek per l'assistenza con il codice
ElevenLabs per l'API di sintesi vocale di alta qualità
Google Cloud per il supporto TTS con SSML
Font Awesome per le icone
Community open source per strumenti e librerie
