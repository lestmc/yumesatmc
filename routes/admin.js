const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { resourceStorage } = require('../utils/storage');

// 管理员权限中间件
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};

// 获取待审核资源列表
router.get('/pending-resources', auth, isAdmin, async (req, res) => {
    try {
        const resources = await resourceStorage.getAll();
        const pendingResources = resources.filter(r => r.status === 'pending');
        res.json(pendingResources);
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 审核资源
router.post('/review/:id', auth, isAdmin, async (req, res) => {
    try {
        const { status, comment } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: '无效的状态' });
        }

        const resource = await resourceStorage.updateStatus(req.params.id, status, comment);
        if (!resource) {
            return res.status(404).json({ message: '资源不存在' });
        }

        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 