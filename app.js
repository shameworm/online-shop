const path = require("path");

const express = require("express");
const csrf = require("csurf");

const createSessionConfig = require("./config/session");
const expressSession = require("express-session");
const db = require("./data/database");
const errorHandler = require("./middlewares/error-handler");
const checkAuthStatusMiddleware = require("./middlewares/check-authentication-status");
const addCsrfTokenMiddleware = require("./middlewares/csrf-token");
const authRouter = require("./routes/auth-routes");
const productsRouter = require("./routes/products-routes");
const baseRouter = require("./routes/base-routes");
const adminRouter = require("./routes/admin-routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use("/products/assets", express.static("product-data"));
app.use(express.urlencoded({ extended: false }));

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf());

app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRouter);
app.use(authRouter);
app.use(productsRouter);
app.use("/admin", adminRouter);

app.use(errorHandler);

db.connectToDatabase()
    .then(() => {
        app.listen(3000);
    })
    .catch((error) => {
        console.log("Failed to connect to database");
        console.log(error);
    });
