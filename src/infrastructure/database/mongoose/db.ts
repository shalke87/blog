import mongoose from "mongoose";

export async function connectDB() {
  try {
    console.log("MONGO_URI runtime:", process.env.MONGO_URI);
    const uri : string = process.env.MONGO_URI!;
    if (!uri) {
      throw new Error("MONGO_URI undefined");
    }
    await mongoose.connect(uri);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // exit the app if the DB is not reachable
  }
}

// Useful events for debugging
mongoose.connection.on("error", err => {
  console.error("Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});
