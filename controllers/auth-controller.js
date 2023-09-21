const User = require("../models/user-model");
const authUtil = require("../util/authentication");
const validation = require("../util/validation");
const sessionFlash = require("../util/session-flashing");

function getSingup(req, res) {
    let sessionData = sessionFlash.getSessionData(req);

    if (!sessionData) {
        sessionData = {
            email: "",
            password: "",
            confirmPassword: "",
            fullname: "",
            street: "",
            postal: "",
            city: "",
        };
    }

    res.render("customer/auth/signup", { inputData: sessionData });
}

async function signup(req, res, next) {
    const enteredData = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body["confirm-password"],
        fullname: req.body.fullname,
        street: req.body.street,
        postal: req.body.postal,
        city: req.body.city,
    };

    if (
        !validation.userDetailsAreValid(
            req.body.email,
            req.body.password,
            req.body["confirm-password"],
            req.body.fullname,
            req.body.street,
            req.body.postal,
            req.body.city
        ) ||
        !validation.passwordIsConfirmed(
            req.body.password,
            req.body["confirm-password"]
        )
    ) {
        sessionFlash.flashDataToSession(
            req,
            {
                message: `Please check your input. Password must be at least 6 characters long.\n
                    Postal Code must be atleast 5 characters long`,
                ...enteredData,
            },
            () => res.redirect("/signup")
        );

        return;
    }

    const user = new User(
        req.body.email,
        req.body.password,
        req.body.fullname,
        req.body.street,
        req.body.postal,
        req.body.city
    );

    try {
        const existsAlready = await user.existsAlready();

        if (existsAlready) {
            sessionFlash.flashDataToSession(
                req,
                {
                    message: "User already exists!",
                    ...enteredData,
                },
                () => res.redirect("/signup")
            );
            return;
        }

        await user.singup();
    } catch (error) {
        return next(error);
    }

    res.redirect("/login");
}

function getLogin(req, res) {
    let sessionData = sessionFlash.getSessionData(req);

    if (!sessionData) {
        sessionData = {
            email: "",
            password: "",
        };
    }
    res.render("customer/auth/login", {inputData: sessionData});
}

async function login(req, res) {
    const user = new User(req.body.email, req.body.password);
    let existingUser;

    try {
        existingUser = await user.getUserWithSameEmail();
    } catch (error) {
        return next(error);
    }

    const sessionErrorData = {
        message: "Invalid email or password!",
        email: user.email,
        password: user.password,
    };

    if (!existingUser) {
        sessionFlash.flashDataToSession(req, sessionErrorData, () =>
            res.redirect("/login")
        );
        return;
    }

    const passwordIsCorrect = await user.comparePassword(existingUser.password);

    if (!passwordIsCorrect) {
        sessionFlash.flashDataToSession(req, sessionErrorData, () =>
            res.redirect("/login")
        );
        return;
    }

    authUtil.createUserSession(req, existingUser, function () {
        res.redirect("/");
    });
}

function logout(req, res) {
    authUtil.destroyUserAuthSession(req, function () {
        res.redirect("/login");
    });
}

module.exports = {
    getSingup: getSingup,
    getLogin: getLogin,
    signup: signup,
    login: login,
    logout: logout,
};
