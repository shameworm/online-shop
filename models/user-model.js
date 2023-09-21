const bcrypt = require("bcryptjs");

const db = require("../data/database");

class User {
    constructor(email, password, fullname, street, postal, city) {
        this.email = email;
        this.password = password;
        this.fullname = fullname;
        this.address = { street: street, city: city, postal: postal };
    }
    
    getUserWithSameEmail() {
        return db
            .getDatabase()
            .collection("users")
            .findOne({ email: this.email });
    }

    async existsAlready() {
        const existingUser = await this.getUserWithSameEmail();
        return existingUser ? true : false;
    }

    async singup() {
        const hashedPassword = await bcrypt.hash(this.password, 12);

        await db.getDatabase().collection("users").insertOne({
            email: this.email,
            password: hashedPassword,
            fullname: this.fullname,
            address: this.address,
        });
    }


    comparePassword(hashedPassword) {
        return bcrypt.compare(this.password, hashedPassword);
    }
}

module.exports = User;
