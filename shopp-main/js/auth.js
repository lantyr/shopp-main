function getToken() {
    return localStorage.getItem('token');
  }
  
  async function checkAuth() {
    const token = getToken();
    if (!token) {
      alert('請先登入或註冊');
      window.location.href = 'register.html';
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3000/api/profile', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
  
      if (!res.ok) {
        // 失敗：可能是註冊過但 token 失效，或根本沒註冊
        const data = await res.json();
        if (data.message === 'Token 無效') {
          alert('請重新登入或註冊');
          localStorage.removeItem('token');
          window.location.href = 'register.html'; // ✅ 導向註冊頁
        } else {
          alert('請重新登入');
          localStorage.removeItem('token');
          window.location.href = 'login.html';
        }
      }
    } catch (err) {
      console.error('驗證失敗', err);
      alert('伺服器錯誤，請稍後再試');
      window.location.href = 'login.html';
    }
  }
  