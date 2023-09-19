const path = require("path");

const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");

const createSessionConfig = require("./config/session");
const expressSession = require("express-session");
const db = require("./data/database");
const errorHandler = require("./middlewares/error-handler");
const addCsrfTokenMiddleware = require("./middlewares/csrf-token");
const authRouter = require("./routes/auth-routes");
const productsRouter = require("./routes/products-routes");
const baseRouter = require("./routes/base-routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("cookie-parser-secret"));

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf("123456789iamasecret987654321look"));

app.use(addCsrfTokenMiddleware);

app.use(baseRouter);
app.use(authRouter);
app.use(productsRouter);

app.use(errorHandler);

db.connectToDatabase()
    .then(() => {
        app.listen(3000);
    })
    .catch((error) => {
        console.log("Failed to connect to database");
        console.log(error);
    });
