const User = require("../../models/user-model");
const { sendAdminMenu, sendUserMenu } = require("./menu");

const checkUserAuth = async (chatId) => {
  try {
    const user = await User.findByChatId(chatId);
    return user ? { isAuthenticated: true, isAdmin: user.isAdmin } : { isAuthenticated: false };
  } catch (error) {
    console.error("Error checking user auth:", error);
    return { isAuthenticated: false };
  }
};

const sendAuthMenu = async (bot, chatId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "Register", callback_data: "/register" }],
    ],
  };
  await bot.sendMessage(
    chatId,
    "Welcome! Please register to access the menu.",
    { reply_markup: keyboard }
  );
};


const handleUserRegistration = async (bot, msg, chatId) => {
  const { isAuthenticated } = await checkUserAuth(chatId);

  if (isAuthenticated) {
    await bot.sendMessage(chatId, "You are already registered!");
    return;
  }

  const keyboard = {
    reply_markup: {
      keyboard: [
        [
          {
            text: "Share Contact",
            request_contact: true,
          },
        ],
      ],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  };

  await bot.sendMessage(
    chatId,
    "Please share your phone number to complete registration.",
    keyboard
  );

  bot.once("contact", async (msgWithContact) => {
    const contact = msgWithContact.contact;
    if (!contact || !contact.phone_number) {
      await bot.sendMessage(chatId, "Invalid contact. Try again.");
      return;
    }

    try {
      const phoneNumber = contact.phone_number;
      const user = await User.setChatIdByPhoneNumber(phoneNumber, chatId);

      if (!user) {
        await bot.sendMessage(chatId, "Could not find your account in the database.");
        return;
      }

      await bot.sendMessage(
        chatId,
        `Hello, ${user.fullname}! Your Telegram is now connected to our shop.`
      );

      if (user.isAdmin) {
        await sendAdminMenu(bot, chatId);
      } else {
        await sendUserMenu(bot, chatId);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      await bot.sendMessage(chatId, "An error occurred during registration. Try again later.");
    }
  });
};

module.exports = {
  handleUserRegistration,
  sendAuthMenu,
  checkUserAuth
}