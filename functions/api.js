const express = require('express');
const serverless = require('serverless-http');
const app = express();
const { userStorage, resourceStorage } = require('../utils/storage');

// 中间件配置
app.use(express.json());

// API 路由
app.get('/.netlify/functions/api', (req, res) => {
  res.json({ message: 'API is working' });
});

// 用户认证路由
app.use('/.netlify/functions/api/auth', require('../routes/auth'));

// 资源路由
app.use('/.netlify/functions/api/resources', require('../routes/resources'));

// 用户路由
app.use('/.netlify/functions/api/users', require('../routes/users'));

// 导出处理函数
module.exports.handler = serverless(app); 