
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
function populateCountryDropdown() {
    const countrySelect = document.getElementById("country");
    const countries = ["India"]; // Add more countries if needed

    countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// ✅ Function to Populate State Dropdown
function populateStateDropdown() {
    const stateSelect = document.getElementById("state");
    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal"
    ];

    states.forEach((state) => {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}