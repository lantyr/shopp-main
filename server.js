// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error.message, error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 导入模块
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

// 创建Express应用
const app = express();

// 中间件设置
app.use(cors({
  origin: '*', // 允许所有来源，或指定允许的域名
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 导入路由
//const userRoutes = require('./routes/users');
//const productRoutes = require('./routes/products');
//const orderRoutes = require('./routes/orders');

// 使用路由
//app.use('/api/users', userRoutes);
//app.use('/api/products', productRoutes);
//app.use('/api/orders', orderRoutes);

// JWT密钥
const JWT_SECRET = 'your_jwt_secret_key';

// 模拟数据库的用户数组
const users = [];

// 注册API端点
app.post('/api/register', async (req, res) => {
  // ...注册逻辑
});

// 登录API端点
app.post('/api/login', async (req, res) => {
  // ...登录逻辑
});

// 设置主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 设置其他HTML页面路由
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'products.html'));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});