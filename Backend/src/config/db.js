import mongoose from "mongoose";

const connectDB = async () => {
    const connection = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
    return connection;
};

export default connectDB;
