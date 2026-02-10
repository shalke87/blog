import mongoose from "mongoose";

export async function connectDB() {
  try {
    console.log("MONGO_URI runtime:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connesso con successo");
  } catch (err) {
    console.error("Errore di connessione a MongoDB:", err);
    process.exit(1); // interrompe l'app se il DB non è raggiungibile
  }
}

// Eventi utili per debug
mongoose.connection.on("error", err => {
  console.error("Errore Mongoose:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnesso");
});
