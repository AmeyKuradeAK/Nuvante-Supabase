import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { hash } from "bcryptjs";

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email: any | null | undefined =
    user?.emailAddresses[0]?.emailAddress;

  if (!user || !global_user_email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existingModel = await clientModel.findOne({ email: global_user_email });

    if (existingModel) {
      // Only update fields that are provided and not "existing"
      const updates: any = {};
      if (body.password !== "existing") {
        updates.password = await hash(body.password, 12);
      }
      if (body.firstName !== "existing") updates.firstName = body.firstName;
      if (body.lastName !== "existing") updates.lastName = body.lastName;
      if (body.address !== "existing") updates.address = body.address;

      await clientModel.updateOne(
        { email: global_user_email },
        { $set: updates }
      );
    } else {
      // Hash password before storing
      const hashedPassword = await hash(body.password, 12);
      
      const new_client = new clientModel({
        username: body.firstName,
        email: global_user_email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: hashedPassword,
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
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
