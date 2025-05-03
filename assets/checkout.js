document.addEventListener("DOMContentLoaded", function () {
    fetchCartItems();
});
// ✅ Function to Fetch Cart Items (Works for Logged-in and Guest Users)
async function fetchCartItems() {
    try {
        const token = localStorage.getItem("authToken");
        let cartItems = [];

        if (token) {
            // Logged-in user: Fetch cart from backend API
            const response = await fetch("https://snowberry.onrender.com/api/users/cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            cartItems = await response.json();
        } else {
            // Guest user: Fetch cart from localStorage
            let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

            if (guestCart.length > 0) {
                const response = await fetch("https://snowberry.onrender.com/api/products");
                const products = await response.json();

                // Map product details to cart, including images
                cartItems = guestCart.map(item => {
                    const product = products.find(p => p._id === item.productId);
                    return product 
                        ? { ...product, quantity: item.quantity, image: product.image } 
                        : item;
                });
            }
        }

        displayCartItems(cartItems); // Call function to display cart items with images
    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
}
// ✅ Function to Display Cart Items
function displayCartItems(cartItems) {
    const cartContainer = document.getElementById("order-items");
    const totalElement = document.getElementById("order-total");
    const orderSummarySection = document.querySelector(".order-summary"); // Reference to order-summary section

    if (!cartContainer || !totalElement || !orderSummarySection) {
        console.error("❌ Order summary section not found! Check IDs and classes in your HTML.");
        return;
    }

    cartContainer.innerHTML = ""; // Clear previous items

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalElement.textContent = "0";
        return;
    }

    let totalPrice = 0;

    cartItems.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity, 10) || 1;

        // Create HTML for each item in the cart
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");

        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="product-image" />
            <div class="product-details">
                <p class="product-name">${item.name}</p>
                <p class="product-quantity">x${quantity}</p>
                <p class="product-price">₹${price.toFixed(2)}</p>
            </div>
        `;

        cartContainer.appendChild(itemElement);

        // Calculate total price
        totalPrice += price * quantity;
    });

    // Display total price
    totalElement.textContent = totalPrice.toFixed(2);

    // Determine shipping charges
    let shippingCharges = 0;
    if (totalPrice < 500) {
        shippingCharges = 200;
    } else if (totalPrice >= 500 && totalPrice <= 1000) {
        shippingCharges = 100;
    }

    // Add shipping charges and final total to the summary
    const shippingLine = document.createElement("p");
    shippingLine.textContent = `Shipping Charges: ₹${shippingCharges}`;
    shippingLine.style.fontWeight = "bold";
    shippingLine.style.textAlign = "right"; // Align text to the right
    orderSummarySection.appendChild(shippingLine);
    
    const finalTotal = totalPrice + shippingCharges;
    const finalTotalLine = document.createElement("h3");
    finalTotalLine.textContent = `Final Total: ₹${finalTotal.toFixed(2)}`;
    finalTotalLine.style.fontSize = "26px";
    finalTotalLine.style.fontWeight = "bold";
    finalTotalLine.style.color = "#28a745"; // Optional styling
    finalTotalLine.style.textAlign="center";
    orderSummarySection.appendChild(finalTotalLine);
}


// ✅ Function to Fetch User Details (Only if Logged-in)
async function fetchUserDetails() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) return; // Skip for guest users

        const response = await fetch("https://snowberry.onrender.com/api/users/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();

        // Store the user ID in localStorage
        localStorage.setItem("userId", user._id);

        // Auto-fill details for logged-in users
        document.getElementById("name").value = user.name;
        document.getElementById("email").value = user.email;
        document.getElementById("phone").value = user.phone;

        // Disable editing for logged-in users
        document.getElementById("name").setAttribute("disabled", "true");
        document.getElementById("email").setAttribute("disabled", "true");
        document.getElementById("phone").setAttribute("disabled", "true");
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}


document.addEventListener("DOMContentLoaded", fetchUserDetails);

// ✅ Allow Guest Users to Enter Name, Email, and Phone
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");

    if (!token) {
        document.getElementById("name").removeAttribute("disabled");
        document.getElementById("email").removeAttribute("disabled");
        document.getElementById("phone").removeAttribute("disabled");
    }
});
async function saveAddress() {
    const token = localStorage.getItem("authToken"); // Check if user is logged in

    const street = document.getElementById("street")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const state = document.getElementById("state")?.value.trim();
    const zipcode = document.getElementById("zipcode")?.value.trim();
    const country = document.getElementById("country")?.value.trim();

    if (!street || !city || !state || !zipcode || !country) {
        alert("Please fill in all required fields.");
        return;
    }

    let addressData = { street, city, state, zipcode, country };
    let endpoint = "";

    if (token) {
        // ✅ Logged-in User - Send Address Only
        endpoint = "https://snowberry.onrender.com/api/users/addAddress";
    } else {
        // ✅ Guest User - Send Name, Email, and Phone Too
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();

        if (!name || !email || !phone) {
            alert("Please enter your Name, Email, and Phone.");
            return;
        }

        addressData = { name, email, phone, ...addressData };
        endpoint = "https://snowberry.onrender.com/api/users/guest/addAddress";
    }

    console.log("Sending address data:", addressData);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }), // Add token for logged-in users
            },
            body: JSON.stringify(addressData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error saving address: ${errorData.message}`);
            return;
        }

        alert("Address saved successfully!");

        // ✅ Fetch and update saved addresses dynamically (No Reload)
        fetchSavedAddresses();
    } catch (error) {
        console.error("Error saving address:", error);
        alert("An error occurred while saving the address.");
    }
}



