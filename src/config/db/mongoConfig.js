// ---------------------------------------------Imports---------------------------------------------------
import mongoose from "mongoose";

// -------------------------------------------------------------------------------------------------------

// connectMongo -- function to call in order to connect to the database
export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.MONGO_DB_NAME,
    });

    console.log("Connected to Mongo Successfully");
  } catch (error) {
    console.log(error.message);
  }
};