const Order = require("../../models/order-model");
const User = require("../../models/user-model");

const { getOrderMessage } = require('../../util/orders-message')
const { generateInlineKeyboard } = require('../../util/order-inline-keyboard')

const { notifyUserAboutOrderStatusChange, notifyUserAboutTTN } = require('./notification')

const sendProcessingOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const processingOrders = await Order.findByStatus("processing");

    if (!processingOrders || processingOrders.length === 0) {
      await bot.sendMessage(chatId, "No processing orders found.");
      return;
    }

    const order = processingOrders[currentIndex];
    const message = getOrderMessage(order);

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

const sendAllOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const orders = await Order.findAll();

    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, "No orders found.");
      return;
    }

    const order = orders[currentIndex];
    const message = getOrderMessage(order);

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

const sendUserOrders = async (bot, chatId, messageId, currentIndex = 0) => {
  try {
    const user = await User.findByChatId(chatId);
    const orders = await Order.findAllForUser(user._id);

    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, "You don't have any orders yet.");
      return;
    }

    const order = orders[currentIndex];
    const message = getOrderMessage(order);
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
    const message = getOrderMessage(order);
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

      if (user.isAdmin) {
        const order = await Order.findById(orderId);
        if (!order) {
          await bot.sendMessage(chatId, "Order not found.");
          return;
        }
        const message = getOrderMessage(order);
        const inlineKeyboard = generateInlineKeyboard(order, 0, [order], "none");
        await bot.sendMessage(chatId, message, { reply_markup: inlineKeyboard });
      } else {
        const order = await Order.findByIdForUser(orderId, user._id);
        if (!order) {
          await bot.sendMessage(chatId, "Order not found or you don't have access to it.");
          return;
        }
        const message = getOrderMessage(order);
        const inlineKeyboard = generateInlineKeyboard(order, 0, [order], "none", false);
        await bot.sendMessage(chatId, message, { reply_markup: inlineKeyboard });
      }
    } catch (error) {
      console.error("Error finding order by ID:", error);
      await bot.sendMessage(chatId, "An error occurred while finding the order. Please try again.");
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
    if (order.userData.telegramId) {
      await notifyUserAboutOrderStatusChange(bot, orderId, newStatus);
    }
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
      if (order.userData.telegramId) {
        await notifyUserAboutTTN(bot, orderId, ttn)
      }
      await bot.sendAdminMenu();
    } catch (error) {
      console.error("Error adding tracking number:", error);
      await bot.sendMessage(chatId, "Error adding tracking number.");
    }
  });
};

module.exports = {
  changeOrderStatus,
  handleAddTrackingNumber,
  handleFindOrderByIdForUser,
  sendAllOrders,
  sendProcessingOrders,
  sendUserActiveOrders,
  sendUserOrders
}