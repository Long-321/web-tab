document.addEventListener('DOMContentLoaded', function() {
    initCategorySwitch();
    initFavoriteButtons();
    initSearch();
    initCardAnimations();
    
    // 添加页面加载动画
    document.body.classList.add('loaded');

    // 卡片动画
    const cards = document.querySelectorAll('.card');
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
    });

    // 初始化分类展开/折叠
    initCategoryToggles();
});

function initFavoriteButtons() {
    const buttons = document.querySelectorAll('.favorite-toggle');
    
    buttons.forEach(button => {
        const url = button.dataset.url;
        updateFavoriteButtonState(button, url);
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(button);
        });
    });
}

function toggleFavorite(button) {
    const url = button.dataset.url;
    const title = button.dataset.title;
    const desc = button.dataset.desc;
    const icon = button.dataset.icon;
    
    let favorites = getFavorites();
    
    if (isFavorited(url)) {
        // 移除收藏
        favorites = favorites.filter(item => item.url !== url);
        button.classList.remove('active');
    } else {
        // 添加收藏
        favorites.push({ url, title, desc, icon });
        button.classList.add('active');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function isFavorited(url) {
    const favorites = getFavorites();
    return favorites.some(item => item.url === url);
}

function updateFavoriteButtonState(button, url) {
    const favorites = getFavorites();
    const isFavorited = favorites.some(item => item.url === url);
    button.classList.toggle('active', isFavorited);
}

function initCategoryToggles() {
    const categories = document.querySelectorAll('.category-section');
    
    categories.forEach(category => {
        const header = category.querySelector('.category-header');
        header.addEventListener('click', () => {
            category.classList.toggle('collapsed');
        });
    });
}

// 添加分类切换功能
function initCategorySwitch() {
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryContents = document.querySelectorAll('.category-content');

    categoryItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const category = item.dataset.category;

            // 更新激活状态
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // 淡出当前内容
            const currentContent = document.querySelector('.category-content.active');
            if (currentContent) {
                currentContent.style.opacity = '0';
                currentContent.style.transform = 'translateY(20px)';
                await new Promise(resolve => setTimeout(resolve, 300));
                currentContent.classList.remove('active');
            }

            // 淡入新内容
            const newContent = document.getElementById(category);
            if (newContent) {
                newContent.classList.add('active');
                // 触发重排以启动动画
                newContent.offsetHeight;
                newContent.style.opacity = '1';
                newContent.style.transform = 'translateY(0)';
            }
        });
    });
}

// 修改搜索功能的实现
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    const categoryContents = document.querySelectorAll('.category-content');

    function performSearch(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        
        // 获取所有卡片
        const allCards = document.querySelectorAll('.card');
        
        if (!searchTerm) {
            // 如果搜索词为空，恢复原始显示状态
            categoryContents.forEach(content => {
                content.style.display = content.classList.contains('active') ? 'block' : 'none';
            });
            allCards.forEach(card => {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
            hideNoResults();
            return;
        }

        let hasResults = false;

        // 显示所有分类内容以便搜索
        categoryContents.forEach(content => {
            content.style.display = 'block';
            const cardsInContent = content.querySelectorAll('.card');
            
            let hasVisibleCards = false;
            
            cardsInContent.forEach(card => {
                // 将所有要搜索的文本转换为小写
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                const url = card.getAttribute('href').toLowerCase();
                
                // 搜索匹配
                if (title.includes(searchTerm) || 
                    desc.includes(searchTerm) || 
                    url.includes(searchTerm)) {
                    card.style.display = '';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    hasVisibleCards = true;
                    hasResults = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // 如果该分类没有匹配的卡片，隐藏整个分类
            content.style.display = hasVisibleCards ? 'block' : 'none';
        });

        // 显示无结果提示
        if (!hasResults) {
            showNoResults();
        } else {
            hideNoResults();
        }
    }

    function showNoResults() {
        let noResults = document.querySelector('.no-results');
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = '没有找到匹配的结果';
            document.querySelector('.content-container').appendChild(noResults);
        }
        noResults.style.display = 'block';

        // 隐藏所有分类
        categoryContents.forEach(content => {
            content.style.display = 'none';
        });
    }

    function hideNoResults() {
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 使用防抖处理搜索
    const debouncedSearch = debounce((value) => {
        performSearch(value);
    }, 300);

    // 搜索输入事件
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

// 添加卡片加载动画
function initCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(card);
    });
} 