document.addEventListener('DOMContentLoaded', function() {
    // 获取模态窗口元素
    const registerModal = document.getElementById('registerModal');
    const loginModal = document.getElementById('loginModal');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtns = document.querySelectorAll('.close-btn');
    
    // 打开注册窗口
    registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.classList.add('active');
        setTimeout(() => {
            registerModal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    });

    // 打开登录窗口
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.add('active');
        setTimeout(() => {
            loginModal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    });

    // 关闭窗口函数
    function closeModal(modal) {
        modal.querySelector('.modal-content').style.transform = 'scale(0)';
        setTimeout(() => {
            modal.classList.remove('active');
        }, 300);
    }

    // 为所有关闭按钮添加事件
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // 点击模态窗口外部关闭
    [registerModal, loginModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // 处理注册表单提交
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('注册成功！');
                closeModal(registerModal);
                window.location.reload(); // 刷新页面以更新用户状态
            } else {
                alert(result.message || '注册失败，请重试');
            }
        } catch (error) {
            console.error('注册错误:', error);
            alert('注册过程中发生错误，请重试');
        }
    });

    // 处理登录表单提交
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('登录成功！');
                closeModal(loginModal);
                window.location.reload(); // 刷新页面以更新用户状态
            } else {
                alert(result.message || '登录失败，请重试');
            }
        } catch (error) {
            console.error('登录错误:', error);
            alert('登录过程中发生错误，请重试');
        }
    });

    // 添加表单验证
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    function validatePassword() {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('密码不匹配');
        } else {
            confirmPassword.setCustomValidity('');
        }
    }

    password.addEventListener('change', validatePassword);
    confirmPassword.addEventListener('keyup', validatePassword);

    // 添加登出功能
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    window.location.reload(); // 刷新页面以更新用户状态
                } else {
                    alert('登出失败，请重试');
                }
            } catch (error) {
                console.error('登出错误:', error);
                alert('登出过程中发生错误，请重试');
            }
        });
    }
}); 