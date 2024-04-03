const path = require("path");

const express = require("express");
const csrf = require("csurf");
const expressSession = require("express-session");

const createSessionConfig = require("./config/session");
const db = require("./data/database");

const addCsrfTokenMiddleware = require("./middlewares/csrf-token");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const checkAuthStatusMiddleware = require("./middlewares/check-authentication-status");
const routesProtectMiddleware = require("./middlewares/protect-routes");
const cartMiddleware = require("./middlewares/cart");
const updateCartPricesMiddleware = require("./middlewares/update-cart-prices");
const notFoundMiddleware = require("./middlewares/not-found");

const authRouter = require("./routes/auth-routes");
const productsRouter = require("./routes/products-routes");
const baseRouter = require("./routes/base-routes");
const adminRouter = require("./routes/admin-routes");
const cartRouter = require("./routes/cart-routes");
const ordersRouter = require("./routes/orders-routes");

const app = express();

app.use(express.static("public"));
app.use("/products/assets", express.static("product-data"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf());

app.use(cartMiddleware);
app.use(updateCartPricesMiddleware);

app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRouter);
app.use(authRouter);
app.use(productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", routesProtectMiddleware, ordersRouter);
app.use("/admin", routesProtectMiddleware, adminRouter);

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(() => {
    app.listen(3000);
  })
  .catch((error) => {
    console.log("Failed to connect to database");
    console.log(error);
  });
