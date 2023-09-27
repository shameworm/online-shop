const deleteProductBtnElements = document.querySelectorAll(
    ".product-item button"
);

for (const deleteProductBtnElement of deleteProductBtnElements) {
    deleteProductBtnElement.addEventListener("click", async (event) => {
        const buttonElement = event.target;
        const productId = buttonElement.dataset.productid;
        const csrfToken = buttonElement.dataset.csrf;

        const response = await fetch(
            "/admin/products/" + productId + "?_csrf=" + csrfToken,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            alert("Something went wrong");
            return;
        }

        buttonElement.parentElement.parentElement.parentElement.parentElement.remove();
    });
}
