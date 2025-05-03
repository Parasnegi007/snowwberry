document.addEventListener("DOMContentLoaded", function () {

    async function loadCategories() {
        try {
            const response = await fetch("https://snowberry.onrender.com/api/categories");
            if (!response.ok) throw new Error("Failed to fetch categories");
    
            const categories = await response.json();
            const categoryGrid = document.querySelector(".category-grid");
    
            categoryGrid.innerHTML = ""; // Clear previous content
    
            categories.forEach(category => {
                const categoryItem = document.createElement("div");
                categoryItem.classList.add("category-item");
                
                // ✅ Make whole tile clickable
                categoryItem.addEventListener("click", () => {
                    window.location.href = `${category.slug}.html`;
                });
    
                categoryItem.innerHTML = `
                    <img src="${category.image}" alt="${category.name}">
                    <h3>${category.name}</h3>
                    <p>${category.description || "No description available."}</p>
                `;
    
                categoryGrid.appendChild(categoryItem);
            });
    
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }
    
    document.addEventListener("DOMContentLoaded", loadCategories);
    

// ✅ Call this function when the page loads
window.addEventListener("DOMContentLoaded", loadCategories);
async function checkForCategoryFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("category");

    if (categoryId) {
        loadProducts(categoryId); // ✅ Fetch products for this category only
    }
}

window.addEventListener("DOMContentLoaded", checkForCategoryFilter);
});




document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("https://snowberry.onrender.com/api/products/featured");
        const featuredProducts = await response.json();

        if (featuredProducts.length > 0) {
            displayFeaturedProducts(featuredProducts);
        } else {
            console.warn("No featured products available.");
        }
    } catch (error) {
        console.error("Error fetching featured products:", error);
    }
});

function displayFeaturedProducts(products) {
    const featuredList = document.getElementById("featured-list");
    featuredList.innerHTML = ""; // Clear existing content

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
         <img src="${product.image}" alt="${product.name}">

            <h3>${product.name}</h3>
            
             <p>
                            <span class="mrp">₹${product.mrp}</span>
                            <span class="price">₹${product.price}</span>
                        </p>
            <button class="buy-now-btn" data-id="${product._id}">Buy Now</button>
             <button class="cart-btn" data-id="${product._id}">
                                <i class="fas fa-shopping-cart"></i> <!-- Font Awesome Cart Icon -->
                            </button>
        `;
        featuredList.appendChild(productCard);
    });
// 🛒 Function to add item to Cart (Guest & Logged-in Users)
async function addToCart(productId, redirectToCheckout = false) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        // Guest userin localStorage
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

        if (redirectToCheckout) {
            window.location.href = "checkout.html"; // Redirect guest user to checkout
        }
        return;
    }

    // Logged-in userin backend
    try {
        const response = await fetch( "https://snowberry.onrender.com/api/users/cart", {
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

            if (redirectToCheckout) {
                window.location.href = "checkout.html"; // Redirect logged-in user to checkout
            }
        } else {
            alert(data.message || "Error adding to cart");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

             // Bind "Buy Now" button click event
             document.querySelectorAll(".buy-now-btn").forEach(button => {
                button.addEventListener("click", function () {
                    const productId = this.dataset.id;
                    addToCart(productId, true); // Add product to cart and redirect
                });
            });

            // Bind cart logo button click event
            document.querySelectorAll(".cart-btn").forEach(button => {
                button.addEventListener("click", function () {
                    const productId = this.dataset.id;
                    addToCart(productId); // Add product to cart without redirect
                });
            });
      
    
        }

