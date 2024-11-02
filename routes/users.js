const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { userStorage, resourceStorage } = require('../utils/storage');

// 配置头像上传
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/avatars');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
    fileFilter: function(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('只允许上传图片文件！'), false);
        }
        cb(null, true);
    }
});

// 获取个人资料页面
router.get('/profile', auth, async (req, res) => {
    try {
        const userResources = await resourceStorage.getAll();
        const filteredResources = userResources.filter(r => r.author === req.user.id);
        const totalDownloads = filteredResources.reduce((sum, r) => sum + r.downloads, 0);

        res.render('profile', {
            title: '个人资料 - Yumesatmc',
            user: req.user,
            userResources: filteredResources,
            totalDownloads
        });
    } catch (err) {
        res.status(500).render('error', {
            message: '服务器错误',
            user: req.user
        });
    }
});

// 更新个人资料
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await userStorage.findById(req.user.id);

        // 如果要更改密码
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: '当前密码错误' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }

        if (username) {
            user.username = username;
        }

        await userStorage.update(user.id, user);
        res.json({ message: '个人资料更新成功' });
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 上传头像
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的头像' });
        }

        const avatarUrl = '/images/avatars/' + req.file.filename;
        await userStorage.update(req.user.id, { avatar: avatarUrl });

        res.json({ message: '头像更新成功', avatarUrl });
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 