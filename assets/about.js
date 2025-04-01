document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("DOMContentLoaded", updateCartCount);
    // Image Modal Functionality
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeModalBtn = document.querySelector(".modal .close");

    function openModal(imgElement) {
        modal.style.display = "flex";
        modal.classList.add("show");
        modalImg.src = imgElement.src;
        document.body.style.overflow = "hidden"; // ✅ Prevents scrolling when modal is open
    }
    
    function closeModal() {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            document.body.style.overflow = "auto"; // ✅ Enables scrolling again
        }, 300);
    }
    

    // Attach event listeners to all gallery images
    document.querySelectorAll(".gallery img").forEach(img => {
        img.addEventListener("click", function () {
            openModal(this);
        });
    });

    // Close modal when clicking the close button
    closeModalBtn.addEventListener("click", closeModal);

    // Close modal when clicking outside the image
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal with Esc key
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });
});
 