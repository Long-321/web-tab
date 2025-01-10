document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
});

function loadFavorites() {
    const container = document.getElementById('favorites-container');
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有收藏任何链接</div>';
        return;
    }
    
    container.innerHTML = favorites.map(item => `
        <a href="${item.url}" class="card" target="_blank">
            <div class="card-content">
                <img src="${item.icon}" alt="${item.title}" class="card-icon">
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                <button class="favorite-toggle active" 
                    data-url="${item.url}" 
                    data-title="${item.title}" 
                    data-desc="${item.desc}" 
                    data-icon="${item.icon}">
                    <img src="https://cdn-icons-png.flaticon.com/512/1077/1077035.png" alt="取消收藏" class="favorite-icon">
                </button>
            </div>
        </a>
    `).join('');
    
    initFavoriteButtons();
}

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
} 