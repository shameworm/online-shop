const mobileMenuButtonElemet = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

function toggleMobileMenu() {
    mobileMenu.classList.toggle("open");
}

mobileMenuButtonElemet.addEventListener("click", toggleMobileMenu);