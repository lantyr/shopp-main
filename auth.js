// 檢查用戶是否已登入
function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('請先登入');
      window.location.href = 'login.html';
      return false;
    }
    
    return true;
  }
  
  // 載入用戶資訊
  function loadUserInfo() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }
    
    fetch('http://localhost:3000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('未授權');
      }
      return response.json();
    })
    .then(data => {
      const userGreeting = document.getElementById('user-greeting');
      if (userGreeting) {
        userGreeting.textContent = `歡迎，${data.user}！`;
      }
    })
    .catch(error => {
      console.error('載入用戶資訊錯誤:', error);
      // 如果獲取用戶資訊失敗，可能是令牌已過期，清除令牌並重定向到登入頁面
      if (error.message === '未授權') {
        logout();
      }
    });
  }
  
  // 登出函數
  function logout() {
    localStorage.removeItem('token');
    alert('已登出');
    window.location.href = 'login.html';
  }