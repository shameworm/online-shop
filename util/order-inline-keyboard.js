const generateInlineKeyboard = (order, currentIndex, orders, prefix = 'processing') => {
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: "Go back", callback_data: `/navigate_exit` }],
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
      [{ text: "Add TTN", callback_data: `/add_ttn_${order.id}` }],
    ],
  };

  if (prefix !== 'none') {
    inlineKeyboard.inline_keyboard.push([
      {
        text: "⬅️",
        callback_data: `/navigate_${prefix}_prev_${currentIndex}`,
        disabled: currentIndex === 0,
      },
      {
        text: "➡️",
        callback_data: `/navigate_${prefix}_next_${currentIndex}`,
        disabled: currentIndex === orders.length - 1,
      },
    ]);
  }

  return inlineKeyboard;
};

module.exports = { generateInlineKeyboard }
