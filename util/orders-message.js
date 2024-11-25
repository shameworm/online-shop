function getOrderMessage(order) {
  if (!order) {
    return
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

  return `

           🛒 ORDER SUMMARY

🔖 Order ID: ${order.id || order._id}

📍 Delivery Details:
   - Receiver: ${order.userData.fullname}
   - Street: ${order.userData.address.street}
   - City: ${order.userData.address.city}
   - Postal Code: ${order.userData.address.postal}

📦 Order Status: ${order.status}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛍️ Items Ordered:
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💵 Total Amount: $${order.productData.totalPrice.toFixed(2)}

📅 Order Date: ${order.date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })}
`;
}

module.exports = { getOrderMessage };
