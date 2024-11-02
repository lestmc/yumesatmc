document.addEventListener('DOMContentLoaded', function() {
    const resourcesContainer = document.getElementById('resourcesContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    let currentPage = 1;
    let totalPages = 1;
    const itemsPerPage = 12;

    // 加载资源
    async function loadResources() {
        try {
            const category = categoryFilter.value;
            const sort = sortFilter.value;
            const search = searchInput.value;

            const response = await fetch(`/api/resources?page=${currentPage}&limit=${itemsPerPage}&category=${category}&sort=${sort}&search=${search}`);
            const data = await response.json();

            if (response.ok) {
                displayResources(data.resources);
                updatePagination(data.total);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('加载资源错误:', error);
            resourcesContainer.innerHTML = '<p class="error-message">加载资源失败，请重试</p>';
        }
    }

    // 显示资源
    function displayResources(resources) {
        resourcesContainer.innerHTML = resources.map(resource => `
            <div class="resource-card">
                <div class="resource-image">
                    <img src="${resource.imageUrl}" alt="${resource.title}">
                </div>
                <div class="resource-info">
                    <h3 class="resource-title">${resource.title}</h3>
                    <span class="resource-author">by ${resource.author.username}</span>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span>下载: ${resource.downloads}</span>
                        <span>${resource.category}</span>
                        <span>${resource.version}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 更新分页
    function updatePagination(total) {
        totalPages = Math.ceil(total / itemsPerPage);
        pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // 事件监听
    categoryFilter.addEventListener('change', () => {
        currentPage = 1;
        loadResources();
    });

    sortFilter.addEventListener('change', () => {
        currentPage = 1;
        loadResources();
    });

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadResources();
        }, 300);
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadResources();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadResources();
        }
    });

    // 初始加载
    loadResources();
}); 