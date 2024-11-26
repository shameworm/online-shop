const Order = require("../models/order-model");
const User = require("../models/user-model");

const { notifyAdminAboutNewOrder, notifyUserAboutNewOrder } = require("../controllers/telegram/notification")


async function getOrders(req, res, next) {
    try {
        const orders = await Order.findAllForUser(res.locals.uid);
        res.render("customer/orders/all-orders", {
            orders: orders,
        });
    } catch (error) {
        next(error);
    }
}

async function addOrder(req, res, next) {
    let userDoc;

    const cart = res.locals.cart;
    try {
        userDoc = await User.findById(res.locals.uid);
    } catch (error) {
        return next(error);
    }

    const order = new Order(cart, userDoc);

    try {
        await order.save();

        const admins = await User.findAllAdmins();

        for (const admin of admins) {
            if (admin.telegramId) {
                await notifyAdminAboutNewOrder(global.telegramBot.bot, admin.telegramId, order);
            }
        }

        if (order.userData.telegramId) {
            await notifyUserAboutNewOrder(global.telegramBot.bot, order.userData.telegramId, order);
        }
    } catch (error) {
        return next(error);
    };

    req.session.cart = null;
    res.redirect("/orders");
}

module.exports = {
    addOrder: addOrder,
    getOrders: getOrders,
};
