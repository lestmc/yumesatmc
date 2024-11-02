const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { userStorage } = require('../utils/storage');

// 注册路由
router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('用户名至少需要3个字符'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('密码确认不匹配');
        }
        return true;
    })
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 检查用户是否已存在
        const existingUser = await userStorage.findByEmail(req.body.email);
        if (existingUser) {
            return res.status(400).json({ message: '邮箱已被注册' });
        }

        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 创建新用户
        const user = await userStorage.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        // 创建JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 设置cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24小时
        });

        // 返回成功消息
        res.status(201).json({ message: '注册成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录路由
router.post('/login', [
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').exists().withMessage('请输入密码')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 查找用户
        const user = await userStorage.findByEmail(req.body.email);
        if (!user) {
            return res.status(400).json({ message: '用户不存在' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }

        // 创建JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 设置cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ message: '登录成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登出路由
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: '已登出' });
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ user: null });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userStorage.findById(decoded.userId);
        if (!user) {
            return res.json({ user: null });
        }

        delete user.password;
        res.json({ user });
    } catch (err) {
        res.json({ user: null });
    }
});

module.exports = router; 