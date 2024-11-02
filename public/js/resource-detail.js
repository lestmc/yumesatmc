document.addEventListener('DOMContentLoaded', function() {
    const deleteBtn = document.querySelector('.delete-btn');
    const commentForm = document.getElementById('commentForm');
    const commentsContainer = document.querySelector('.comments-list');

    // 删除资源
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
            if (confirm('确定要删除这个资源吗？')) {
                const resourceId = this.dataset.id;
                try {
                    const response = await fetch(`/api/resources/${resourceId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        alert('资源已删除');
                        window.location.href = '/resources';
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
    }

    // 加载评论
    async function loadComments() {
        try {
            const resourceId = window.location.pathname.split('/').pop();
            const response = await fetch(`/api/resources/${resourceId}/comments`);
            const comments = await response.json();

            commentsContainer.innerHTML = comments.map(comment => `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author.username}</span>
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载评论错误:', error);
            commentsContainer.innerHTML = '<p class="error">加载评论失败</p>';
        }
    }

    // 提交评论
    if (commentForm) {
        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const resourceId = window.location.pathname.split('/').pop();
            const content = this.querySelector('textarea').value;

            try {
                const response = await fetch(`/api/resources/${resourceId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content })
                });

                if (response.ok) {
                    this.reset();
                    loadComments();
                } else {
                    const data = await response.json();
                    alert(data.message || '评论发送失败');
                }
            } catch (error) {
                console.error('评论错误:', error);
                alert('评论发送过程中发生错误');
            }
        });
    }

    // 初始加载评论
    loadComments();
}); 