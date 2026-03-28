import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  // Connect once during server startup and let mongoose manage the pool.
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};
