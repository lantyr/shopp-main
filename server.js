const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

// 建立 Express 應用
const app = express();

// 中間件設置
app.use(cors({
  origin: '*',  // 允許所有來源，開發環境中使用
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// JWT 密鑰
const JWT_SECRET = 'your_jwt_secret_key';

// 模擬資料庫的用戶陣列
const users = [];

// 註冊 API 端點
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 檢查用戶名是否已存在
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: '用戶名已經存在' });
    }
    
    // 檢查電子郵件是否已存在
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: '電子郵件已經被使用' });
    }
    
    // 對密碼進行加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 創建新用戶
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    };
    
    // 將用戶添加到陣列中
    users.push(newUser);
    
    // 返回成功訊息
    res.status(201).json({ message: '註冊成功' });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入 API 端點
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用戶
    const user = users.find(user => user.username === username);
    
    // 如果用戶不存在
    if (!user) {
      return res.status(401).json({ message: '用戶名或密碼錯誤' });
    }
    
    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用戶名或密碼錯誤' });
    }
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 返回 token
    res.json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 保護的路由 - 獲取用戶資料
app.get('/api/profile', authenticateToken, (req, res) => {
  // 這裡會從 authenticateToken 中間件中獲取 user
  res.json({ user: req.user.username });
});

// 驗證 JWT 的中間件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供身份驗證令牌' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '令牌無效或已過期' });
    }
    
    req.user = user;
    next();
  });
}

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器運行在端口 ${PORT}`);
});