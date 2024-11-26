function getOrderMessage(order) {
  if (!order) {
    return;
  }

  const itemsList = order.productData.items
    .map(
      (item) =>
        `🔹 ${item.product.title.toUpperCase()}\n` +
        `   • Price (per unit): $${item.product.price.toFixed(2)}\n` +
        `   • Quantity: ${item.quantity}\n` +
        `   • Subtotal: $${item.totalPrice.toFixed(2)}`
    )
    .join("\n\n");

  const formattedDate = order.date instanceof Date && !isNaN(order.date)
    ? order.date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

  return `

   ${order.id ? `🛒 ORDER SUMMARY` : "NEW ORDER RECEIVED"}
   ${order.id ? `🔖 Order ID: ${order.id}` : ""}


📍 Delivery Details:
   - Receiver: ${order.userData.fullname}
   - Street: ${order.userData.address.street}
   - City: ${order.userData.address.city}
   - Postal Code: ${order.userData.address.postal}
   ${order.ttn ? `- TTN: ${order.ttn}` : ""}
📦 Order Status: ${order.status}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛍️ Items Ordered:
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💵 Total Amount: $${order.productData.totalPrice.toFixed(2)}
    
${formattedDate && `📅 Order Date: ${formattedDate}`}
`;
}


module.exports = { getOrderMessage };
