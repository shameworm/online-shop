const db = require("../data/database");

class Product {
    constructor(productData) {
        this.title = productData.title;
        this.summary = productData.summary;
        this.price = +productData.price;
        this.description = productData.description;
        this.image = productData.image; // Name of the product image file
        this.imagePath = `product-data/images/${productData.image}`; // image path
        this.imageUrl = `/products/assets/images/${productData.image}`;

        if (productData._id) {
            this.id = productData._id.toString();
        }
    }

    static async findAll() {
        const products = await db
            .getDatabase()
            .collection("products")
            .find()
            .toArray();

        return products.map((productDoc) => {
            return new Product(productDoc);
        });
    }

    async save() {
        const productDoc = {
            title: this.title,
            summary: this.summary,
            price: this.price,
            description: this.description,
            image: this.image,
        };

        await db.getDatabase().collection("products").insertOne(productDoc);
    }
}

module.exports = Product;
