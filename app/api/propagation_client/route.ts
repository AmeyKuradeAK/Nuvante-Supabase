import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function GET() {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();

  if (!user || !global_user_email) {
    return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
  }

  try {
    const { data: clientData, error } = await supabase
      .from("clients")
      .select("*")
      .eq("email", global_user_email)
      .maybeSingle(); // Avoid throwing if no rows

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ message: "Database error", error }, { status: 500 });
    }

    if (!clientData) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const response = {
      ...clientData,
      wishlist: clientData.wishlist || [],
      cart: clientData.cart || [],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Unhandled error in propagation_client API:", error);
    return NextResponse.json(
      {
        message: "Error fetching client data",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
