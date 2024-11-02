document.addEventListener('DOMContentLoaded', function() {
    const approveBtns = document.querySelectorAll('.approve-btn');
    const rejectBtns = document.querySelectorAll('.reject-btn');

    async function reviewResource(id, status, comment) {
        try {
            const response = await fetch(`/api/admin/review/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, comment })
            });

            if (response.ok) {
                alert(`资源已${status === 'approved' ? '通过' : '拒绝'}`);
                window.location.reload();
            } else {
                const data = await response.json();
                alert(data.message || '操作失败');
            }
        } catch (error) {
            console.error('审核错误:', error);
            alert('操作过程中发生错误');
        }
    }

    approveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceId = this.dataset.id;
            const card = this.closest('.resource-review-card');
            const comment = card.querySelector('.review-comment').value;
            reviewResource(resourceId, 'approved', comment);
        });
    });

    rejectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceId = this.dataset.id;
            const card = this.closest('.resource-review-card');
            const comment = card.querySelector('.review-comment').value;
            if (!comment) {
                alert('拒绝时必须填写审核意见');
                return;
            }
            reviewResource(resourceId, 'rejected', comment);
        });
    });
}); 