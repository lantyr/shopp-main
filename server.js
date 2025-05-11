const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('测试成功');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});