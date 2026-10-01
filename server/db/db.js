import mongoose from "mongoose";

const dbUrl = process.env.ATLASDB_URL;

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(dbUrl);

    console.log("MongoDB Atlas connected successfully");
    console.log("Database:", connection.connection.name);
    console.log("Host:", connection.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectToDatabase;