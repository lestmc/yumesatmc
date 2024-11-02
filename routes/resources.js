const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { resourceStorage } = require('../utils/storage');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dest = file.fieldname === 'image' ? 'public/images/resources' : 'public/files/resources';
        cb(null, dest);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image') {
        // 允许的图片类型
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件！'), false);
        }
    } else if (file.fieldname === 'file') {
        // 允许的资源文件类型
        const allowedTypes = ['.zip', '.rar', '.7z', '.jar'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型！'), false);
        }
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB限制
        files: 2 // 最多2个文件（图片和资源文件）
    },
    fileFilter: fileFilter
});

// 获取所有资源
router.get('/', async (req, res) => {
    try {
        const { category, sort, search, page = 1, limit = 12 } = req.query;
        let resources = await resourceStorage.getAll();

        // 应用过滤器
        if (category) {
            resources = resources.filter(r => r.category === category);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            resources = resources.filter(r => 
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower)
            );
        }

        // 应用排序
        if (sort === 'downloads') {
            resources.sort((a, b) => b.downloads - a.downloads);
        } else if (sort === 'name') {
            resources.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            // 默认按最新排序
            resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = resources.length;
        resources = resources.slice(startIndex, endIndex);

        res.json({
            resources,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 上传新资源
router.post('/', auth, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files || !req.files.image || !req.files.file) {
            return res.status(400).json({ message: '请上传所需的文件' });
        }

        const resource = await resourceStorage.create({
            title: req.body.title,
            description: req.body.description,
            author: req.user.id,
            authorName: req.user.username,
            imageUrl: '/images/resources/' + req.files.image[0].filename,
            fileUrl: '/files/resources/' + req.files.file[0].filename,
            category: req.body.category,
            version: req.body.version
        });

        res.status(201).json(resource);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 下载资源
router.get('/:id/download', async (req, res) => {
    try {
        const resource = await resourceStorage.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: '资源不存在' });
        }

        // 增加下载次数
        await resourceStorage.incrementDownloads(req.params.id);

        // 发送文件
        const filePath = path.join(__dirname, '../public', resource.fileUrl);
        res.download(filePath);
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除资源
router.delete('/:id', auth, async (req, res) => {
    try {
        const resource = await resourceStorage.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: '资源不存在' });
        }

        if (resource.author !== req.user.id) {
            return res.status(403).json({ message: '无权限删除' });
        }

        // 删除文件
        const imagePath = path.join(__dirname, '../public', resource.imageUrl);
        const filePath = path.join(__dirname, '../public', resource.fileUrl);
        
        try {
            await fs.unlink(imagePath);
            await fs.unlink(filePath);
        } catch (err) {
            console.error('文件删除失败:', err);
        }

        await resourceStorage.delete(req.params.id);
        res.json({ message: '资源已删除' });
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 重新提交资源
router.post('/:id/resubmit', auth, async (req, res) => {
    try {
        const resource = await resourceStorage.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: '资源不存在' });
        }

        if (resource.author !== req.user.id) {
            return res.status(403).json({ message: '无权限操作' });
        }

        const updatedResource = await resourceStorage.resubmit(req.params.id);
        res.json(updatedResource);
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 