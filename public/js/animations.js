// 添加波纹效果
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple-effect');
        
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// 添加页面过渡效果
function addPageTransition() {
    document.body.classList.add('page-transition');
    setTimeout(() => {
        document.body.classList.remove('page-transition');
    }, 500);
}

// 添加加载动画
function showLoading(container, text = '加载中...') {
    const loading = document.createElement('div');
    loading.classList.add('loading-container');
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p class="loading-text">${text}</p>
    `;
    container.appendChild(loading);
    return loading;
}

function hideLoading(loading) {
    loading.remove();
}

// 添加滚动动画
function addScrollAnimation() {
    const elements = document.querySelectorAll('.scroll-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// 导出工具函数
window.animations = {
    addRippleEffect,
    addPageTransition,
    showLoading,
    hideLoading,
    addScrollAnimation
}; 