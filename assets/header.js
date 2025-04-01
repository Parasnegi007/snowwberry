function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (!cartCountElement) return;

    const token = localStorage.getItem("authToken");
    
    if (token) {
        fetch("https://snowberry.vercel.app/api/users/cart", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(cart => {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalQuantity;
        })
        .catch(error => console.error("❌ Error fetching cart count:", error));
    } else {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalQuantity;
    }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = cart.length;
    document.querySelector('.cart-count').innerText = count;
}


// Call on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
