import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function POST(request: Request) {
  const user = await currentUser();

  try {
    const body = await request.json();
    const { every, id } = body;

    const invalidArguments = !every && (!id || id === ""); // no 'every' & no valid id

    if (invalidArguments) {
      console.warn("Invalid request: Missing or invalid 'id'");
      return NextResponse.json({ message: "Invalid identifier" }, { status: 400 });
    }

    if (every) {
      // Fetch all products
      const { data: allProducts, error } = await supabase.from("products").select("*");

      if (error) {
        throw error;
      }

      return NextResponse.json(allProducts, { status: 200 });
    } else {
      // Fetch single product by ID
      const { data: singleProduct, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json(singleProduct, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error in /api/propagation/route.ts:", error);
    return NextResponse.json(
      { message: "Error fetching product data", error: error.message },
      { status: 500 }
    );
  }
}
