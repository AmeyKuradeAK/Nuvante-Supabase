import productModel from "@/models/Product";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";

export async function GET(request: any) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;
  if (user) {
    try {
      await clientModel.deleteOne({ email: global_user_email });
    } catch (error: any) {
      console.error("in api/propagation/route.ts: ", error);
      return new NextResponse("404");
    }
  } else {
    console.log("No sign in found.");
    return new Response("404");
  }
}
