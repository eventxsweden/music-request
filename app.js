const form = document.getElementById('request-form');
const artistInput = document.getElementById('artist-input');
const songInput = document.getElementById('song-input');
const requestsList = document.getElementById('requests-list');
const filter = document.getElementById('filter');
const djModeButton = document.getElementById('dj-mode-button');
const djModal = document.getElementById('dj-modal');
const closeButton = document.querySelector('.close-button');
const djLoginButton = document.getElementById('dj-login-button');
const djPasswordInput = document.getElementById('dj-password');
const djError = document.getElementById('dj-error');

let requests = JSON.parse(localStorage.getItem('requests')) || [];
let voteHistory = JSON.parse(localStorage.getItem('voteHistory')) || {};
let isDJ = false; // Flag för att hålla reda på om DJ-läge är aktivt

// Funktion för att spara data till lokal lagring
function saveData() {
    localStorage.setItem('requests', JSON.stringify(requests));
    localStorage.setItem('voteHistory', JSON.stringify(voteHistory));
}

// Hantera formulärinlämning
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const artist = artistInput.value.trim();
    const song = songInput.value.trim();

    if (artist && song) {
        const request = { artist, song, votes: 0, played: false };
        requests.push(request);
        saveData();
        updateRequestsList();
        artistInput.value = ''; // Töm fältet
        songInput.value = ''; // Töm fältet
    }
});

// Uppdatera listan med låtönskningar
function updateRequestsList() {
    const filterValue = filter.value;
    requestsList.innerHTML = '';
    const filteredRequests = requests.filter((request) => {
        if (filterValue === 'all') return true;
        if (filterValue === 'more') return request.votes > 3;
        return request.votes === Number(filterValue);
    });

    filteredRequests.forEach((request, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${request.artist}</strong> - "${request.song}" 
            <button onclick="vote(${index})">Rösta (${request.votes})</button>
            ${isDJ ? `<button onclick="markAsPlayed(${index})" ${request.played ? 'disabled' : ''}>${request.played ? 'Spelad' : 'Markera som spelad'}</button>` : ''}
        `;

        // Om låten har spelats, gör texten överstruken
        if (request.played) {
            li.style.textDecoration = "line-through";
            li.style.color = "gray";
        }

        requestsList.appendChild(li);
    });
}

// Rösta på en låt
function vote(index) {
    const requestId = `${requests[index].artist}-${requests[index].song}`;

    // Kontrollera om användaren redan har röstat
    if (voteHistory[requestId]) {
        alert("Du har redan röstat på denna låt!");
        return;
    }

    // Öka rösterna och spara rösthistorik
    requests[index].votes++;
    voteHistory[requestId] = true;
    saveData();
    updateRequestsList();
}

// Markera låt som spelad (endast DJ)
function markAsPlayed(index) {
    requests[index].played = true;
    saveData();
    updateRequestsList();
}

// Hantera förändringar i filtreringsmenyn
filter.addEventListener('change', updateRequestsList);

// Hantera DJ-läge knapp
djModeButton.addEventListener('click', () => {
    djModal.style.display = 'block';
});

// Hantera stängning av modalen
closeButton.addEventListener('click', () => {
    djModal.style.display = 'none';
    djError.textContent = '';
    djPasswordInput.value = '';
});

// Hantera inloggning för DJ
djLoginButton.addEventListener('click', () => {
    const password = djPasswordInput.value;
    const correctPassword = 'dj123'; // Byt ut detta till ett säkrare lösenord

    if (password === correctPassword) {
        isDJ = true;
        djModal.style.display = 'none';
        djError.textContent = '';
        updateRequestsList();
    } else {
        djError.textContent = 'Fel lösenord, försök igen!';
    }
});

// Stäng modalen om användaren klickar utanför den
window.addEventListener('click', (event) => {
    if (event.target == djModal) {
        djModal.style.display = 'none';
        djError.textContent = '';
        djPasswordInput.value = '';
    }
});

// Initial uppdatering av listan
updateRequestsList();

// Registrera service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('ServiceWorker registrerad:', registration);
        })
        .catch((error) => {
            console.log('ServiceWorker registrering misslyckades:', error);
        });
}
