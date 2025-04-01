// ✅ Ensure cart is loaded when the page loads
document.addEventListener("DOMContentLoaded", loadCart);

// ✅ Function to Load Cart Data
async function loadCart() {
    const token = localStorage.getItem("authToken");
    let cart = [];

    if (token) {
        // Fetch cart from backend for logged-in users
        try {
            const response = await fetch("https://snowberry.onrender.com/api/users/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });
            cart = await response.json();
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    } else {
        // Load guest cart from localStorage
        cart = JSON.parse(localStorage.getItem("guestCart")) || [];

        if (!token) {
            // Fetch product details for each item
            const productPromises = cart.map(async item => {
                const response = await fetch(`https://snowberry.onrender.com/api/products/${item.productId}`);

                const product = await response.json();
                return { ...item, name: product.name, price: product.price, image: product.image };
            });
        
            cart = await Promise.all(productPromises);
        }
        
    }

    displayCart(cart);
    updateCartCounter(cart);
}

// ✅ Function to Display Cart Items
function displayCart(cart) {
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    cartContainer.innerHTML = "";
    let totalAmount = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.innerText = "0.00";
        return;
    }

    cart.forEach(item => {
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        let cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
             <img src="${item.image}" alt="${item.name}" class="cart-img">
            <div class="cart-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-price">₹${item.price} </p>
                <div class="cart-actions">
                    <button class="cart-btn-minus" onclick="updateCartQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                    <span class="cart-quantity">${item.quantity}</span>
                    <button class="cart-btn-plus" onclick="updateCartQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                    <button class="cart-btn-remove" onclick="removeFromCart('${item.productId}')">Remove</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    cartTotal.innerText = totalAmount.toFixed(2);
}

// ✅ Function to Update Cart Quantity
async function updateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    const token = localStorage.getItem("authToken");
    if (token) {
        try {
            await fetch(`https://snowberry.onrender.com/api/users/cart/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            loadCart();
        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    } else {
        let cart = JSON.parse(localStorage.getItem("guestCart")) || [];
        cart = cart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item);
        localStorage.setItem("guestCart", JSON.stringify(cart));
        loadCart();
    }
}

// ✅ Function to Remove Item from Cart
async function removeFromCart(productId) {
    const token = localStorage.getItem("authToken");
    if (token) {
        try {
            await fetch(`https://snowberry.onrender.com/api/users/cart/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            loadCart();
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    } else {
        let cart = JSON.parse(localStorage.getItem("guestCart")) || [];
        cart = cart.filter(item => item.productId !== productId);
        localStorage.setItem("guestCart", JSON.stringify(cart));
        loadCart();
    }
}

// ✅ Function to Update Cart Counter
function updateCartCounter(cart) {
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").innerText = totalItems || "";
}
// Log cart data from localStorage
let cart = JSON.parse(localStorage.getItem("guestCart")) || [];
console.log("🚗 Cart Data from localStorage:", cart);

// If cart is empty, log an alert
if (cart.length === 0) {
    console.log("No cart data found in localStorage.");
}

// Log each cart item to inspect the structure
cart.forEach(item => {
    console.log("🛍️ Cart Item Details:", item);
});
