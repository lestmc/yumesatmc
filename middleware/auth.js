const jwt = require('jsonwebtoken');
const { userStorage } = require('../utils/storage');

module.exports = async function(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: '无访问权限' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userStorage.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }
        delete user.password;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: '无效的token' });
    }
}; 