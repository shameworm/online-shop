const mongodb = require("mongodb");
require("dotenv").config();

const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
    const client = await MongoClient.connect(process.env.MONGO_URI || "");
    database = client.db("online-shop");
}

function getDatabase() {
    if (!database) {
        throw new Error("Database not found, try to connect first!");
    }

    return database;
}

module.exports = {
    connectToDatabase: connectToDatabase,
    getDatabase: getDatabase
};

