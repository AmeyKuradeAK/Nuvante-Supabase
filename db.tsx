import React from "react";
import mongoose from "mongoose";

const api_key: any = process.env.NEXT_PUBLIC_API_KEY;

const connect = async () => {
  try {
    if (mongoose.connections[0].readyState) return;
    
    // Add connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(api_key, options);
    console.log("Connection with the database was successfully established!");

    // Add connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Add disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connect, 5000); // Try to reconnect after 5 seconds
    });

  } catch (error) {
    console.error(
      "There was an error in connecting the database. (db.tsx): ",
      error
    );
    // Try to reconnect after 5 seconds
    setTimeout(connect, 5000);
  }
};

export default connect;
