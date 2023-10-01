const db = require("../data/database");

class Order {
    // Status => pending, fulfilled, cancelled
    constructor(cart, userData, status = "Pending", date, orderId) {
        this.productData = cart;
        this.useData = userData;
        this.status = status;
        this.date = new Date(date);

        if (this.date) {
            this.formattedData = this.date.toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        }

        this.id = orderId;
    }

    async save() {
        if (this.id) {
            //Updating
        } else {
            //New order
            const orderDoc = {
                userData: this.useData,
                productData: this.productData,
                date: new Date(),
                status: this.status,
            };

            await db.getDatabase().collection("orders").insertOne(orderDoc);
        }
    }
}

module.exports = Order;
