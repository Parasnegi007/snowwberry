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

            // ✅ Fetch product details for guest users
            if (guestCart.length > 0) {
                const response = await fetch("https://snowberry.onrender.com/api/products");
                const products = await response.json();

                // Map product details to cart
                cartItems = guestCart.map(item => {
                    const product = products.find(p => p._id === item.productId);
                    return product ? { ...product, quantity: item.quantity } : item;
                });
            }
        }

        displayCartItems(cartItems); // Call function to display cart items
    } catch (error) {
        console.error("Error fetching cart items:", error);
    }
}


// ✅ Function to Display Cart Items
function displayCartItems(cartItems) {
    const cartContainer = document.getElementById("order-items");
    const totalElement = document.getElementById("order-total");

    if (!cartContainer || !totalElement) {
        console.error("❌ Order summary section not found! Check checkout.html IDs.");
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
        // Ensure price and quantity are valid numbers
        const price = parseFloat(item.price) || 0;  // Default to 0 if invalid
        const quantity = parseInt(item.quantity, 10) || 1;  // Default to 1 if invalid

        // Create HTML for each item in the cart
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");

        itemElement.innerHTML = `
            <p>${item.name} &nbsp;&nbsp;&nbsp;&nbsp; x${quantity} &nbsp;&nbsp;&nbsp;&nbsp; ₹${price.toFixed(2)}</p>
        `;

        cartContainer.appendChild(itemElement);

        // Calculate the total price for all items in the cart
        totalPrice += price * quantity;
    });

    // Display the total price
    totalElement.textContent = totalPrice.toFixed(2);
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
        // Guest user
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();

        if (!name || !email || !phone) {
            alert("Please provide your name, email, and phone number.");
            return;
        }

        userInfo = { name, email, phone };
    } else {
        // Logged-in user - take values from form instead of fetching from backend
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
        return null; // Return null if user ID is not found
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
    orderData.userInfo = userInfo;  // Send guest user info
} else {
    orderData.userId = getUserId();  // Send userId for logged-in users
    orderData.userInfo = userInfo;   // Send user info from form, even for logged-in users
}

console.log("Order Data:", orderData);

// ✅ Step 7: Send Order Data to Backend
try {
    const response = await fetch("https://snowberry.onrender.com/api/orders/create-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "", // Include the token if logged in
        },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(`Error creating order: ${errorData.message}`);
        return;
    }

    const { orderId } = await response.json();
    localStorage.setItem("orderId", orderId);  // Store the orderId in localStorage
    alert("Temporary order created successfully. Proceeding to payment...");

    // Continue with Razorpay/PhonePe payment flow here after this
} catch (error) {
    console.error("Error creating temporary order:", error);
    alert("Failed to create order. Please try again.");
}
});