import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

/**
 * 1.Client propagation api, used to propagate a specific client's data to a client side code.
 * 2.used promises to handle exceptions.
 * 3.NextResponse(404) is just an expression to stay safe.
 * TODO: make global variables like 200, 404, don't use hard-coded strings to manifest errors.
 */

export async function GET() {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;
  // if (user) {
  try {
    const database_obj = await clientModel
      .findOne({ email: global_user_email })
      .then((data) => {
        return data;
      });
    // if (database_obj === null) {
    //   return new NextResponse("404");
    // }
    return new NextResponse(JSON.stringify(database_obj));
  } catch (error: any) {
    console.error("in api/propagation/route.ts: ", error);
    return new NextResponse("404");
  }
}
