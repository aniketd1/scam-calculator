import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI must be defined in .env");
  }

  mongoose.set("strictQuery", false);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected to ${conn.connection.host}`);
}
