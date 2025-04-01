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
