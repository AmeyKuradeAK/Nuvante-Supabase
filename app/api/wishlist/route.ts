import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

function popElement(array: any[], victim: any) {
  return array.filter((element) => element !== victim);
}

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0]?.emailAddress;

  if (!user || !global_user_email) {
    console.log("No active session is found");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Fetch current client data
    const { data: existingClient, error: fetchError } = await supabase
      .from("clients")
      .select("wishlist")
      .eq("email", global_user_email)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    let updatedWishlist = existingClient?.wishlist || [];

    if (body.append) {
      // Add identifier only if it doesn't exist
      if (!updatedWishlist.includes(body.identifier)) {
        updatedWishlist.push(body.identifier);
      }
    } else {
      // Remove identifier
      updatedWishlist = popElement(updatedWishlist, body.identifier);
    }

    // Update wishlist in database
    const { error: updateError } = await supabase
      .from("clients")
      .update({ wishlist: updatedWishlist })
      .eq("email", global_user_email);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: "Wishlist updated" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in wishlist route:", error);
    return NextResponse.json({ message: "Bad Request", error: error.message }, { status: 400 });
  }
}
