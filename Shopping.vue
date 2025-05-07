<template>
    <div>
      <!-- 導航欄 -->
      <header class="header">
        <div class="logo">
          <router-link to="/">電商網站</router-link>
        </div>
        <nav>
          <ul>
            <li><router-link to="/">首頁</router-link></li>
            <li><router-link to="/products">商品</router-link></li>
            <li><router-link to="/about">關於我們</router-link></li>
          </ul>
        </nav>
        <div class="cart-icon">
          <router-link to="/cart">
            <i class="fas fa-shopping-cart"></i>
            <span v-show="cartItemCount > 0" class="cart-counter">{{ cartItemCount }}</span>
          </router-link>
        </div>
        <div id="loginStatus">
          <template v-if="isLoggedIn">
            <span>歡迎，{{ memberInfo.name }}</span>
            <router-link to="/member">會員中心</router-link>
            <button @click="logout">登出</button>
          </template>
          <template v-else>
            <router-link to="/login">登入</router-link>
            <router-link to="/register">註冊</router-link>
          </template>
        </div>
      </header>
  
      <!-- 主要內容 -->
      <main>
        <div class="notification" :class="{ active: notification.show }">{{ notification.message }}</div>
  
        <!-- 商品列表部分 -->
        <section id="product-section">
          <h2>商品列表</h2>
          <div id="product-list" class="product-grid">
            <div v-for="product in products" :key="product.id" class="product">
              <img :src="product.image || 'https://via.placeholder.com/150'" :alt="product.name">
              <h3>{{ product.name }}</h3>
              <p class="product-price">NT$ {{ product.price }}</p>
              <p class="product-description">{{ product.description || '' }}</p>
              <button class="add-to-cart-btn" @click="addToCart(product.id)">加入購物車</button>
            </div>
          </div>
        </section>
  
        <!-- 購物車部分 -->
        <section id="cart-section" v-if="showCart">
          <h2>購物車</h2>
          <ul id="cart-items">
            <li v-if="cart.length === 0" class="empty-cart">您的購物車是空的</li>
            <li v-for="item in cart" :key="item.id" class="cart-item">
              <div class="cart-item-details">
                <span class="cart-item-name">{{ item.name }}</span>
                <span class="cart-item-price">NT$ {{ item.price }} x {{ item.quantity }}</span>
              </div>
              <div class="cart-item-actions">
                <button class="quantity-btn" @click="updateCartItemQuantity(item.id, item.quantity - 1)">−</button>
                <span class="item-quantity">{{ item.quantity }}</span>
                <button class="quantity-btn" @click="updateCartItemQuantity(item.id, item.quantity + 1)">+</button>
                <button class="remove-btn" @click="removeFromCart(item.id)">✕</button>
              </div>
              <div class="cart-item-subtotal">NT$ {{ (item.price * item.quantity).toFixed(0) }}</div>
            </li>
          </ul>
          <div class="cart-total">
            <span>總計：</span>
            <span id="total">NT$ {{ totalAmount }}</span>
          </div>
          <div class="cart-actions">
            <button class="clear-cart-btn" @click="clearCart">清空購物車</button>
            <button class="checkout-btn" @click="checkout">結帳</button>
          </div>
        </section>
      </main>
  
      <!-- 頁尾 -->
      <footer>
        <p>&copy; 2025 電商網站. 版權所有.</p>
      </footer>
    </div>
  </template>
  
  <script>
  // 引入身份驗證服務
  import AuthService from './services/AuthService.js';
  
  export default {
    name: 'Shopping',
    data() {
      return {
        // 產品數據
        products: [
          { id: 1, name: "商品 A", price: 299, image: "https://via.placeholder.com/150", description: "這是商品A的詳細描述。" },
          { id: 2, name: "商品 B", price: 399, image: "https://via.placeholder.com/150", description: "這是商品B的詳細描述。" },
          { id: 3, name: "商品 C", price: 499, image: "https://via.placeholder.com/150", description: "這是商品C的詳細描述。" },
          { id: 4, name: "商品 D", price: 599, image: "https://via.placeholder.com/150", description: "這是商品D的詳細描述。" },
          { id: 5, name: "商品 E", price: 699, image: "https://via.placeholder.com/150", description: "這是商品E的詳細描述。" },
        ],
        cart: [],
        isLoggedIn: false,
        memberInfo: null,
        notification: {
          show: false,
          message: ''
        },
        showCart: true,
        CART_STORAGE_KEY: 'cart',
        ORDERS_STORAGE_KEY: 'orders',
        MEMBER_INFO_KEY: 'memberInfo'
      };
    },
    computed: {
      // 計算購物車商品總數
      cartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
      },
      // 計算購物車總金額
      totalAmount() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(0);
      }
    },
    methods: {
      // 添加商品到購物車
      addToCart(productId) {
        try {
          // 獲取產品數據
          const product = this.products.find(p => p.id === productId);
          if (!product) {
            console.error(`找不到ID為 ${productId} 的商品`);
            return;
          }
          
          // 檢查商品是否已在購物車中
          const existingItem = this.cart.find(item => item.id === productId);
          
          if (existingItem) {
            // 如果商品已在購物車中，增加數量
            existingItem.quantity += 1;
          } else {
            // 如果是新商品，添加到購物車
            this.cart.push({
              id: productId,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1
            });
          }
          
          // 保存購物車到本地存儲
          this.saveCartToLocalStorage();
          
          // 添加商品動畫效果
          this.animateAddToCart();
          
          // 提示用戶
          this.showNotification(`已將 ${product.name} 添加到購物車！`);
        } catch (error) {
          console.error('添加商品到購物車時出錯:', error);
        }
      },
      
      // 更新購物車商品數量
      updateCartItemQuantity(productId, newQuantity) {
        try {
          if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
          }
          
          const numId = parseInt(productId);
          const item = this.cart.find(item => item.id == productId || item.id == numId);
          
          if (item) {
            item.quantity = newQuantity;
            this.saveCartToLocalStorage();
          } else {
            console.error(`找不到ID為 ${productId} 的商品`);
          }
        } catch (error) {
          console.error(`更新購物車商品數量出錯:`, error);
        }
      },
      
      // 從購物車移除商品
      removeFromCart(productId) {
        try {
          const numId = parseInt(productId);
          
          // 找到要移除的商品名稱用於通知
          const item = this.cart.find(item => item.id == productId || item.id == numId);
          const itemName = item ? item.name : '商品';
          
          // 使用雙等號進行比較，或將ID轉換為相同類型
          this.cart = this.cart.filter(item => item.id != productId && item.id != numId);
          
          // 保存更新後的購物車
          this.saveCartToLocalStorage();
          
          // 顯示通知
          this.showNotification(`已從購物車移除 ${itemName}`);
        } catch (error) {
          console.error(`移除購物車商品出錯:`, error);
        }
      },
      
      // 清空購物車
      clearCart() {
        try {
          this.cart = [];
          localStorage.removeItem(this.CART_STORAGE_KEY);
          this.showNotification('購物車已清空');
        } catch (error) {
          console.error('清空購物車時出錯:', error);
        }
      },
      
      // 結帳功能
      checkout() {
        try {
          if (this.cart.length === 0) {
            this.showNotification('購物車是空的，無法結帳。');
            return;
          }
          
          // 創建訂單
          const order = {
            id: this.generateOrderId(),
            items: JSON.parse(JSON.stringify(this.cart)),
            totalAmount: parseFloat(this.totalAmount),
            orderDate: new Date().toISOString(),
            status: '待處理',
            memberId: this.memberInfo ? this.memberInfo.id : 'guest'
          };
          
          // 保存訂單到本地存儲
          let orders = JSON.parse(localStorage.getItem(this.ORDERS_STORAGE_KEY)) || [];
          orders.push(order);
          localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(orders));
          
          // 更新會員積分（假設每消費100元獲得10點積分）
          if (this.memberInfo) {
            const pointsEarned = Math.floor(order.totalAmount / 100) * 10;
            this.memberInfo.points = (this.memberInfo.points || 0) + pointsEarned;
            localStorage.setItem(this.MEMBER_INFO_KEY, JSON.stringify(this.memberInfo));
          }
          
          // 清空購物車
          this.clearCart();
          
          // 顯示成功訊息
          this.showNotification('訂單已成功建立！感謝您的購買。');
          
          // 跳轉到訂單確認頁面
          this.$router.push('/orders');
        } catch (error) {
          console.error('結帳過程中出錯:', error);
          this.showNotification('結帳時發生錯誤，請重試。');
        }
      },
      
      // 生成唯一的訂單ID
      generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `ORD-${timestamp}-${random}`;
      },
      
      // 顯示通知訊息
      showNotification(message) {
        this.notification.message = message;
        this.notification.show = true;
        
        // 3秒後隱藏通知
        setTimeout(() => {
          this.notification.show = false;
        }, 3000);
      },
      
      // 加入購物車動畫效果
      animateAddToCart() {
        // 創建一個飛向購物車的動畫元素
        const flyingItem = document.createElement('div');
        flyingItem.style.position = 'fixed';
        flyingItem.style.width = '20px';
        flyingItem.style.height = '20px';
        flyingItem.style.backgroundColor = '#4CAF50';
        flyingItem.style.borderRadius = '50%';
        flyingItem.style.zIndex = '999';
        flyingItem.style.transition = 'all 0.8s ease-in-out';
        
        // 初始位置（中央）
        flyingItem.style.top = '50%';
        flyingItem.style.left = '50%';
        document.body.appendChild(flyingItem);
        
        // 獲取購物車圖標的位置
        const cartIcon = document.querySelector('.cart-icon');
        if (!cartIcon) {
          document.body.removeChild(flyingItem);
          return;
        }
        
        const cartRect = cartIcon.getBoundingClientRect();
        
        // 稍微延遲，以便過渡效果能夠被觸發
        setTimeout(() => {
          // 設置目標位置（購物車圖標）
          flyingItem.style.top = cartRect.top + 'px';
          flyingItem.style.left = cartRect.left + 'px';
          flyingItem.style.opacity = '0';
          flyingItem.style.transform = 'scale(0.3)';
          
          // 動畫結束後移除元素
          setTimeout(() => {
            document.body.removeChild(flyingItem);
          }, 800);
        }, 10);
      },
      
      // 保存購物車到本地存儲
      saveCartToLocalStorage() {
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cart));
      },
      
      // 從本地存儲加載購物車
      loadCartFromLocalStorage() {
        try {
          const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
          if (cartData) {
            this.cart = JSON.parse(cartData);
          }
        } catch (error) {
          console.error('從本地存儲加載購物車時出錯:', error);
        }
      },
      
      // 檢查登入狀態
      checkLoginStatus() {
        const token = localStorage.getItem('token');
        const memberInfoData = localStorage.getItem(this.MEMBER_INFO_KEY);
        
        if (token && memberInfoData) {
          // 已登入
          this.isLoggedIn = true;
          this.memberInfo = JSON.parse(memberInfoData);
        } else {
          // 未登入
          this.isLoggedIn = false;
          this.memberInfo = null;
        }
      },
      
      // 登出功能
      logout() {
        AuthService.logout()
          .then(() => {
            localStorage.removeItem('token');
            this.isLoggedIn = false;
            this.memberInfo = null;
            this.showNotification('已登出');
            this.$router.push('/');
          });
      }
    },
    created() {
      // 頁面加載時初始化
      this.checkLoginStatus();
      this.loadCartFromLocalStorage();
    },
    // 監聽購物車變化
    watch: {
      cart: {
        handler() {
          // 購物車數據發生變化時，更新本地存儲
          this.saveCartToLocalStorage();
        },
        deep: true
      }
    }
  };
  </script>
  
  <style scoped>
  /* 基本樣式 */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Microsoft JhengHei', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f9f9f9;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .logo a {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    text-decoration: none;
  }
  
  nav ul {
    display: flex;
    list-style: none;
  }
  
  nav ul li {
    margin-left: 2rem;
  }
  
  nav ul li a {
    color: #333;
    text-decoration: none;
    transition: all 0.3s;
  }
  
  nav ul li a:hover {
    color: #4CAF50;
  }
  
  .cart-icon {
    position: relative;
    margin-left: 2rem;
  }
  
  .cart-icon a {
    color: #333;
    text-decoration: none;
    font-size: 1.2rem;
  }
  
  .cart-counter {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #4CAF50;
    color: white;
    font-size: 0.8rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  /* 商品列表樣式 */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .product {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .product:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .product img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .product h3 {
    padding: 1rem;
    font-size: 1.2rem;
    margin-bottom: 0;
  }
  
  .product-price {
    padding: 0 1rem;
    font-weight: bold;
    color: #4CAF50;
    margin-bottom: 0.5rem;
  }
  
  .product-description {
    padding: 0 1rem;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
    height: 3em;
    overflow: hidden;
  }
  
  .add-to-cart-btn {
    display: block;
    width: 100%;
    padding: 0.8rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 0 0 8px 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .add-to-cart-btn:hover {
    background-color: #388E3C;
  }
  
  /* 購物車樣式 */
  #cart-section {
    margin-top: 3rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  #cart-items {
    list-style: none;
    margin: 1.5rem 0;
  }
  
  .cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .cart-item-details {
    flex: 2;
  }
  
  .cart-item-name {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .cart-item-price {
    color: #666;
    font-size: 0.9rem;
  }
  
  .cart-item-actions {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .quantity-btn {
    width: 30px;
    height: 30px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .item-quantity {
    margin: 0 10px;
  }
  
  .remove-btn {
    background-color: #f44336;
    color: white;
    border: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
    margin-left: 15px;
  }
  
  .cart-item-subtotal {
    flex: 1;
    text-align: right;
    font-weight: bold;
  }
  
  .empty-cart {
    text-align: center;
    color: #999;
    padding: 2rem 0;
  }
  
  .cart-total {
    display: flex;
    justify-content: space-between;
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #eee;
  }
  
  .cart-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
  
  .clear-cart-btn, .checkout-btn {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
  }
  
  .clear-cart-btn {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .clear-cart-btn:hover {
    background-color: #e0e0e0;
  }
  
  .checkout-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .checkout-btn:hover {
    background-color: #388E3C;
  }
  
  /* 通知樣式 */
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: #4CAF50;
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s, transform 0.3s;
  }
  
  .notification.active {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* 登入狀態樣式 */
  #loginStatus {
    display: flex;
    align-items: center;
  }
  
  #loginStatus span {
    margin-right: 1rem;
    font-size: 0.9rem;
  }
  
  #loginStatus a {
    margin-right: 1rem;
    color: #333;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  #loginStatus a:hover {
    color: #4CAF50;
  }
  
  #loginStatus button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  #loginStatus button:hover {
    background-color: #d32f2f;
  }
  
  /* 頁尾樣式 */
  footer {
    text-align: center;
    margin-top: 3rem;
    padding: 2rem 0;
    background-color: #333;
    color: #fff;
  }
  
  /* 響應式設計 */
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      padding: 1rem;
    }
    
    nav ul {
      margin-top: 1rem;
    }
    
    nav ul li {
      margin-left: 1rem;
      margin-right: 1rem;
    }
    
    .cart-icon {
      margin-top: 1rem;
      margin-left: 0;
    }
    
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .cart-item {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .cart-item-actions, .cart-item-subtotal {
      margin-top: 1rem;
      width: 100%;
    }
    
    .cart-actions {
      flex-direction: column;
    }
    
    .clear-cart-btn {
      margin-bottom: 1rem;
    }
  }
  </style>