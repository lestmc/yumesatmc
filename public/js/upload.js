document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('file');
    const fileInfo = document.getElementById('fileInfo');
    const progressBar = document.getElementById('uploadProgress');
    const progressText = document.getElementById('progressText');
    const submitBtn = document.getElementById('submitBtn');

    // 文件大小格式化
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 验证图片
    function validateImage(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            throw new Error('只支持 JPG, PNG, GIF 格式的图片');
        }
        if (file.size > maxSize) {
            throw new Error('图片大小不能超过 5MB');
        }
    }

    // 验证资源文件
    function validateResourceFile(file) {
        const allowedExtensions = ['.zip', '.rar', '.7z', '.jar'];
        const maxSize = 100 * 1024 * 1024; // 100MB
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            throw new Error('只支持 ZIP, RAR, 7Z, JAR 格式的文件');
        }
        if (file.size > maxSize) {
            throw new Error('文件大小不能超过 100MB');
        }
    }

    // 图片预览
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                validateImage(file);
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="预览图片">
                        <div class="image-info">
                            <span>${file.name}</span>
                            <span>${formatFileSize(file.size)}</span>
                        </div>
                    `;
                }
                reader.readAsDataURL(file);
            } catch (error) {
                alert(error.message);
                this.value = '';
                imagePreview.innerHTML = '';
            }
        }
    });

    // 资源文件信息显示
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                validateResourceFile(file);
                fileInfo.innerHTML = `
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                        <span class="file-type">${file.type || '未知类型'}</span>
                    </div>
                `;
            } catch (error) {
                alert(error.message);
                this.value = '';
                fileInfo.innerHTML = '';
            }
        }
    });

    // 表单提交
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 验证表单
        if (!imageInput.files[0] || !fileInput.files[0]) {
            alert('请选择需要上传的文件');
            return;
        }

        const formData = new FormData(this);
        submitBtn.disabled = true;
        progressBar.style.display = 'block';

        try {
            const xhr = new XMLHttpRequest();
            
            // 进度监听
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.value = percentComplete;
                    progressText.textContent = `上传进度: ${Math.round(percentComplete)}%`;
                }
            };

            // 完成处理
            xhr.onload = function() {
                if (xhr.status === 201) {
                    alert('资源上传成功！');
                    window.location.href = '/resources';
                } else {
                    const response = JSON.parse(xhr.responseText);
                    alert(response.message || '上传失败，请重试');
                }
                submitBtn.disabled = false;
            };

            // 错误处理
            xhr.onerror = function() {
                alert('上传过程中发生错误，请重试');
                submitBtn.disabled = false;
            };

            xhr.open('POST', '/api/resources', true);
            xhr.send(formData);
        } catch (error) {
            console.error('上传错误:', error);
            alert('上传过程中发生错误，请重试');
            submitBtn.disabled = false;
        }
    });
}); 