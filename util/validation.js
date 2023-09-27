function isEmpty(value) {
    return !value || value.trim() === "";
}

function userCredentialsAreValid(email, password) {
    return (
        email && email.includes("@") && password && password.trim().length > 5
    );
}

function userDetailsAreValid(email, password, fullname, street, city, postal) {
    return (
        userCredentialsAreValid(email, password) &&
        !isEmpty(fullname) &&
        !isEmpty(street) &&
        !isEmpty(city) &&
        !isEmpty(postal)
    );
}

function passwordIsConfirmed(password, confirmedPassword) {
    return password === confirmedPassword;
}

function adminProductsIsvalid(title, summary, price, description) {
    return (
        !isEmpty(title) &&
        !isEmpty(summary) && 
        price > 0 &&
        !isEmpty(description)
    );
}

module.exports = {
    userDetailsAreValid: userDetailsAreValid,
    passwordIsConfirmed: passwordIsConfirmed,
    adminProductsIsvalid: adminProductsIsvalid
};
