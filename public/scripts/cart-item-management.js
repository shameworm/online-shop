const cartItemUpdateFormElements = document.querySelectorAll(
    ".cart-item-management"
);
const cartTotalPrice = document.getElementById("cart-total-price");
const cartBadge = document.querySelector(".nav-items .badge");

for (const formElement of cartItemUpdateFormElements) {
    formElement.addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const productId = form.dataset.productid;
        const csrfToken = form.dataset.csrf;
        const quantity = form.firstElementChild.value;

        let response;
        try {
            response = await fetch("/cart/items", {
                method: "PATCH",
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity,
                    _csrf: csrfToken,
                }),
                headers: {
                    "content-type": "application/json",
                },
            });
        } catch (error) {
            alert("Something went wrong!");
            return;
        }

        if (!response.ok) {
            alert("Something went wrong!");
            return;
        }

        const responseData = await response.json();

        if (responseData.updatedCartData.updatedItemPrice === 0) {
            form.parentElement.parentElement.remove();
        } else {
            const cartItemTotalPrice =
                form.parentElement.querySelector(".cart-item-price");
            cartItemTotalPrice.textContent =
                responseData.updatedCartData.updatedItemPrice.toFixed(2);
        }

        cartTotalPrice.textContent =
            responseData.updatedCartData.newTotalPrice.toFixed(2);

        cartBadge.textContent = responseData.updatedCartData.newTotalQuantity;
    });
}