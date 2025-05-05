// 檔案: js/shopping.js
// 產品數據

const products = [
    { id: 1, name: "商品 A", price: 299, image: "" },
    { id: 2, name: "商品 B", price: 399, image: "" },
    { id: 3, name: "商品 C", price: 499, image: "" },
];

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
            <img src="${product.image || ''}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>價格：$${product.price}</p>
            <button onclick="addToCart(${product.id})">加入購物車</button>
        `;
        productList.appendChild(div);
    });
}

// 添加商品到購物車
function addToCart(productId) {
    // 獲取產品數據
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // 獲取當前購物車
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
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
            quantity: 1
        });
    }
    
    // 保存購物車到本地存儲
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    // 提示用戶
    alert(`已將 ${product.name} 添加到購物車！`);
    
    // 更新購物車計數器
    updateCartCounter();
    
    // 更新購物車顯示
    renderCart();
}

// 更新購物車計數器
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // 如果頁面上有購物車計數器元素，更新它
    const counterElem = document.getElementById('cartCounter');
    if (counterElem) {
        counterElem.textContent = totalItems;
        counterElem.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// 更新購物車商品數量
function updateCartItemQuantity(productId, newQuantity) {
    try {
        console.log(`正在更新商品ID: ${productId}, 新數量: ${newQuantity}`);
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        
        // 使用雙等號進行比較，或將ID轉換為相同類型
        const numId = parseInt(productId);
        const item = cart.find(item => item.id == productId || item.id == numId);
        
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            
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
        
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const numId = parseInt(productId);
        
        // 使用雙等號進行比較，或將ID轉換為相同類型
        cart = cart.filter(item => item.id != productId && item.id != numId);
        
        // 保存更新後的購物車
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        
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
    localStorage.removeItem('shoppingCart');
    
    // 更新購物車顯示
    renderCart();
    
    // 更新購物車計數器
    updateCartCounter();
}

// 計算購物車總金額
function calculateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// 結帳功能
function checkout() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    if (cart.length === 0) {
        alert('購物車是空的，無法結帳。');
        return;
    }
    
    // 創建訂單
    const order = {
        id: 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        items: cart,
        totalAmount: calculateCartTotal(),
        orderDate: new Date().toISOString(),
        status: '待處理'
    };
    
    // 保存訂單到本地存儲
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // 清空購物車
    localStorage.removeItem('shoppingCart');
    
    alert('訂單已成功建立！感謝您的購買。');
    
    // 更新購物車顯示
    renderCart();
    
    // 更新購物車計數器
    updateCartCounter();
    
    // 跳轉到訂單確認頁面
    window.location.href = 'orders.html';
}

// 顯示購物車內容
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('total');
    
    if (!cartItems || !totalDisplay) return;
    
    // 清空購物車列表
    cartItems.innerHTML = '';
    
    // 獲取購物車數據
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    // 遍歷購物車項目並添加到列表
    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} x ${item.quantity} - $${item.price * item.quantity}
            <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
            <button onclick="removeFromCart('${item.id}')">刪除</button>
        `;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });
    
    // 更新總金額
    totalDisplay.textContent = total;
}

// 當頁面加載時執行
document.addEventListener('DOMContentLoaded', function() {
    console.log('shopping.js 已加載');
    
    // 更新購物車計數器
    updateCartCounter();
    
    // 初始化購物車顯示
    renderCart();
});