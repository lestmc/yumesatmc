document.addEventListener('DOMContentLoaded', function() {
    const loginToUploadBtn = document.getElementById('loginToUpload');
    const featuredResources = document.getElementById('featuredResources');

    // 未登录用户点击上传按钮时打开登录窗口
    if (loginToUploadBtn) {
        loginToUploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginBtn').click();
        });
    }

    // 加载推荐资源
    async function loadFeaturedResources() {
        try {
            const response = await fetch('/api/resources?sort=newest&limit=6');
            const data = await response.json();

            if (response.ok && data.resources.length > 0) {
                featuredResources.innerHTML = data.resources
                    .filter(resource => resource.status === 'approved')
                    .map(resource => `
                        <div class="resource-window hover-float">
                            <div class="resource-image">
                                <img src="${resource.imageUrl}" alt="${resource.title}">
                            </div>
                            <div class="resource-info">
                                <h3 class="resource-title">${resource.title}</h3>
                                <span class="resource-author">by ${resource.authorName}</span>
                                <p class="resource-description">${resource.description}</p>
                            </div>
                        </div>
                    `).join('');
            } else {
                featuredResources.innerHTML = '<p class="no-resources">暂无推荐资源</p>';
            }
        } catch (error) {
            console.error('加载资源错误:', error);
            featuredResources.innerHTML = '<p class="no-resources">加载资源失败</p>';
        }
    }

    // 初始加载
    loadFeaturedResources();
}); 