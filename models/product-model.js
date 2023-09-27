const mongodb = require("mongodb");
const fs = require("fs");

const db = require("../data/database");

class Product {
    constructor(productData) {
        this.title = productData.title;
        this.summary = productData.summary;
        this.price = +productData.price;
        this.description = productData.description;
        this.image = productData.image; // Name of the product image file
        this.updateImageData();

        if (productData._id) {
            this.id = productData._id.toString();
        }
    }

    static async findById(productId) {
        let prodId;
        try {
            prodId = new mongodb.ObjectId(productId);
        } catch (err) {
            error.code = 404;
            throw error;
        }

        const product = await db
            .getDatabase()
            .collection("products")
            .findOne({ _id: prodId });

        if (!product) {
            const error = new Error("Product not found");
            error.code = 404;
            throw error;
        }

        return new Product(product);
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

        if (this.id) {
            const prodId = new mongodb.ObjectId(this.id);

            if (!this.image) {
                delete productDoc.image;
            }

            await db.getDatabase().collection("products").updateOne(
                { _id: prodId },
                {
                    $set: productDoc,
                }
            );
        } else {
            await db.getDatabase().collection("products").insertOne(productDoc);
        }
    }

    updateImageData() {
        this.imagePath = `product-data/images/${this.image}`; // image path
        this.imageUrl = `/products/assets/images/${this.image}`;
    }

    replaceImage(newImage) {
        this.image = newImage;
        this.updateImageData();
    }

    async remove() {
        const prodId = new mongodb.ObjectId(this.id);
        await db.getDatabase().collection("products").deleteOne({_id: prodId});
    }
}

module.exports = Product;
