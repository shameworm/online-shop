const sendAdminMenu = async (bot, chatId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "Processing Orders", callback_data: "/processing" }],
      [{ text: "All Orders", callback_data: "/all" }],
      [{ text: "Find By Id", callback_data: "/order" }],
    ],
    resize_keyboard: true,
  };
  await bot.sendMessage(chatId, "Admin Menu:", { reply_markup: keyboard });
};

const sendUserMenu = async (bot, chatId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "My Orders", callback_data: "/my_orders_all" }],
      [{ text: "My Active Orders", callback_data: "/orders_active" }],
      [{ text: "Find By Id", callback_data: "/order" }],
    ],
  };
  await bot.sendMessage(chatId, "User Menu:", { reply_markup: keyboard });
};

module.exports = {
  sendAdminMenu,
  sendUserMenu,
}