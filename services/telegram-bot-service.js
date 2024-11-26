const TelegramBot = require("node-telegram-bot-api");
const { botToken, adminChatId } = require("../config/telegram");
const TelegramController = require("../controllers/telegram-controller");

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
                    await TelegramController.handleUserRegistration(this.bot, query.message, chatId)
                } else if (data === "/processing" && chatId.toString() === adminChatId) {
                    await TelegramController.sendProcessingOrders(this.bot, chatId);
                } else if (data === "/all" && chatId.toString() === adminChatId) {
                    await TelegramController.sendAllOrders(this.bot, chatId);
                } else if (data === "/order") {
                    await TelegramController.handleFindOrderById(this.bot, chatId);
                } else if (data.startsWith("/navigate_processing_prev")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await TelegramController.sendProcessingOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_processing_next")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await TelegramController.sendProcessingOrders(this.bot, chatId, messageId, currentIndex + 1);
                } else if (data.startsWith("/navigate_all_prev")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await TelegramController.sendAllOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_all_next")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await TelegramController.sendAllOrders(this.bot, chatId, messageId, currentIndex + 1);
                } else if (data === "/navigate_exit") {
                    await TelegramController.sendAdminMenu(this.bot, chatId);
                } else if (data === "/navigate_user_exit") {
                    await TelegramController.sendUserMenu(this.bot, chatId);
                } else if (data.startsWith("/update")) {
                    const [, orderId, newStatus] = data.split("_");
                    await TelegramController.changeOrderStatus(this.bot, chatId, orderId, newStatus);
                } else if (data.startsWith("/add_ttn_")) {
                    const orderId = data.split("_")[2];
                    await TelegramController.handleAddTrackingNumber(this.bot, query.message, chatId, orderId);
                }
                else if (data === "/my_orders_all") {
                    await TelegramController.sendUserOrders(this.bot, chatId);
                } else if (data === "/orders_active") {
                    await TelegramController.sendUserActiveOrders(this.bot, chatId);
                } else if (data.startsWith("/navigate_user_prev")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await TelegramController.sendUserOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_user_next")) {
                    const currentIndex = parseInt(data.split("_")[3], 10);
                    await TelegramController.sendUserOrders(this.bot, chatId, messageId, currentIndex + 1);
                } else if (data.startsWith("/navigate_user_active_prev")) {
                    const currentIndex = parseInt(data.split("_")[4], 10);
                    await TelegramController.sendUserActiveOrders(this.bot, chatId, messageId, currentIndex - 1);
                } else if (data.startsWith("/navigate_user_active_next")) {
                    const currentIndex = parseInt(data.split("_")[4], 10);
                    await TelegramController.sendUserActiveOrders(this.bot, chatId, messageId, currentIndex + 1);
                }
                await this.bot.answerCallbackQuery(query.id);
            } catch (error) {
                console.error("Error handling callback query:", error);
            }
        });

        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            await TelegramController.handleStartCommand(this.bot, chatId);
        });


        this.bot.onText(/\/processing/, async (msg) => {
            const chatId = msg.chat.id;
            if (chatId.toString() === adminChatId) {
                await TelegramController.sendProcessingOrders(this.bot, chatId);
            }
        });

        this.bot.onText(/\/order (\d+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const orderId = match[1];
            await TelegramController.sendOrderById(this.bot, chatId, orderId);
        });

        this.bot.onText(/\/all/, async (msg) => {
            const chatId = msg.chat.id;
            await TelegramController.sendAllOrders(this.bot, chatId);
        });
    }
}

module.exports = TelegramBotService;
