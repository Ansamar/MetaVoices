// VOICES FALLBACK - VOCI PREDEFINITE
const predefinedVoices = [
    {
        voice_id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel',
        category: 'premade',
        description: 'Voce femminile chiara'
    },
    {
        voice_id: 'AZnzlk1XvdvUeBnXmlld', 
        name: 'Domi',
        category: 'premade',
        description: 'Voce femminile energetica'
    },
    {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        category: 'premade', 
        description: 'Voce femminile calda'
    }
];

function loadPredefinedVoices() {
    const select = document.getElementById('voiceSelect');
    select.innerHTML = '<option value="">Seleziona una voce...</option>';
    
    predefinedVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        option.textContent = voice.name;
        select.appendChild(option);
    });
}

// Usa le voci predefinite
loadPredefinedVoices();