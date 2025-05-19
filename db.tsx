import React from "react";
import mongoose from "mongoose";

const api_key: any = process.env.NEXT_PUBLIC_API_KEY;

const connect = async () => {
  try {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(api_key);
    console.log("Connection with the database was successfully established!");
  } catch (error) {
    console.error(
      "There was an error in connecting the databse. (db.tsx): ",
      error
    );
  }
};

export default connect;
