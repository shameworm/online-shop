const TelegramBot = require("node-telegram-bot-api");
const { botToken } = require("../config/telegram");
const { handleStartCommand } = require("../controllers/telegram-controller");
const { sendProcessingOrders, sendAllOrders, sendUserOrders, sendUserActiveOrders, changeOrderStatus, handleAddTrackingNumber, handleFindOrderByIdForUser } = require("../controllers/telegram/order");
const { handleUserRegistration } = require("../controllers/telegram/auth");
const { sendAdminMenu, sendUserMenu } = require("../controllers/telegram/menu");

class TelegramBotService {
    constructor() {
        this.bot = new TelegramBot(botToken, { polling: true });
        this.initializeBot();
    }

    initializeBot() {
        this.bot.on("callback_query", async (query) => {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;

            try {
                if (data === "/register") {
                    await handleUserRegistration(this.bot, query.message, chatId)
                } else if (data === "/processing") {
                    await sendProcessingOrders(this.bot, chatId);
                } else if (data === "/all") {
                    await sendAllOrders(this.bot, chatId);
                } else if (data === "/order") {
                    await handleFindOrderByIdForUser(this.bot, chatId);
                } else if (data.startsWith("/navigate_processing_prev")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await sendProcessingOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_processing_next")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await sendProcessingOrders(this.bot, chatId, messageId, currentIndex + 1);
                } else if (data.startsWith("/navigate_all_prev")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await sendAllOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_all_next")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await sendAllOrders(this.bot, chatId, messageId, currentIndex + 1);
                } else if (data === "/navigate_exit") {
                    await sendAdminMenu(this.bot, chatId);
                } else if (data === "/navigate_user_exit") {
                    await sendUserMenu(this.bot, chatId);
                } else if (data.startsWith("/update")) {
                    const [, orderId, newStatus] = data.split("_");
                    await changeOrderStatus(this.bot, chatId, orderId, newStatus);
                } else if (data.startsWith("/add_ttn_")) {
                    const orderId = data.split("_")[2];
                    await handleAddTrackingNumber(this.bot, query.message, chatId, orderId);
                } else if (data === "/my_orders_all") {
                    await sendUserOrders(this.bot, chatId);
                } else if (data === "/orders_active") {
                    await sendUserActiveOrders(this.bot, chatId);
                } else if (data.startsWith("/navigate_user_prev")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await sendUserOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_user_next")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await sendUserOrders(this.bot, chatId, messageId, currentIndex + 1);
                } else if (data.startsWith("/navigate_user_active_prev")) {
                    const currentIndex = parseInt(data.split("_")[4], 10);
                    await sendUserActiveOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_user_active_next")) {
                    const currentIndex = parseInt(data.split("_")[4], 10);
                    await sendUserActiveOrders(this.bot, chatId, messageId, currentIndex + 1);
                }
                await this.bot.answerCallbackQuery(query.id);
            } catch (error) {
                console.error("Error handling callback query:", error);
            }
        });

        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            await handleStartCommand(this.bot, chatId);
        });
    }
}

module.exports = TelegramBotService;