document.getElementById("saveAddress").addEventListener("click", saveAddress);

// ✅ Fetch Saved Addresses (Supports Logged-in & Guest Users)
async function fetchSavedAddresses() {
    const token = localStorage.getItem("authToken");
    let endpoint = "";

    if (token) {
        endpoint = "https://snowberry.onrender.com/api/users/getAddresses";
    } else {
        const guestEmail = document.getElementById("email")?.value.trim();
        if (!guestEmail) {
            console.log("Guest email not entered yet.");
            return;
        }
        endpoint = `https://snowberry.onrender.com/api/users/guest/getAddresses/${guestEmail}`;
    }

    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error fetching addresses: ${errorData.message}`);
            return;
        }

        const data = await response.json();
        console.log("Fetched addresses:", data);

        displayAddresses(data.name, data.address);
    } catch (error) {
        console.error("Error fetching addresses:", error);
    }
}


document.addEventListener("DOMContentLoaded", fetchSavedAddresses);

// ✅ Function to Display Selectable Addresses
function displayAddresses(userName, addresses) {
    const addressesContainer = document.getElementById("saved-addresses");
    addressesContainer.innerHTML = ""; 

    if (!addresses || addresses.length === 0) {
        addressesContainer.innerHTML = "<p>No saved addresses found.</p>";
        return;
    }

    addresses.forEach((address, index) => {
        const addressElement = document.createElement("div");
        addressElement.classList.add("address-item");

        addressElement.innerHTML = `
            <label>
                <input type="radio" name="selectedAddress" value="${index}" ${index === addresses.length - 1 ? "checked" : ""}>
                <strong>${userName || "Guest"}</strong><br>
                ${address.street}, ${address.city}, ${address.state}, ${address.zipcode}, ${address.country}
            </label>
        `;

        addressesContainer.appendChild(addressElement);
    });
}


// Call this function when the page loads
document.addEventListener("DOMContentLoaded", fetchUserDetails);
document.addEventListener("DOMContentLoaded", function () {
    populateCountries();
    populateStatesAndUT();

    document.getElementById("zipcode").addEventListener("blur", fetchLocationByPostalCode);
    document.getElementById("saveAddress").addEventListener("click", saveAddress);
});

// ✅ Function to fetch City, State, and Country using India Post API
async function fetchLocationByPostalCode() {
    const postalCode = document.getElementById("zipcode").value.trim();

    if (!postalCode) {
        alert("Please enter a pin/zip code.");
        return;
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
        const data = await response.json();

        if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            document.getElementById("city").value = postOffice.District;
            document.getElementById("state").value = postOffice.State;
            document.getElementById("country").value = postOffice.Country;
        } else {
            alert("Invalid postal code or data not available.");
        }
    } catch (error) {
        console.error("Error fetching location data:", error);
        alert("Failed to fetch location data. Please try again.");
    }
}


// ✅ Function to Populate Country Dropdown
function populateCountries() {
    const countries = ["India"];
    const countryDropdown = document.getElementById("country");

    if (!countryDropdown) return;

    countryDropdown.innerHTML = "<option value=''>Select Country</option>";
    countries.forEach(country => {
        let option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countryDropdown.appendChild(option);
    });

    countryDropdown.value = "India"; // Default to India
}

// ✅ Function to Populate States & UTs
function populateStatesAndUT() {
    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
    ];

    const stateDropdown = document.getElementById("state");

    if (!stateDropdown) return;

    stateDropdown.innerHTML = "<option value=''>Select State/UT</option>";
    states.forEach(state => {
        let option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateDropdown.appendChild(option);
    });
}
document.getElementById("proceedToPayment").addEventListener("click", async function () {
    // ✅ Step 1: Capture Selected Saved Address
    const selectedAddressIndex = document.querySelector('input[name="selectedAddress"]:checked')?.value;
    let shippingAddress = null;

    if (selectedAddressIndex !== undefined) {
        try {
            const token = localStorage.getItem("authToken");
            let endpoint = "";

            if (token) {
                endpoint = "https://snowberry.onrender.com/api/users/getAddresses";
            } else {
                const guestEmail = document.getElementById("email")?.value.trim();
                if (!guestEmail) {
                    alert("Please enter your email to retrieve saved addresses.");
                    return;
                }
                endpoint = `https://snowberry.onrender.com/api/users/guest/getAddresses/${guestEmail}`;
            }

            const response = await fetch(endpoint, {
                method: "GET",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!response.ok) {
                throw new Error(`Error fetching addresses: ${response.status}`);
            }

            const data = await response.json();
            const addresses = data.address || [];

            if (addresses[selectedAddressIndex]) {
                shippingAddress = addresses[selectedAddressIndex];
            } else {
                alert("Selected address is invalid.");
                return;
            }
        } catch (error) {
            console.error("Error retrieving saved addresses:", error);
            alert("Failed to fetch saved addresses.");
            return;
        }
    }

    // ✅ Step 2: Validate Form Fields (Only if No Saved Address is Selected)
    if (!shippingAddress) {
        const zipcode = document.getElementById("zipcode")?.value.trim();
        const street = document.getElementById("street")?.value.trim();
        const city = document.getElementById("city")?.value.trim();
        const state = document.getElementById("state")?.value;
        const country = document.getElementById("country")?.value;

        if (!zipcode || !street || !city || !state || !country) {
            alert("Please fill in all required fields for the shipping address.");
            return;
        }

        shippingAddress = { street, city, state, zipcode, country };
    }

    console.log("Shipping Address:", shippingAddress);

    // ✅ Step 3: Capture User Info
    const token = localStorage.getItem("authToken");
    let userInfo = null;

    if (!token) {
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();

        if (!name || !email || !phone) {
            alert("Please provide your name, email, and phone number.");
            return;
        }

        userInfo = { name, email, phone };
    } else {
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();

        if (!name || !email || !phone) {
            alert("Please fill in all required fields.");
            return;
        }

        userInfo = { name, email, phone };
    }

    console.log("User Info:", userInfo);

    // ✅ Step 4: Validate Payment Method
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPaymentMethod) {
        alert("Please select a payment method before proceeding.");
        return;
    }

    const paymentMethod = selectedPaymentMethod.value;
    console.log("Selected Payment Method:", paymentMethod);

    // ✅ Step 5: Retrieve Cart Items
    let cartItems = [];
    if (token) {
        try {
            const response = await fetch("https://snowberry.onrender.com/api/users/cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching cart: ${response.status}`);
            }

            cartItems = await response.json();
            console.log("Cart Items for Logged-in User:", cartItems);
        } catch (error) {
            console.error("Error fetching cart for logged-in user:", error);
            alert("Failed to retrieve cart. Please try again.");
            return;
        }
    } else {
        cartItems = JSON.parse(localStorage.getItem("guestCart")) || [];
        console.log("Cart Items for Guest User:", cartItems);

        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items before proceeding.");
            return;
        }
    }

    // ✅ Step 6: Prepare Order Data
    function getUserId() {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            console.log("No user ID found in localStorage.");
            return null;
        }

        console.log("User ID retrieved from localStorage:", userId);
        return userId;
    }

    const orderData = {
        cartItems,
        shippingAddress,
        paymentMethod,
    };

    // Ensure we always send userInfo (for both logged-in and guest users)
    if (!token) {
        orderData.userInfo = userInfo;
    } else {
        orderData.userId = getUserId();
        orderData.userInfo = userInfo;
    }

    console.log("Order Data:", orderData);

    // ✅ Step 7: Send Order Data to Backend
    try {
        const response = await fetch("https://snowberry.onrender.com/api/orders/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error creating order: ${errorData.message}`);
            return;
        }

        const { orderId } = await response.json();
        localStorage.setItem("orderId", orderId);
        alert(`Order created successfully! Your Order ID is ${orderId}.`);
    } catch (error) {
        console.error("Error creating order:", error);
        alert("Failed to create order. Please try again.");
    }
});
// ✅ Function to Apply Persisting Highlight for Selected Address
document.addEventListener("click", (event) => {
    const addressItems = document.querySelectorAll(".address-item");

    if (event.target.name === "selectedAddress") {
        // Loop through all address items and remove the highlight
        addressItems.forEach(item => {
            item.style.borderLeft = "none";
            item.style.background = "white";
            item.style.boxShadow = "none";
            item.style.paddingLeft = "0";
            item.style.color = "#333"; // Reset to default color
        });

        // Add highlight to the selected address
        const selectedLabel = event.target.closest(".address-item");
        selectedLabel.style.borderLeft = "4px solid #007bff";
        selectedLabel.style.background = "#eef5ff";
        selectedLabel.style.boxShadow = "0 2px 5px rgba(0, 123, 255, 0.2)";
        selectedLabel.style.paddingLeft = "10px";
        selectedLabel.style.color = "#007bff";
    }
    
});
// ✅ Function to Handle Payment Method Selection and Highlight
document.addEventListener("DOMContentLoaded", () => {
    const paymentOptions = document.querySelectorAll(".payment-option");

    // Loop through all payment options
    paymentOptions.forEach(option => {
        // Add click event listener to each payment option
        option.addEventListener("click", () => {
            // Remove "selected" class from all payment options
            paymentOptions.forEach(opt => opt.classList.remove("selected"));

            // Add "selected" class to the clicked option
            option.classList.add("selected");

            // Mark the associated radio button as checked
            const radioButton = option.querySelector('input[name="payment-method"]');
            if (radioButton) {
                radioButton.checked = true; // Ensure it's properly selected
            }
        });
    });
});

// ✅ Function to Get Selected Payment Method
function getSelectedPaymentMethod() {
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPaymentMethod) {
        alert("Please select a payment method before proceeding.");
        return;
    }

    const paymentMethod = selectedPaymentMethod.value;
    console.log("Selected Payment Method:", paymentMethod);
    return paymentMethod; // Return the selected method if needed elsewhere
}
