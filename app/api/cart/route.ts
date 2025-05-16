import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase"; // centralized supabase client

function popElement(array: any[], victim: any) {
  return array.filter((element) => element !== victim);
}

export async function POST(request: any) {
  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const clerk_id = user.id;

  try {
    const body = await request.json();

    // Supabase flow only
    const { data: client, error } = await supabase
      .from("clients")
      .select("cart")
      .eq("clerk_id", clerk_id)
      .single();

    if (error || !client) {
      console.error("Supabase client fetch error:", error);
      return new NextResponse("Client not found", { status: 404 });
    }

    let cart = client.cart || [];

    if (body.append) {
      if (!cart.includes(body.identifier)) {
        cart.push(body.identifier);
      }
    } else {
      cart = popElement(cart, body.identifier);
    }

    const { error: updateError } = await supabase
      .from("clients")
      .update({ cart })
      .eq("clerk_id", clerk_id);

    if (updateError) {
      console.error("Supabase cart update error:", updateError);
      return new NextResponse("Failed to update cart", { status: 500 });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error in cart POST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
