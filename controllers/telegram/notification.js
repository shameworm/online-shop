const { getOrderMessage } = require('../../util/orders-message')
const Order = require("../../models/order-model");

const notifyAdminAboutNewOrder = async (bot, chatId, order) => {
  try {
    const message = getOrderMessage(order);
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching processing orders:", error);
  }
}

const notifyUserAboutNewOrder = async (bot, chatId, order) => {
  try {
    const message = getOrderMessage(order);
    await bot.sendMessage(chatId, "We receive your order. Thanks for shopping with us. 😊");
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching processing orders:", error);
  }
}

const notifyUserAboutOrderStatusChange = async (bot, orderId, newStatus) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order #${orderId} not found.`);
      return;
    }
    const message = `Your order #${orderId} status has been updated to: ${newStatus}.`;
    await bot.sendMessage(order.userData?.telegramId, message);

  } catch (error) {
    console.error("Error sending notification about order status change:", error);
  }
};


const notifyUserAboutTTN = async (bot, orderId, ttn) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      console.error(`Order #${orderId} not found.`);
      return;
    }

    const message = `A tracking number (TTN) has been added to your order #${orderId}: ${ttn}.`;
    await bot.sendMessage(order.userData.telegramId, message);
  } catch (error) {
    console.error("Error sending notification about TTN addition:", error);
  }
};

module.exports = {
  notifyAdminAboutNewOrder,
  notifyUserAboutNewOrder,
  notifyUserAboutOrderStatusChange,
  notifyUserAboutTTN
}