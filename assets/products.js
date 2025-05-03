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

 // Attach modal events to product card
productCard.addEventListener("click", (e) => {
    if (
        e.target.closest(".cart-btn") ||
        e.target.closest(".buy-now-btn") ||
        e.target.closest(".add-to-wishlist")
    ) return; // Don't open modal if clicking on buttons

    // Set modal content
    document.getElementById("modalProductImage").src = product.image;
    document.getElementById("modalProductName").textContent = product.name;
    document.getElementById("modalProductDescription").textContent = product.description;
    document.getElementById("modalProductPrice").textContent = "₹" + product.price;

    // Get modal buttons
    const modalCartBtn = document.getElementById("modalCart");
    const modalBuyNowBtn = document.getElementById("modalBuyNow");
    const modalWishlistBtn = document.getElementById("modalAddToWishlist");

    // Set the latest data-id for modal buttons
    if (modalCartBtn) {
        modalCartBtn.setAttribute("data-id", product._id);
        modalCartBtn.onclick = () => addToCart(product._id); // use your addToCart function
    }
    if (modalBuyNowBtn) {
        modalBuyNowBtn.setAttribute("data-id", product._id);
        modalBuyNowBtn.onclick = () => addToCart(product._id, true); // Buy now triggers addToCart with redirect
    }
    if (modalWishlistBtn) {
        modalWishlistBtn.setAttribute("data-id", product._id);
        modalWishlistBtn.onclick = () => addToWishlist(product._id); // your addToWishlist function
    }

    // Show modal
    document.getElementById("productModal").style.display = "block";
});

// Close modal when clicking outside
window.addEventListener("click", function (e) {
    const modal = document.getElementById("productModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Close modal function
function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
}

  

        productCard.innerHTML = `
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description.split(" ").slice(0, 10).join(" ")}</p>
            <p ><span class="mrp">₹${product.mrp}</span>
                <span class="price">₹${product.price}</span></p>
            <div class="product-buttons">
    
            <button class="buy-now-btn" data-id="${product._id}">Buy Now</button>
             <button class="cart-btn" data-id="${product._id}">
                                <i class="fas fa-shopping-cart"></i> <!-- Font Awesome Cart Icon -->
                            </button>
        
                <button class="add-to-wishlist" onclick="addToWishlist('${product._id}')">  <i class="fa fa-heart" aria-hidden="true"></i></button>
            </div>
        `;

        productsContainer.appendChild(productCard);
    });
    
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


// ❤️ Function to add item to Wishlist (Guest & Logged-in Users)
// ❤️ Function to add item to Wishlist (Guest & Logged-in Users)
async function addToWishlist(productId) {
    const token = localStorage.getItem("authToken");
    const WISHLIST_API = "https://snowberry.onrender.com/api/users/wishlist"; // ✅ Ensure API is defined

    if (!token) {
        // Guest userin localStorage
        let wishlist = JSON.parse(localStorage.getItem("guestWishlist")) || [];
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem("guestWishlist", JSON.stringify(wishlist));
            alert("✅ Added to Wishlist! ❤️"); // ✅ Now shows alert
        }
        return;
    }

    // Logged-in userin backend
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

    // Close on outside click
    setTimeout(() => {
        document.addEventListener("click", function outsideClick(event) {
            if (event.target === modal) {
                closeProductModal();
                document.removeEventListener("click", outsideClick); // Clean up
            }
        });
    }, 0);
}
function closeProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) {
        modal.style.display = "none"; // 🔁 hide instead of remove
    }
}

// This should go **after** modal is created and added to the DOM
document.addEventListener("click", function (event) {
    const modal = document.querySelector(".modal");
    if (modal && event.target === modal) {
        closeProductModal();
    }
});
