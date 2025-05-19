import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email: any | null | undefined =
    user?.emailAddresses[0]?.emailAddress;

  try {
    const body = await request.json();
    const existingModel =
      body.email === "existing"
        ? await clientModel.findOne({ email: global_user_email })
        : await clientModel.findOne({ email: body.email });

    if (existingModel) {
      console.log("Updating existing client...");
      if (body.password !== "existing") existingModel.password = body.password;
      if (body.firstName !== "existing")
        existingModel.firstName = body.firstName;
      if (body.lastName !== "existing") existingModel.lastName = body.lastName;
      if (body.address !== "existing") existingModel.address = body.address;
      await existingModel.save();
      console.log("Saving the data for an existing user...");
    } else {
      console.log("Creating new client...");
      const new_client = new clientModel({
        username: body.firstName,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: body.password,
        address: body.address,
        cart: [],
        wishlist: [],
      });
      await new_client.save();
    }
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}
