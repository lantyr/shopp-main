// UserStatus.vue
<template>
  <div id="loginStatus" v-if="isInitialized">
    <div v-if="isLoggedIn">
      <span>歡迎，{{ username }}</span>
      <a href="member.html">會員中心</a>
      <button @click="logout">登出</button>
    </div>
    <div v-else>
      <a href="login.html">登入</a>
      <a href="register.html">註冊</a>
    </div>
  </div>
</template>

<script>
import AuthService from './AuthService.js';

export default {
  name: 'UserStatus',
  data() {
    return {
      isLoggedIn: false,
      username: '',
      isInitialized: false
    }
  },
  created() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      const memberInfo = JSON.parse(localStorage.getItem('memberInfo'));
      
      if (token && memberInfo) {
        this.isLoggedIn = true;
        this.username = memberInfo.name;
        
        // 更新從服務器獲取的資訊
        AuthService.loadUserInfo().then(data => {
          if (data && data.user) {
            this.username = data.user;
          }
        });
      } else {
        this.isLoggedIn = false;
      }
      
      this.isInitialized = true;
    },
    logout() {
      AuthService.logout();
    }
  }
}
</script>