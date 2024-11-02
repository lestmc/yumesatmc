document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const resourceCards = document.querySelectorAll('.resource-card');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const resubmitBtns = document.querySelectorAll('.resubmit-btn');

    // 标签切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const status = this.dataset.status;
            
            // 更新标签状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 过滤资源卡片
            resourceCards.forEach(card => {
                if (status === 'all' || card.dataset.status === status) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 删除资源
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除这个资源吗？')) {
                const resourceId = this.dataset.id;
                const card = this.closest('.resource-card');

                try {
                    const response = await fetch(`/api/resources/${resourceId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        card.style.animation = 'fadeOut 0.5s ease';
                        setTimeout(() => {
                            card.remove();
                            if (document.querySelectorAll('.resource-card').length === 0) {
                                location.reload(); // 如果没有资源了，刷新页面显示空状态
                            }
                        }, 500);
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

    // 重新提交资源
    resubmitBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const resourceId = this.dataset.id;
            try {
                const response = await fetch(`/api/resources/${resourceId}/resubmit`, {
                    method: 'POST'
                });

                if (response.ok) {
                    alert('资源已重新提交审核');
                    location.reload();
                } else {
                    const data = await response.json();
                    alert(data.message || '重新提交失败');
                }
            } catch (error) {
                console.error('重新提交错误:', error);
                alert('重新提交过程中发生错误');
            }
        });
    });
}); 