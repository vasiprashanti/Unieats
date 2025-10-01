import { connect } from "mongoose";

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the connection string from the .env file
    const conn = await connect(process.env.MONGO_URI);

    // If the connection is successful, log a confirmation message
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If there's an error during connection, log the error message
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Exit the application with a failure code (1)
    process.exit(1);
  }
};

// Export the connectDB function so other files can use it
export default connectDB;
