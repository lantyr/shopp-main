// auth.js - 橋接文件
import AuthService from './AuthService.js';

// 為了向後兼容，仍然暴露原始的全局函數
window.checkAuth = function() {
  return AuthService.checkAuth();
};

window.loadUserInfo = function() {
  return AuthService.loadUserInfo();
};

window.logout = function() {
  return AuthService.logout();
};