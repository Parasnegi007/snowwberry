const WISHLIST_API = "https://snowberry.onrender.com/api/users/wishlist"; 
const CART_API = "https://snowberry.onrender.com/api/users/cart"; 

document.addEventListener("DOMContentLoaded", async () => {
    const categoryName = document.body.getAttribute("data-category"); // Get category from HTML
    if (!categoryName) {
        console.error("❌ No category specified in HTML.");
        return;
    }

    try {
        // Fetch categories to get the correct ID
        const categoryResponse = await fetch("https://snowberry.onrender.com/api/categories");
        if (!categoryResponse.ok) throw new Error("Failed to fetch categories");

        const categories = await categoryResponse.json();
        const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

        if (!category) {
            console.error("❌ Category not found:", categoryName);
            return;
        }

        console.log("✅ Found Category ID:", category._id);

        // Fetch products based on the category ID
        const productResponse = await fetch(`https://snowberry.onrender.com/api/products/category/${category._id}`);
        if (!productResponse.ok) throw new Error("Failed to fetch products");

        const products = await productResponse.json();
        displayProducts(products);
    } catch (error) {
        console.error("❌ Error loading products:", error);
    }
});

// Function to display products in the grid
function displayProducts(products) {
    const productsContainer = document.getElementById("productsContainer"); 

    if (!productsContainer) {
        console.error("❌ Product grid not found in HTML.");
        return;
    }

    productsContainer.innerHTML = ""; // Clear previous content

    if (products.length === 0) {
        productsContainer.innerHTML = "<p>No products available.</p>";
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product"; // ✅ Matches CSS

        productCard.innerHTML = `
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">₹${product.price}</p>
            <div class="product-buttons">
                <button class="add-to-cart" onclick="addToCart('${product._id}')">🛒 Add to Cart</button>
                <button class="add-to-wishlist" onclick="addToWishlist('${product._id}')">❤️</button>
            </div>
        `;

        productsContainer.appendChild(productCard);
    });
}


// 🛒 Function to add item to Cart (Guest & Logged-in Users)
async function addToCart(productId) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        // Guest user - store in localStorage
        let cart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const itemIndex = cart.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += 1;
        } else {
            cart.push({ productId, quantity: 1 });
        }

        localStorage.setItem("guestCart", JSON.stringify(cart));
        updateCartCount();
        alert("Added to cart! 🛒");
        return;
    }

    // Logged-in user - store in backend
    try {
        const response = await fetch(CART_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const data = await response.json();
        if (response.ok) {
            updateCartCount();
            alert("Added to Cart! 🛒");
        } else {
            alert(data.message || "Error adding to cart");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

// ❤️ Function to add item to Wishlist (Guest & Logged-in Users)
// ❤️ Function to add item to Wishlist (Guest & Logged-in Users)
async function addToWishlist(productId) {
    const token = localStorage.getItem("authToken");
    const WISHLIST_API = "https://snowberry.onrender.com/api/users/wishlist"; // ✅ Ensure API is defined

    if (!token) {
        // Guest user - store in localStorage
        let wishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem("guestWishlist", JSON.stringify(wishlist));
            alert("✅ Added to Wishlist! ❤️"); // ✅ Now shows alert
        }
        return;
    }

    // Logged-in user - store in backend
    try {
        const response = await fetch(WISHLIST_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("✅ Added to Wishlist! ❤️"); // ✅ Now shows alert
        } else {
            console.error("❌ Server Error:", data.message || "Error adding to wishlist");
            alert(data.message || "❌ Error adding to wishlist");
        }
    } catch (error) {
        console.error("❌ Error adding to wishlist:", error);
        alert("❌ Failed to add to wishlist. Please try again.");
    }
}
