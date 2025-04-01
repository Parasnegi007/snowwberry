document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("DOMContentLoaded", updateCartCount);

    
    // Hero Background Sliding Effect
    const hero = document.querySelector(".hero");
    const images = ["assets/images/bg.jpg", "assets/images/bg2.jpg", "assets/images/bg3.jpg"];
    let index = 0;

    function slideImages() {
        hero.style.backgroundImage = `url(${images[index]})`;
        hero.style.transition = "background 1.5s ease-in-out"; // Smooth transition effect
        index = (index + 1) % images.length;
    }

    setInterval(slideImages, 4000); // Change background every 4 seconds
    slideImages(); // Ensure first image loads immediately

    // 🚀 Dashboard Icon Click Logic (Login Persistence)
    const dashboardIcon = document.querySelector(".dashboard-container a");

    if (dashboardIcon) {
        dashboardIcon.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default navigation

            const loggedInUser = localStorage.getItem("loggedInUser");

if (localStorage.getItem("isLoggedIn") === "true" && loggedInUser) {
    window.location.href = "dashboard.html"; 
} else {
    window.location.href = "login.html"; 
}
        });
    }// Store login state in localStorage after successful login
localStorage.setItem("isLoggedIn", "true");
console.log("User logged in, isLoggedIn set to:", localStorage.getItem("isLoggedIn"));


    // ✅ Ensure Login State Persists
    if (localStorage.getItem("isLoggedIn") !== "true") {
        console.log("User is not logged in.");
    } else {
        console.log("User is logged in.");
    }
});
document.addEventListener("DOMContentLoaded", async function () {
    await checkLoginStatus();
});

// 🔹 Fetch Login Status from Backend
async function checkLoginStatus() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.log("User is not logged in.");
            return;
        }

        const response = await fetch("https://snowberry.onrender.com/api/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            console.log("User session expired or invalid token.");
            localStorage.removeItem("authToken");
            return;
        }

        const userData = await response.json();
        console.log("User is logged in:", userData);

        // ✅ Update Dashboard Link Based on Login Status
        const dashboardIcon = document.querySelector(".dashboard-container a");
        if (dashboardIcon) {
            dashboardIcon.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}
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
            <img src="images/${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button onclick="addToCart('${product._id}')">Add to Cart</button>
        `;
        featuredList.appendChild(productCard);
    });
}

// Scroll functionality
document.getElementById("scroll-right").addEventListener("click", function () {
    document.getElementById("featured-list").scrollBy({ left: 300, behavior: "smooth" });
});

