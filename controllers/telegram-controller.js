const Order = require("../models/order-model");
const User = require("../models/user-model");
const { generateInlineKeyboard } = require('../util/order-inline-keyboard');
const OrderMessage = require("../util/orders-message");

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
    console.log(msgWithContact)
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

const notifyAdminAboutNewOrder = async (bot, chatId, order) => {
  try {
    console.log(order)
    const message = OrderMessage.getOrderMessage(order);
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching processing orders:", error);
  }
}

const sendProcessingOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const processingOrders = await Order.findByStatus("processing");

    if (!processingOrders || processingOrders.length === 0) {
      await bot.sendMessage(chatId, "No processing orders found.");
      return;
    }

    const order = processingOrders[currentIndex];
    const message = OrderMessage.getOrderMessage(order);

    const inlineKeyboard = generateInlineKeyboard(order, currentIndex, processingOrders);

    if (messageId) {
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: inlineKeyboard,
      });
    } else {
      const sentMessage = await bot.sendMessage(chatId, message, {
        reply_markup: inlineKeyboard,
      });
      messageId = sentMessage.message_id;
    }
  } catch (error) {
    console.error("Error fetching processing orders:", error);
  }
};

const sendOrderById = async (bot, chatId, orderId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      await bot.sendMessage(chatId, `Order with this id not found.`);
      return;
    }

    const message = OrderMessage.getOrderMessage(order);

    const inlineKeyboard = generateInlineKeyboard(order, 0, order, "none",);


    await bot.sendMessage(chatId, message, {
      reply_markup: inlineKeyboard
    });
  } catch (error) {
    console.error(`Failed to fetch order`, error);
  }
};

const handleFindOrderById = async (bot, chatId) => {
  await bot.sendMessage(chatId, "Please enter the Order ID:");

  bot.once("message", async (msgWithOrderId) => {
    const orderId = msgWithOrderId.text;

    if (!orderId) {
      await bot.sendMessage(chatId, "Invalid Order ID. Please try again.");
      return;
    }

    try {
      await sendOrderById(bot, chatId, orderId);
    } catch (error) {
      console.error("Error finding order by ID:", error);
      await bot.sendMessage(chatId, "An error occurred while finding the order. Please try again.");
    }
  });
};

const sendAllOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const orders = await Order.findAll();

    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, "No orders found.");
      return;
    }

    const order = orders[currentIndex];
    const message = OrderMessage.getOrderMessage(order);

    const inlineKeyboard = generateInlineKeyboard(order, currentIndex, orders, 'all');

    if (messageId) {
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: inlineKeyboard,
      });
    } else {
      const sentMessage = await bot.sendMessage(chatId, message, {
        reply_markup: inlineKeyboard,
      });
      messageId = sentMessage.message_id;
    }
  } catch (error) {
    console.error("Error fetching all orders:", error);
  }
};

const changeOrderStatus = async (bot, chatId, orderId, newStatus) => {
  try {
    const order = await Order.findById(orderId);
    console.log(order)

    if (!order) {
      await bot.sendMessage(chatId, `Order #${orderId} not found.`);
      return;
    }

    order.status = newStatus;
    await order.save();

    await bot.sendMessage(chatId, `Order #${orderId} status updated to ${newStatus}.`);

  } catch (error) {
    console.error("Error updating order status:", error);
    await bot.sendMessage(chatId, `Failed to update order #${orderId} status.`);
  }
};


const handleAddTrackingNumber = async (bot, msg, chatId, orderId) => {
  await bot.sendMessage(chatId, `Please enter the tracking number for Order #${orderId}:`);

  bot.once("message", async (msgWithTtn) => {
    const ttn = msgWithTtn.text;


    if (!ttn) {
      await bot.sendMessage(chatId, "Invalid tracking number. Please try again.");
      return;
    }

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        await bot.sendMessage(chatId, `Order #${orderId} not found.`);
        return;
      }

      order.ttn = ttn;
      order.status = "shipping"
      await order.save();

      await bot.sendMessage(chatId, `Tracking number for Order #${orderId} has been added: ${ttn}`);
      await bot.sendAdminMenu();
    } catch (error) {
      console.error("Error adding tracking number:", error);
      await bot.sendMessage(chatId, "Error adding tracking number.");
    }
  });
};

const sendUserOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const user = await User.findByChatId(chatId);
    const orders = await Order.findAllForUser(user._id);

    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, "You don't have any orders yet.");
      return;
    }

    const order = orders[currentIndex];
    const message = OrderMessage.getOrderMessage(order);
    const inlineKeyboard = generateInlineKeyboard(order, currentIndex, orders, 'user', false);

    if (messageId) {
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: inlineKeyboard,
      });
    } else {
      const sentMessage = await bot.sendMessage(chatId, message, {
        reply_markup: inlineKeyboard,
      });
      messageId = sentMessage.message_id;
    }
  } catch (error) {
    console.error("Error fetching user orders:", error);
  }
};

const sendUserActiveOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const user = await User.findByChatId(chatId);
    const orders = await Order.findActiveForUser(user._id);

    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, "You don't have any active orders.");
      return;
    }

    const order = orders[currentIndex];
    const message = OrderMessage.getOrderMessage(order);
    const inlineKeyboard = generateInlineKeyboard(order, currentIndex, orders, 'user_active', false);

    if (messageId) {
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: inlineKeyboard,
      });
    } else {
      const sentMessage = await bot.sendMessage(chatId, message, {
        reply_markup: inlineKeyboard,
      });
      messageId = sentMessage.message_id;
    }
  } catch (error) {
    console.error("Error fetching user active orders:", error);
  }
};

const handleFindOrderByIdForUser = async (bot, chatId) => {
  await bot.sendMessage(chatId, "Please enter the Order ID:");

  bot.once("message", async (msgWithOrderId) => {
    const orderId = msgWithOrderId.text;

    if (!orderId) {
      await bot.sendMessage(chatId, "Invalid Order ID. Please try again.");
      return;
    }

    try {
      const user = await User.findByChatId(chatId);
      const order = user.isAdmin
        ? await Order.findById(orderId)
        : await Order.findByIdForUser(orderId, user._id);

      if (!order) {
        await bot.sendMessage(chatId, "Order not found or you don't have access to it.");
        return;
      }

      const message = OrderMessage.getOrderMessage(order);
      const inlineKeyboard = generateInlineKeyboard(order, 0, [order], "none");

      await bot.sendMessage(chatId, message, {
        reply_markup: inlineKeyboard
      });
    } catch (error) {
      console.error("Error finding order by ID:", error);
      await bot.sendMessage(chatId, "An error occurred while finding the order. Please try again.");
    }
  });
};


module.exports = {
  sendAdminMenu,
  sendUserMenu,
  sendProcessingOrders,
  sendOrderById,
  sendAllOrders,
  handleFindOrderById,
  handleUserRegistration,
  changeOrderStatus,
  handleAddTrackingNumber,
  notifyAdminAboutNewOrder,
  handleStartCommand,
  checkUserAuth,
  sendUserOrders,
  sendUserActiveOrders,
  handleFindOrderByIdForUser,
};