function getSingup(req, res) {
    res.render("customer/auth/signup");
}

function getLogin(req, res) {
    //................................................................
}

module.exports = {
    getSingup: getSingup,
    getLogin: getLogin,
}