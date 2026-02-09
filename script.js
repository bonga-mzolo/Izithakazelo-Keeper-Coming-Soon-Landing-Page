
document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    if (['index.html', 'explore.html', 'clan.html'].includes(page)) {
        loadClansData().then(() => {
            if (page === 'index.html') {
                initHomePage();
                initSpotlight();
            } else if (page === 'explore.html') {
                initExplorePage();
            }
        });
    }
});

// ============================================
// GLOBAL DATA
// ============================================

let clansData = [];

// ============================================
// LOAD DATA
// ============================================

function loadClansData() {
    return fetch('data/clans.json')
        .then(response => response.json())
        .then(data => {
            clansData = data;
        })
        .catch(() => {
            // fallback data
            clansData = [
                {
                    id: 1,
                    name: "Bhengu",
                    izithakazelo: [
                        "Ngcolosi",
                        "Wena WakwaDlabazane",
                        "KaNephu kaLamula"
                    ]
                }
            ];
        });
}

// ============================================
// HOME PAGE
// ============================================

function initHomePage() {
    const searchInput = document.getElementById('home-search');

    if (!searchInput) return;

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const value = this.value.trim();
            if (value) {
                window.location.href = `explore.html?search=${encodeURIComponent(value)}`;
            }
        }
    });

    initStatsCounters();
}

// ============================================
// SPOTLIGHT
// ============================================

function initSpotlight() {
    const container = document.getElementById('spotlight-container');
    if (!container || clansData.length === 0) return;

    const shuffled = [...clansData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 16);

    container.innerHTML = "";

    selected.forEach(clan => {
        const link = document.createElement('a');
        link.href = `clans/${clan.name.toLowerCase()}.html`;
        link.className = 'spotlight-tag';
        link.textContent = clan.name;
        container.appendChild(link);
    });
}

// ============================================
// EXPLORE PAGE
// ============================================

function initExplorePage() {
    initAlphabetFilter();
    setupSearch();

    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const letter = params.get('letter');

    if (search) {
        document.getElementById('search-input').value = search;
        searchClans(search);
    } else {
        displayClansByLetter(letter || 'ALL');
        setActiveLetter(letter || 'ALL');
    }
}

function initAlphabetFilter() {
    const container = document.querySelector('.alphabet-grid');
    if (!container) return;

    const letters = ['ALL','B','C','D','F','G','H','J','K','L','M','N','Q','S','T','X','Z'];
    container.innerHTML = '';

    letters.forEach(letter => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'letter';
        span.dataset.letter = letter;

        span.addEventListener('click', function () {
            filterByLetter(this.dataset.letter);
        });

        container.appendChild(span);
    });
}

function filterByLetter(letter) {
    const url = new URL(window.location);
    url.searchParams.delete('search');

    if (letter === 'ALL') {
        url.searchParams.delete('letter');
    } else {
        url.searchParams.set('letter', letter);
    }

    window.history.pushState({}, '', url);
    setActiveLetter(letter);
    displayClansByLetter(letter);
}

function setActiveLetter(letter) {
    document.querySelectorAll('.letter').forEach(el => {
        el.classList.toggle('active-letter', el.dataset.letter === letter);
    });
}

function displayClansByLetter(letter) {
    const container = document.getElementById('clans-list');
    if (!container) return;

    let list = letter === 'ALL'
        ? [...clansData]
        : clansData.filter(c => c.name[0].toUpperCase() === letter);

    if (list.length === 0) {
        container.innerHTML = `<p>No clans found.</p>`;
        return;
    }

    const groups = {};

    list.forEach(clan => {
        const first = clan.name[0].toUpperCase();
        if (!groups[first]) groups[first] = [];
        groups[first].push(clan);
    });

    let html = '';

    Object.keys(groups).sort().forEach(key => {
        html += `
            <div class="clan-group">
                <h3>${key}</h3>
                <div class="clan-tags">
                    ${groups[key].map(c => `
                        <a href="clans/${c.name.toLowerCase()}.html" class="clan-tag">
                            ${c.name}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// SEARCH
// ============================================

function setupSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', function () {
        searchClans(this.value);
    });
}

function searchClans(query) {
    const container = document.getElementById('clans-list');
    if (!container) return;

    if (!query.trim()) {
        displayClansByLetter('ALL');
        return;
    }

    const results = clansData.filter(clan =>
    clan.name.toLowerCase().startsWith(query.toLowerCase())
    );

    if (results.length === 0) {
    container.innerHTML = `
        <div class="no-results">
            <p>No results found.</p>
            <a href="contribute.html" class="contribute-link">
                Contribute by adding this surname clans
            </a>
        </div>
    `;
    return;
    }


    container.innerHTML = `
    <div class="clan-group">
        <h3>Search Results</h3>
        <div class="clan-tags">
            ${results.map(clan => `
                <a href="clans/${clan.name.toLowerCase()}.html" class="clan-tag">
                    ${clan.name}
                </a>
            `).join('')}
        </div>
    </div>
    `;

}

// ============================================
// CLAN PAGE
// ============================================

function initClanPage() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || 'Bhengu';
    displayClanDetail(name);
}

function displayClanDetail(name) {
    const container = document.getElementById('praise-container');
    if (!container) return;

    const clan = clansData.find(c => c.name === name);

    if (!clan) {
        container.innerHTML = `<p>Clan not found.</p>`;
        return;
    }

    document.title = `Izithakazelo zakwa ${name}`;

    container.innerHTML = `
        <h1>Izithakazelo zakwa ${name}</h1>
        <div class="praise-text">
            ${clan.izithakazelo.map(line => `<p>${line}</p>`).join('')}
        </div>
    `;
}

// ============================================
// MOBILE MENU
// ============================================

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('mobile-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        menuToggle.classList.toggle('active');
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            menuToggle.classList.remove('active');
        });
    });
}


// ============================================
// STATS COUNTER
// ============================================

function initStatsCounters() {
    const counters = document.querySelectorAll('.counter');
    const statsSection = document.getElementById('stats');
    if (!counters.length || !statsSection) return;

    const totalClans = clansData.length;
    const totalPraises = clansData.reduce((sum, clan) => sum + clan.izithakazelo.length, 0);

    counters[0].dataset.target = totalClans;
    counters[1].dataset.target = totalPraises;

    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                counters.forEach(counter => {
                    let current = 0;
                    const target = Number(counter.dataset.target);
                    const increment = Math.ceil(target / 80);

                    function updateCounter() {
                        current += increment;
                        if (current >= target) {
                            counter.textContent = target + '+';
                        } else {
                            counter.textContent = current;
                            requestAnimationFrame(updateCounter);
                        }
                    }

                    updateCounter();
                });

                obs.disconnect();
            }
        });
    }, { threshold: 0.4 });

    observer.observe(statsSection);
}

