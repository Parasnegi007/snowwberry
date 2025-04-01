window.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("https://snowberry.vercel.app/api/users/profile", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user details");
        }

        const userData = await response.json();

        // ✅ Store user data locally
        localStorage.setItem("loggedInUser", JSON.stringify(userData));

        // ✅ Update dashboard with user data
        document.getElementById("display-name").textContent = userData.name || "Not Provided";
        document.getElementById("display-email").textContent = userData.email || "Not Provided";
        document.getElementById("display-phone").textContent = userData.phone || "Not Provided";

    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user details. Please try again.");
        window.location.href = "login.html";
    }

    // ✅ Logout Functionality
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("authToken");
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    });

    // ✅ Show Edit Profile Section
    const editProfileBtn = document.getElementById("edit-profile");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", function () {
            document.getElementById("edit-profile-section").style.display = "block";

            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            document.getElementById("edit-name").value = loggedInUser.name;
            document.getElementById("edit-email").value = loggedInUser.email;
            document.getElementById("edit-phone").value = loggedInUser.phone;
        });
    }

    // ✅ Show "Save Changes" Button When Any Field is Edited
    const inputs = ["edit-name", "edit-email", "edit-phone"];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener("input", function () {
            document.getElementById("save-profile").style.display = "block"; // Show Save Changes
        });
    });

    // ✅ Show "Send OTP" Button When Email or Phone Changes
    const emailInput = document.getElementById("edit-email");
    const phoneInput = document.getElementById("edit-phone");
    const sendOtpBtn = document.getElementById("send-otp"); // Single OTP button

    function checkIfChanged() {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const updatedEmail = emailInput.value.trim();
        const updatedPhone = phoneInput.value.trim();

        // Show "Send OTP" button if email or phone is changed
        if ((updatedEmail && updatedEmail !== loggedInUser.email) || 
            (updatedPhone && updatedPhone !== loggedInUser.phone)) {
            sendOtpBtn.style.display = "block";  
        } else {
            sendOtpBtn.style.display = "none";  
        }
    }

    emailInput.addEventListener("input", checkIfChanged);
    phoneInput.addEventListener("input", checkIfChanged);

    // ✅ Email & Phone Validation
    function validateInput(input, pattern) {
        if (pattern.test(input.value.trim())) {
            input.style.border = "2px solid green"; // ✅ Valid
        } else {
            input.style.border = "2px solid red"; // ❌ Invalid
        }
    }

    emailInput.addEventListener("input", function () {
        validateInput(this, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    phoneInput.addEventListener("input", function () {
        validateInput(this, /^[0-9]{10}$/);
    });

    // ✅ Send OTP (Same for Both Email & Phone)
    sendOtpBtn.addEventListener("click", async function () {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const updatedEmail = emailInput.value.trim();
        const updatedPhone = phoneInput.value.trim();

        if (!updatedEmail && !updatedPhone) {
            alert("Enter a valid email or phone number!");
            return;
        }

        sendOtpBtn.textContent = "Sending...";
        sendOtpBtn.disabled = true;

        try {
            const token = localStorage.getItem("authToken");  // Get stored JWT token

            const response = await fetch("https://snowberry.vercel.app/api/users/send-otp-update", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`  // ✅ Include token
                },
                body: JSON.stringify({ email: updatedEmail || loggedInUser.email, phone: updatedPhone || loggedInUser.phone })
            });
            

            const data = await response.json();

            if (response.ok) {
                alert("OTP sent to your email and phone.");
                document.getElementById("email-otp-section").style.display = "block";  // Show OTP input
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("OTP Error:", error);
            alert("Failed to send OTP.");
        }

        setTimeout(() => {
            sendOtpBtn.textContent = "Send OTP";
            sendOtpBtn.disabled = false;
        }, 5000);
    });

    // ✅ Save Profile Updates
    document.getElementById("save-profile").addEventListener("click", async function () {
        const name = document.getElementById("edit-name").value.trim();
        const email = document.getElementById("edit-email").value.trim();
        const phone = document.getElementById("edit-phone").value.trim();
        const otp = document.getElementById("email-otp").value.trim();  // Get OTP

        const token = localStorage.getItem("authToken");  // JWT Token

        let requestBody = { name };  // Only update name if no email/phone change

        if (email && email !== JSON.parse(localStorage.getItem("loggedInUser")).email) {
            requestBody.email = email;
        }

        if (phone && phone !== JSON.parse(localStorage.getItem("loggedInUser")).phone) {
            requestBody.phone = phone;
        }

        // OTP is required if email or phone changes
        if ((email && email !== JSON.parse(localStorage.getItem("loggedInUser")).email) || 
            (phone && phone !== JSON.parse(localStorage.getItem("loggedInUser")).phone)) {
            if (!otp) {
                alert("OTP is required to update email or phone.");
                return;
            }
            requestBody.otp = otp;
        }

        try {
            const response = await fetch("https://snowberry.vercel.app/api/users/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                localStorage.setItem("loggedInUser", JSON.stringify(data.user));  // Save updated user
                location.reload();  // Refresh page to update displayed details
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert("Failed to update profile. Please try again.");
        }
    });
});
// ✅ Function to Update Cart Counter
function updateCartCounter(cart) {
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").innerText = totalItems || "";
}