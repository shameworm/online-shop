const Order = require("../models/order-model");
const User = require("../models/user-model");

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
