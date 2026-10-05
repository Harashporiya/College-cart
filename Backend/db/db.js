const mongoose = require("mongoose")
require('dotenv').config();

const connectMongdb = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set - the API cannot serve any request that touches the database.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 1,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

mongoose.connection.on('disconnected', () => {
    console.warn("MongoDB disconnected - the driver will retry automatically.");
});

mongoose.connection.on('error', (error) => {
    console.error("MongoDB error:", error.message);
});

module.exports = connectMongdb
