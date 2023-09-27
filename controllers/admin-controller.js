const Product = require("../models/product-model");
const validation = require("../util/validation");
const sessionFlash = require("../util/session-flashing");

async function getProducts(req, res, next) {
    try {
        const products = await Product.findAll();
        res.render("admin/products/all-products", { products: products });
    } catch (err) {
        next(err);
        return;
    }
}

function getNewProduct(req, res) {
    let sessionData = sessionFlash.getSessionData(req);

    if (!sessionData) {
        sessionData = {
            title: "",
            summary: "",
            price: "",
            description: "",
        };
    }

    res.render("admin/products/new-product", { inputData: sessionData });
}

async function createNewProduct(req, res, next) {
    const enteredData = {
        title: req.body.title,
        summary: req.body.summary,
        price: req.body.price,
        description: req.body.description,
    };

    if (!req.file || !req.file.filename) {
        sessionFlash.flashDataToSession(
            req,
            {
                message: "Please upload an image",
                ...enteredData,
            },
            () => res.redirect("/admin/products/new")
        );
        return;
    }

    if (
        !validation.adminProductsIsvalid(
            enteredData.title,
            enteredData.summary,
            enteredData.price,
            enteredData.description,
        )
    ) {
        sessionFlash.flashDataToSession(
            req,
            {
                message:
                    "Please fill out all fields (reminder price must be greater than 0)",
                ...enteredData,
            },
            () => res.redirect("/admin/products/new")
        );
        return;
    }

    const product = new Product({
        ...req.body,
        image: req.file.filename,
    });

    try {
        await product.save();
    } catch (err) {
        next(err);
        return;
    }

    res.redirect("/admin/products");
}

async function getUpdateProduct(req, res, next) {
    try {
        const product = await Product.findById(req.params.id);
        res.render("admin/products/update-product", {
            product: product,
        });
    } catch (error) {
        next(error);
        return;
    }
}

async function updateProduct(req, res, next) {
    const product = new Product({
        ...req.body,
        _id: req.params.id,
    });

    if (req.file) {
        product.replaceImage(req.file.filename);
    }

    try {
        await product.save();
    } catch (err) {
        next(err);
        return;
    }
    
    await Product.deleteUnusedImages();
    res.redirect("/admin/products");
}

async function deleteProduct(req, res, next) {
    let product;
    try {
        product = await Product.findById(req.params.id);
        await product.remove();
    } catch (error) {
        next(error);
        return;
    }

    res.json({
        message: "Deleted product",
    });
}

module.exports = {
    getProducts: getProducts,
    getNewProduct: getNewProduct,
    createNewProduct: createNewProduct,
    getUpdateProduct: getUpdateProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
};
