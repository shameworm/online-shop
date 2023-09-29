const cartItemUpdateFormElements = document.querySelectorAll(
    ".cart-item-management"
);

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
    });
}
