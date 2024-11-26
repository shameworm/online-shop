const generateInlineKeyboard = (order, currentIndex, orders, prefix = 'processing', isAdmin = true) => {
  let inlineKeyboard = {
    inline_keyboard: []
  };

  if (isAdmin) {
    inlineKeyboard.inline_keyboard.push([
      { text: "Go back", callback_data: "/navigate_exit" }
    ]);
  } else {
    inlineKeyboard.inline_keyboard.push([
      { text: "Back to Menu", callback_data: "/navigate_user_exit" }
    ]);
  }

  if (isAdmin) {
    inlineKeyboard.inline_keyboard.push(
      [
        { text: "Processing", callback_data: `/update_${order.id}_processing` },
        { text: "Packed", callback_data: `/update_${order.id}_packed` },
        { text: "Shipped to Courier", callback_data: `/update_${order.id}_shipped_to_courier` },
      ],
      [
        { text: "In Transit", callback_data: `/update_${order.id}_in_transit` },
        { text: "Arrived", callback_data: `/update_${order.id}_arrived` },
        { text: "Completed", callback_data: `/update_${order.id}_completed` },
      ],
      [{ text: "Rejected", callback_data: `/update_${order.id}_rejected` }],
      [{ text: "Add TTN", callback_data: `/add_ttn_${order.id}` }]
    );
  }


  if (prefix !== 'none' && orders.length > 1) {
    const navigationButtons = [];

    if (currentIndex > 0) {
      navigationButtons.push({
        text: "⬅️ Previous",
        callback_data: `/navigate_${prefix}_prev_${currentIndex}`
      });
    }

    if (currentIndex < orders.length - 1) {
      navigationButtons.push({
        text: "Next ➡️",
        callback_data: `/navigate_${prefix}_next_${currentIndex}`
      });
    }

    if (navigationButtons.length > 0) {
      inlineKeyboard.inline_keyboard.push(navigationButtons);
    }
  }


  return inlineKeyboard;
};

module.exports = { generateInlineKeyboard }