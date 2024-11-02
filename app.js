const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userStorage, resourceStorage } = require('./utils/storage');
const auth = require('./middleware/auth');
require('dotenv').config();

const app = express();

// 中间件设置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 添加用户状态中间件
app.use(async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userStorage.findById(decoded.userId);
            if (user) {
                delete user.password; // 删除密码字段
                req.user = user;
            }
        } catch (err) {
            req.user = null;
        }
    }
    next();
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/users', require('./routes/users'));

// 添加我的资源页面路由
app.get('/my-resources', auth, async (req, res) => {
    try {
        const resources = await resourceStorage.getAll();
        const userResources = resources.filter(r => r.author === req.user.id);
        res.render('my-resources', {
            title: '我的资源 - Yumesatmc',
            user: req.user,
            userResources
        });
    } catch (err) {
        res.status(500).render('error', {
            message: '服务器错误',
            user: req.user
        });
    }
});

// 页面路由
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Yumesatmc - Minecraft资源下载',
        user: req.user
    });
});

app.get('/resources', (req, res) => {
    res.render('resources', {
        title: '资源列表 - Yumesatmc',
        user: req.user
    });
});

app.get('/upload', auth, (req, res) => {
    res.render('upload', {
        title: '上传资源 - Yumesatmc',
        user: req.user
    });
});

app.get('/resources/:id', async (req, res) => {
    try {
        const resource = await resourceStorage.findById(req.params.id);
        if (!resource) {
            return res.status(404).render('error', {
                message: '资源不存在',
                user: req.user
            });
        }
        res.render('resource-detail', {
            title: `${resource.title} - Yumesatmc`,
            resource,
            user: req.user
        });
    } catch (err) {
        res.status(500).render('error', {
            message: '服务器错误',
            user: req.user
        });
    }
});

app.get('/profile', auth, async (req, res) => {
    const userResources = await resourceStorage.getAll();
    const filteredResources = userResources.filter(r => r.author === req.user.id);
    const totalDownloads = filteredResources.reduce((sum, r) => sum + r.downloads, 0);

    res.render('profile', {
        title: '个人资料 - Yumesatmc',
        user: req.user,
        userResources: filteredResources,
        totalDownloads
    });
});

// 404 错误处理
app.use((req, res, next) => {
    res.status(404).render('404', {
        title: '页面未找到 - Yumesatmc',
        user: req.user
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // 根据错误类型返回不同的状态码
    const statusCode = err.status || 500;
    const message = statusCode === 500 ? '服务器内部错误' : err.message;

    // 如果是API请求，返回JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(statusCode).json({ 
            error: message 
        });
    }

    // 否则渲染错误页面
    res.status(statusCode).render('error', {
        title: '出错了 - Yumesatmc',
        message: message,
        user: req.user
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 