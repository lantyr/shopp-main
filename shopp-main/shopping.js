// 檔案: shopping.js
// 產品數據 - 可以擴展更多商品
// 檔案: shopping.js
// 產品數據 - 可以擴展更多商品
const products = [
    { id: 1, name: "商品 A", price: 299, image: "/public/images/b.jpg", description: "描述。" },
    { id: 2, name: "商品 B", price: 399, image: "/public/images/chicken.jpg", description: "這是商品B的詳細描述。" },
    { id: 3, name: "商品 C", price: 499, image: "/public/images/ORANGE.webp", description: "這是商品C的詳細描述。" },
    { id: 4, name: "商品 D", price: 599, image: "/public/images/RoastChicken.webp", description: "這是商品D的詳細描述。" },
    { id: 5, name: "商品 E", price: 699, image: "/public/images/s.webp", description: "這是商品E的詳細描述。" },
  ];

// 全局變數
const CART_STORAGE_KEY = 'cart'; // 統一購物車的儲存鍵名
const ORDERS_STORAGE_KEY = 'orders';
const MEMBER_INFO_KEY = 'memberInfo';

// 顯示產品列表
function displayProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  
  // 清空現有內容
  productList.innerHTML = '';
  
  products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `
          <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p class="product-price">NT$ ${product.price}</p>
          <p class="product-description">${product.description || ''}</p>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id})">加入購物車</button>
      `;
      productList.appendChild(div);
  });
}

// 添加商品到購物車
function addToCart(productId) {
  try {
      // 獲取產品數據
      const product = products.find(p => p.id === productId);
      if (!product) {
          console.error(`找不到ID為 ${productId} 的商品`);
          return;
      }
      
      // 獲取當前購物車
      let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      
      // 檢查商品是否已在購物車中
      const existingItem = cart.find(item => item.id === productId);
      
      if (existingItem) {
          // 如果商品已在購物車中，增加數量
          existingItem.quantity += 1;
      } else {
          // 如果是新商品，添加到購物車
          cart.push({
              id: productId,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1
          });
      }
      
      // 保存購物車到本地存儲
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      
      // 添加商品動畫效果
      animateAddToCart();
      
      // 提示用戶
      showNotification(`已將 ${product.name} 添加到購物車！`);
      
      // 更新購物車計數器
      updateCartCounter();
      
      // 更新購物車顯示
      renderCart();
  } catch (error) {
      console.error('添加商品到購物車時出錯:', error);
  }
}

// 顯示通知訊息
function showNotification(message) {
  // 檢查是否已有通知元素
  let notification = document.getElementById('notification');
  
  // 如果沒有，創建一個
  if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.padding = '10px';
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      notification.style.borderRadius = '4px';
      notification.style.zIndex = '1000';
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease-in-out';
      document.body.appendChild(notification);
  }
  
  // 設置通知內容並顯示
  notification.textContent = message;
  notification.style.opacity = '1';
  
  // 3秒後隱藏通知
  setTimeout(() => {
      notification.style.opacity = '0';
  }, 3000);
}

// 加入購物車動畫效果
function animateAddToCart() {
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
}

// 更新購物車計數器
function updateCartCounter() {
  try {
      const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      // 更新所有購物車計數器元素
      const counterElems = document.querySelectorAll('.cart-counter, #cart-count');
      counterElems.forEach(elem => {
          if (elem) {
              elem.textContent = totalItems;
              elem.style.display = totalItems > 0 ? 'inline-block' : 'none';
          }
      });
      
      // 同步購物車狀態到其他頁面
      broadcastCartUpdate();
  } catch (error) {
      console.error('更新購物車計數器時出錯:', error);
  }
}

// 廣播購物車更新
function broadcastCartUpdate() {
  // 觸發 storage 事件，讓其他頁面知道購物車已更新
  // 這可以通過先移除購物車再重新設置來實現
  const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  // 也可以使用 localStorage 中的一個特殊鍵來標記更新時間
  localStorage.setItem('cartLastUpdated', new Date().toISOString());
}

// 更新購物車商品數量
function updateCartItemQuantity(productId, newQuantity) {
  try {
      console.log(`正在更新商品ID: ${productId}, 新數量: ${newQuantity}`);
      
      if (newQuantity <= 0) {
          removeFromCart(productId);
          return;
      }
      
      let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      
      // 使用雙等號進行比較，或將ID轉換為相同類型
      const numId = parseInt(productId);
      const item = cart.find(item => item.id == productId || item.id == numId);
      
      if (item) {
          item.quantity = newQuantity;
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
          
          // 更新購物車顯示
          renderCart();
          
          // 更新購物車計數器
          updateCartCounter();
          
          console.log(`更新成功`);
      } else {
          console.error(`找不到ID為 ${productId} 的商品`);
      }
  } catch (error) {
      console.error(`更新購物車商品數量出錯:`, error);
  }
}

// 移除購物車中的商品
function removeFromCart(productId) {
  try {
      console.log(`正在刪除商品ID: ${productId}`);
      
      let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      const numId = parseInt(productId);
      
      // 找到要移除的商品名稱用於通知
      const item = cart.find(item => item.id == productId || item.id == numId);
      const itemName = item ? item.name : '商品';
      
      // 使用雙等號進行比較，或將ID轉換為相同類型
      cart = cart.filter(item => item.id != productId && item.id != numId);
      
      // 保存更新後的購物車
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      
      // 顯示通知
      showNotification(`已從購物車移除 ${itemName}`);
      
      // 更新購物車顯示
      renderCart();
      
      // 更新購物車計數器
      updateCartCounter();
      
      console.log(`刪除成功`);
  } catch (error) {
      console.error(`移除購物車商品出錯:`, error);
  }
}

