const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");

const db = require("../data/database");

class User {
    constructor(email, password, fullname, street, postal, city, phoneNumber, telegramId) {
        this.email = email;
        this.password = password;
        this.fullname = fullname;
        this.address = { street: street, city: city, postal: postal };
        this.phoneNumber = phoneNumber;
        this.telegramId = this.telegramId || undefined;
    }

    static findById(userId) {
        const uid = new mongodb.ObjectId(userId);

        return db
            .getDatabase()
            .collection("users")
            .findOne({ _id: uid }, { projection: { password: 0 } });
    }

    static setChatIdByPhoneNumber(phoneNumber, chatId) {
        return db
            .getDatabase()
            .collection("users")
            .findOneAndUpdate(
                { phoneNumber },
                { $set: { telegramId: chatId } },
                { returnDocument: "after" }
            );
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
            phoneNumber: this.phoneNumber,
        });
    }

    comparePassword(hashedPassword) {
        return bcrypt.compare(this.password, hashedPassword);
    }
}

module.exports = User;
