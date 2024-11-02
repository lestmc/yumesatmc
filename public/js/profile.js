document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const avatarForm = document.getElementById('avatarForm');
    const avatarModal = document.getElementById('avatarModal');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const closeBtn = avatarModal.querySelector('.close-btn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const deleteBtns = document.querySelectorAll('.delete-btn');

    // 头像预览
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="头像预览">`;
            }
            reader.readAsDataURL(file);
        }
    });

    // 打开头像模态窗口
    changeAvatarBtn.addEventListener('click', function() {
        avatarModal.classList.add('active');
        setTimeout(() => {
            avatarModal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    });

    // 关闭头像模态窗口
    function closeAvatarModal() {
        avatarModal.querySelector('.modal-content').style.transform = 'scale(0)';
        setTimeout(() => {
            avatarModal.classList.remove('active');
        }, 300);
    }

    closeBtn.addEventListener('click', closeAvatarModal);
    avatarModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAvatarModal();
        }
    });

    // 上传头像
    avatarForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        try {
            const response = await fetch('/api/users/avatar', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('头像更新成功！');
                window.location.reload();
            } else {
                const data = await response.json();
                alert(data.message || '上传失败，请重试');
            }
        } catch (error) {
            console.error('上传错误:', error);
            alert('上传过程中发生错误，请重试');
        }
    });

    // 更新个人资料
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('个人资料更新成功！');
                window.location.reload();
            } else {
                const result = await response.json();
                alert(result.message || '更新失败，请重试');
            }
        } catch (error) {
            console.error('更新错误:', error);
            alert('更新过程中发生错误，请重试');
        }
    });

    // 删除资源
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除这个资源吗？')) {
                const resourceId = this.dataset.id;
                try {
                    const response = await fetch(`/api/resources/${resourceId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        alert('资源已删除');
                        window.location.reload();
                    } else {
                        const data = await response.json();
                        alert(data.message || '删除失败');
                    }
                } catch (error) {
                    console.error('删除错误:', error);
                    alert('删除过程中发生错误');
                }
            }
        });
    });
}); 