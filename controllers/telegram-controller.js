const { checkUserAuth, sendAuthMenu } = require("./telegram/auth");
const { sendAdminMenu, sendUserMenu } = require("./telegram/menu")

const handleStartCommand = async (bot, chatId) => {
  try {
    const { isAuthenticated, isAdmin } = await checkUserAuth(chatId);

    if (!isAuthenticated) {
      await sendAuthMenu(bot, chatId);
      return;
    }

    const keyboard = [
      [
        {
          text: "Menu",
        },
      ],
    ];
    const options = {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };

    if (isAdmin) {
      await sendAdminMenu(bot, chatId, options);
    } else {
      await sendUserMenu(bot, chatId, options);
    }
  } catch (error) {
    console.error("Error handling start command:", error);
    await bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
};


module.exports = {
  handleStartCommand,
};