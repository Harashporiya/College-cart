const mongoose = require("mongoose")
require('dotenv').config();

const connectMongdb = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set - the API cannot serve any request that touches the database.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // The default is 30s. On a suspended instance every request -
            // a login included - queues behind server selection, so a
            // misconfigured or unreachable cluster made login appear to hang
            // for half a minute instead of failing quickly.
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            // Keeping a warm pool means a burst of requests after a cold start
            // does not each pay a fresh handshake.
            maxPoolSize: 10,
            minPoolSize: 1,
        });
        console.log("MongoDB connected");
    } catch (error) {
        // The previous version was a bare `.then()` with no `.catch()`, so a
        // failed connection surfaced only as an unhandled promise rejection
        // and the server carried on accepting requests that could never
        // succeed.
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