// 清空購物車
function clearCart() {
  try {
      localStorage.removeItem(CART_STORAGE_KEY);
      
      // 更新購物車顯示
      renderCart();
      
      // 更新購物車計數器
      updateCartCounter();
      
      // 顯示通知
      showNotification('購物車已清空');
  } catch (error) {
      console.error('清空購物車時出錯:', error);
  }
}

// 計算購物車總金額
function calculateCartTotal() {
  try {
      const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  } catch (error) {
      console.error('計算購物車總金額時出錯:', error);
      return 0;
  }
}

// 生成唯一的訂單ID
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

// 結帳功能
function checkout() {
  try {
      const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      
      if (cart.length === 0) {
          showNotification('購物車是空的，無法結帳。');
          return;
      }
      
      // 獲取會員資料，如果已登入
      const memberInfo = JSON.parse(localStorage.getItem(MEMBER_INFO_KEY));
      const memberId = memberInfo ? memberInfo.id : 'guest';
      
      // 創建訂單
      const order = {
          id: generateOrderId(),
          items: cart,
          totalAmount: calculateCartTotal(),
          orderDate: new Date().toISOString(),
          status: '待處理',
          memberId: memberId
      };
      
      // 保存訂單到本地存儲
      let orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
      orders.push(order);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      
      // 更新會員積分（假設每消費100元獲得10點積分）
      if (memberInfo) {
          const pointsEarned = Math.floor(order.totalAmount / 100) * 10;
          memberInfo.points = (memberInfo.points || 0) + pointsEarned;
          localStorage.setItem(MEMBER_INFO_KEY, JSON.stringify(memberInfo));
      }
      
      // 清空購物車
      localStorage.removeItem(CART_STORAGE_KEY);
      
      // 顯示成功訊息
      showNotification('訂單已成功建立！感謝您的購買。');
      
      // 更新購物車顯示
      renderCart();
      
      // 更新購物車計數器
      updateCartCounter();
      
      // 跳轉到訂單確認頁面
      window.location.href = 'orders.html';
  } catch (error) {
      console.error('結帳過程中出錯:', error);
      showNotification('結帳時發生錯誤，請重試。');
  }
}

// 顯示購物車內容
function renderCart() {
  try {
      const cartItems = document.getElementById('cart-items');
      const totalDisplay = document.getElementById('total');
      
      if (!cartItems || !totalDisplay) return;
      
      // 清空購物車列表
      cartItems.innerHTML = '';
      
      // 獲取購物車數據
      const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
      
      if (cart.length === 0) {
          cartItems.innerHTML = '<p class="empty-cart">您的購物車是空的</p>';
      } else {
          // 遍歷購物車項目並添加到列表
          cart.forEach(item => {
              const li = document.createElement('li');
              li.className = 'cart-item';
              li.innerHTML = `
                  <div class="cart-item-details">
                      <span class="cart-item-name">${item.name}</span>
                      <span class="cart-item-price">NT$ ${item.price} x ${item.quantity}</span>
                  </div>
                  <div class="cart-item-actions">
                      <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">−</button>
                      <span class="item-quantity">${item.quantity}</span>
                      <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                      <button class="remove-btn" onclick="removeFromCart('${item.id}')">✕</button>
                  </div>
                  <div class="cart-item-subtotal">NT$ ${(item.price * item.quantity).toFixed(0)}</div>
              `;
              cartItems.appendChild(li);
          });
      }
      
      // 更新總金額
      const total = calculateCartTotal();
      totalDisplay.textContent = total.toFixed(0);
  } catch (error) {
      console.error('渲染購物車時出錯:', error);
  }
}

// 監聽購物車變化
function syncWithCart() {
  window.addEventListener('storage', function(event) {
      // 檢查是否是購物車相關的變化
      if (event.key === CART_STORAGE_KEY || event.key === 'cartLastUpdated') {
          // 更新購物車計數器
          updateCartCounter();
          
          // 更新購物車顯示
          renderCart();
      }
  });
}

// 檢查登入狀態
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const memberInfo = JSON.parse(localStorage.getItem(MEMBER_INFO_KEY));
  
  // 獲取頁面上的登入狀態顯示元素
  const loginStatusElem = document.getElementById('loginStatus');
  
  if (token && memberInfo) {
      // 已登入
      if (loginStatusElem) {
          loginStatusElem.innerHTML = `
              <span>歡迎，${memberInfo.name}</span>
              <a href="member.html">會員中心</a>
              <button onclick="logout()">登出</button>
          `;
      }
      return true;
  } else {
      // 未登入
      if (loginStatusElem) {
          loginStatusElem.innerHTML = `
              <a href="login.html">登入</a>
              <a href="register.html">註冊</a>
          `;
      }
      return false;
  }
}

// 登出功能
function logout() {
  localStorage.removeItem('token');
  showNotification('已登出');
  
  // 重新整理頁面或跳轉到首頁
  window.location.href = 'index.html';
}

// 頁面載入後執行的初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('shopping.js 已加載');
  
  // 檢查登入狀態
  checkLoginStatus();
  
  // 顯示產品列表
  displayProducts();
  
  // 更新購物車計數器
  updateCartCounter();
  
  // 初始化購物車顯示
  renderCart();
  
  // 監聽購物車變化
  syncWithCart();
});