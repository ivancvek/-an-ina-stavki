let favorites = JSON.parse(localStorage.getItem('spanishFavoritePhrases') || '[]');
let currentCategory = 'all';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('spanish-sw.js');
}

function filterCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderPhrases();
}

function filterPhrases() {
    renderPhrases();
}

function renderPhrases() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let filtered = phrases;

    if (currentCategory === 'favorites') {
        filtered = phrases.filter(p => favorites.includes(p.id));
    } else if (currentCategory !== 'all') {
        filtered = phrases.filter(p => p.cat === currentCategory);
    }

    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.es.toLowerCase().includes(searchTerm) || 
            p.sl.toLowerCase().includes(searchTerm)
        );
    }

    const container = document.getElementById('phrasesList');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:white;">Ni najdenih stavkov</div>';
        return;
    }

    container.innerHTML = filtered.map(phrase => `
        <div class="phrase-card">
            <div class="phrase-header">
                <span class="category-badge badge-${phrase.cat}">
                    ${getCategoryName(phrase.cat)}
                </span>
                <button class="favorite-btn" onclick="toggleFavorite(${phrase.id})">
                    ${favorites.includes(phrase.id) ? '⭐' : '☆'}
                </button>
            </div>
            <div class="phrase-spanish">${phrase.es}</div>
            <div class="phrase-slovenian">${phrase.sl}</div>
            <div class="phrase-actions">
                <button class="action-btn btn-speak" onclick="speak('${escapeQuotes(phrase.es)}')">
                    🔊 Poslušaj
                </button>
                <button class="action-btn btn-copy" onclick="copyPhrase('${escapeQuotes(phrase.es)}', '${escapeQuotes(phrase.sl)}')">
                    📋 Kopiraj
                </button>
            </div>
        </div>
    `).join('');

    updateStats();
}

function getCategoryName(cat) {
    const names = {
        'basic': 'Osnovno',
        'airport': 'Letališče',
        'restaurant': 'Restavracija',
        'shopping': 'Nakupovanje',
        'hotel': 'Hotel',
        'transport': 'Transport',
        'emergency': 'Nujno'
    };
    return names[cat] || cat;
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('spanishFavoritePhrases', JSON.stringify(favorites));
    renderPhrases();
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    } else {
        alert('Audio ni podprt');
    }
}

function copyPhrase(es, sl) {
    const text = `${es}\n${sl}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Stavek skopiran!');
    }).catch(() => {
        alert(text);
    });
}

function escapeQuotes(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function updateStats() {
    document.getElementById('totalCount').textContent = phrases.length;
    document.getElementById('favoriteCount').textContent = favorites.length;
}

renderPhrases();
