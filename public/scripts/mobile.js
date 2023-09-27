const mobileMenuButtonElemet = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");


mobileMenuButtonElemet.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
});