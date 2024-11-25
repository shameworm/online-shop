const Order = require("../models/order-model");
const User = require("../models/user-model");
const OrderMessage = require("../util/orders-message");

const sendAdminMenu = async (bot, chatId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "Processing Orders", callback_data: "/processing" }],
      [{ text: "All Orders", callback_data: "/all" }],
    ],
    resize_keyboard: true,
  };
  await bot.sendMessage(chatId, "Admin Menu:", { reply_markup: keyboard });
};

const sendUserMenu = async (bot, chatId) => {
  const keyboard = {
    keyboard: [["/orders - My Orders"], ["/status - Check Order Status"]],
    resize_keyboard: true,
  };
  await bot.sendMessage(chatId, "User Menu:", { reply_markup: keyboard });
};

const sendProcessingOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const processingOrders = await Order.findByStatus("processing");

    if (!processingOrders || processingOrders.length === 0) {
      await bot.sendMessage(chatId, "No processing orders found.");
      return;
    }

    const order = processingOrders[currentIndex];
    const message = OrderMessage.getOrderMessage(order);
    console.log(order)

    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "Go back", callback_data: `/navigate_exit` }],
        [
          { text: "Processing", callback_data: `/update_${order._id}_processing` },
          { text: "Packed", callback_data: `/update_${order._id}_packed` },
          { text: "Shipped to Courier", callback_data: `/update_${order._id}_shipped_to_courier` },
        ],
        [
          { text: "In Transit", callback_data: `/update_${order._id}_in_transit` },
          { text: "Arrived", callback_data: `/update_${order._id}_arrived` },
          { text: "Completed", callback_data: `/update_${order._id}_completed` },
        ],
        [{ text: "Rejected", callback_data: `/update_${order._id}_rejected` }],
        [{ text: "Add TTN", callback_data: `/add_ttn_${order._id}` }],
        [
          {
            text: "⬅️",
            callback_data: `/navigate_prev_${currentIndex}`,
            disabled: currentIndex === 0,
          },
          {
            text: "➡️",
            callback_data: `/navigate_next_${currentIndex}`,
            disabled: currentIndex === processingOrders.length - 1,
          },
        ],
      ],
    };

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
    await bot.sendMessage(chatId, "Error fetching orders.");
  }
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
    console.log(order)

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
        [
          {
            text: "⬅️",
            callback_data: `/navigate_all_prev_${currentIndex}`,
            disabled: currentIndex === 0,
          },
          {
            text: "➡️",
            callback_data: `/navigate_all_next_${currentIndex}`,
            disabled: currentIndex === orders.length - 1,
          },
        ],
      ],
    };

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
    await bot.sendMessage(chatId, "Error fetching orders.");
  }
};

const handleUserRegistration = async (bot, msg, chatId) => {
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

    if (!contact || contact.user_id !== msg.from.id) {
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

      await bot.sendMessage(chatId, `Hello, ${user.fullname}! Your Telegram is now connected to our shop.`);
    } catch (error) {
      console.error("Error during registration:", error);
      await bot.sendMessage(chatId, "An error occurred during registration. Try again later.");
    }
  });
};

const changeOrderStatus = async (bot, chatId, orderId, newStatus) => {
  try {
    const order = await Order.findById(orderId);

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
    } catch (error) {
      console.error("Error adding tracking number:", error);
      await bot.sendMessage(chatId, "Error adding tracking number.");
    }
  });
};


module.exports = {
  sendAdminMenu,
  sendUserMenu,
  sendProcessingOrders,
  sendAllOrders,
  handleUserRegistration,
  changeOrderStatus,
  handleAddTrackingNumber,
};
