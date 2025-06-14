function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (!cartCountElement) return;

    const token = localStorage.getItem("authToken");

    if (token) {
        fetch("https://snowberry.onrender.com/api/users/cart", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(cart => {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalQuantity || "";
        })
        .catch(error => console.error("❌ Error fetching cart count:", error));
    } else {
        const cart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalQuantity || "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const sideMenu = document.getElementById("side-menu");

    // Toggle the side menu on button click
    if (menuToggle && sideMenu) {
        menuToggle.addEventListener("click", (event) => {
            sideMenu.classList.toggle("active");
            event.stopPropagation(); // Prevent click propagation to the document
        });

        // Close the menu when clicking anywhere outside the menu
        document.addEventListener("click", (event) => {
            if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                sideMenu.classList.remove("active");
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const dashboardContainer = document.querySelector(".dashboard-container");

    // Function to check screen size and toggle visibility
    const toggleDashboardVisibility = () => {
        if (window.innerWidth <= 1024) {
            // Hide dashboard-container in mobile mode
            dashboardContainer.style.display = "none";
        } else {
            // Show dashboard-container in desktop mode
            dashboardContainer.style.display = "flex";
        }
    };

    // Run the function on page load
    toggleDashboardVisibility();

    // Run the function when resizing the browser window
    window.addEventListener("resize", toggleDashboardVisibility);
});

document.addEventListener('DOMContentLoaded', function () {
    const marqueeContainer = document.querySelector('.marquee-container');
    const header = document.querySelector('header');
    const marqueeHeight = marqueeContainer.offsetHeight;
  
    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;
  
      if (scrollY >= marqueeHeight) {
        header.classList.add('fixed'); // Add fixed class
      } else {
        header.classList.remove('fixed'); // Remove fixed class
      }
    });
      
  });
  document.addEventListener("DOMContentLoaded", () => {
    const userLabels = document.querySelectorAll("#user-label");

    if (userLabels.length === 0) {
        console.error("No elements with ID 'user-label' found.");
        return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    console.log("User data:", loggedInUser);
    console.log("Login status:", isLoggedIn);

    userLabels.forEach(label => {
        label.textContent = isLoggedIn && loggedInUser ? "User" : "Login";
    });
});

const BACKEND_URL = 'https://snowberry.onrender.com/healthcheck';



  async function checkBackend() {
    try {
      const response = await fetch(BACKEND_URL);
      if (response.ok) {
        setTimeout(() => {
          document.getElementById("loader").style.display = "none";
          document.body.classList.remove("loading"); // Unlock scroll & clicks
        }, 500); // Smooth transition delay
      } else {
        console.log("Backend not ready yet...");
        setTimeout(checkBackend, 3000); // Retry after 3 seconds
      }
    } catch (error) {
      console.log("Waiting for backend...", error);
      setTimeout(checkBackend, 3000); // Retry after 3 seconds
    }
  }

  checkBackend(); // Start checking when everything loads
};


// ✅ Call on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
