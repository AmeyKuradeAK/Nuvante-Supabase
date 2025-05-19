import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Client propagation api, used to propagate a specific client's data to a client side code.
 * Returns proper HTTP status codes and structured responses.
 */

export async function GET() {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;

  if (!user || !global_user_email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const database_obj = await clientModel.findOne({ email: global_user_email });
    
    if (!database_obj) {
      return NextResponse.json({ wishlist: [], cart: [] }, { status: 200 });
    }

    // Only return non-sensitive fields
    const safeProfile = {
      firstName: database_obj.firstName,
      lastName: database_obj.lastName,
      email: database_obj.email,
      address: database_obj.address,
      cart: database_obj.cart,
      wishlist: database_obj.wishlist,
      // Add any other non-sensitive fields you want to expose
    };

    return NextResponse.json(safeProfile);
  } catch (error: any) {
    console.error("Error in propagation_client route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
