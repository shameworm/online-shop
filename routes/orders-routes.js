const express = require("express");

const ordersCountroller = require("../controllers/orders-controller");

const router = express.Router();

router.get("/", ordersCountroller.getOrders);

router.post("/", ordersCountroller.addOrder);


module.exports = router;