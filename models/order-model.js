const mongodb = require("mongodb");

const db = require("../data/database");

class Order {
    // Status => pending, fulfilled, cancelled
    constructor(cart, userData, status = "processing", date, orderId, ttn = "") {
        this.productData = cart;
        this.userData = userData;
        this.status = status;
        this.date = new Date(date);
        if (this.date) {
            this.formattedDate = this.date.toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        }
        this.id = orderId;
        this.ttn = ttn;
    }

    static transformOrderDocument(orderDoc) {
        return new Order(
            orderDoc.productData,
            orderDoc.userData,
            orderDoc.status,
            orderDoc.date,
            orderDoc._id,
            orderDoc.ttn
        );
    }

    static transformOrderDocuments(orderDocs) {
        return orderDocs.map(this.transformOrderDocument);
    }

    static async findAll() {
        const orders = await db
            .getDatabase()
            .collection("orders")
            .find()
            .sort({ _id: -1 })
            .toArray();

        return this.transformOrderDocuments(orders);
    }

    static async findAllForUser(userId) {
        const uid = new mongodb.ObjectId(userId);

        const orders = await db
            .getDatabase()
            .collection("orders")
            .find({ "userData._id": uid })
            .sort({ _id: -1 })
            .toArray();

        return this.transformOrderDocuments(orders);
    }

    static async findById(orderId) {
        const order = await db
            .getDatabase()
            .collection("orders")
            .findOne({ _id: new mongodb.ObjectId(orderId) });

        return this.transformOrderDocument(order);
    }

    static async findByStatus(status) {
        return db
            .getDatabase()
            .collection("orders")
            .find({ status }).toArray();
    }

    save() {
        if (this.id) {
            const orderId = new mongodb.ObjectId(this.id);
            return db
                .getDatabase()
                .collection("orders")
                .updateOne({ _id: orderId }, { $set: { status: this.status, ttn: this.ttn } });
        } else {
            const orderDocument = {
                userData: this.userData,
                productData: this.productData,
                date: new Date(),
                status: this.status,
                ttn: this.ttn
            };

            return db.getDatabase().collection("orders").insertOne(orderDocument);
        }
    }
}

module.exports = Order;
