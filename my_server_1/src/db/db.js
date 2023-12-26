import mongoose from 'mongoose';
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionString = `${process.env.MONGODB_URI}/${DB_NAME}`;
        console.log("Connecting to MongoDB:", connectionString);

        const connectionInstance = await mongoose.connect(connectionString);

        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection error:", error);
        process.exit(1);
    }
}

export default connectDB;
